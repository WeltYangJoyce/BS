# backend/routes/image_routes.py
from flask import Blueprint, request
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
import os
from utils.gps_helper import reverse_geocode
from utils.thumbs import create_thumbnail
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request
)

from PIL import Image as PILImage
import exifread
from utils.exif_tag_helper import generate_exif_tags

from database import SessionLocal, UPLOAD_DIR
from models import Image, ImageLike, Tag,image_tags,User
from sqlalchemy import func, desc



image_bp = Blueprint("image", __name__, url_prefix="/api")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

ORIGINAL_DIR = "original"
THUMB_DIR = "thumbs"

# =============================
# 工具函数
# =============================
def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_exif_time(filepath: str) -> str | None:
    try:
        with open(filepath, "rb") as f:
            tags = exifread.process_file(f, details=False)
        if "EXIF DateTimeOriginal" in tags:
            return str(tags["EXIF DateTimeOriginal"])
    except Exception as e:
        print("EXIF parse failed:", e)

    return None

def extract_exif_gps(filepath: str):
    """
    从 EXIF 中提取 GPS 坐标 (lat, lon)
    返回 (latitude, longitude) 或 None
    """
    try:
        with open(filepath, "rb") as f:
            tags = exifread.process_file(f, details=False)

        def _convert_to_degrees(value):
            d = float(value.values[0].num) / float(value.values[0].den)
            m = float(value.values[1].num) / float(value.values[1].den)
            s = float(value.values[2].num) / float(value.values[2].den)
            return d + (m / 60.0) + (s / 3600.0)

        if (
            "GPS GPSLatitude" in tags and
            "GPS GPSLatitudeRef" in tags and
            "GPS GPSLongitude" in tags and
            "GPS GPSLongitudeRef" in tags
        ):
            lat = _convert_to_degrees(tags["GPS GPSLatitude"])
            if tags["GPS GPSLatitudeRef"].values != "N":
                lat = -lat

            lon = _convert_to_degrees(tags["GPS GPSLongitude"])
            if tags["GPS GPSLongitudeRef"].values != "E":
                lon = -lon
            
            return lat, lon

    except Exception as e:
        print("GPS parse failed:", e)

    return None

def extract_exif_device(filepath: str):
    """
    从 EXIF 中提取拍摄设备信息
    """
    try:
        with open(filepath, "rb") as f:
            tags = exifread.process_file(f, details=False)

        make = tags.get("Image Make")
        model = tags.get("Image Model")

        return {
            "make": str(make) if make else None,
            "model": str(model) if model else None
        }

    except Exception as e:
        print("EXIF device parse failed:", e)
        return None

def format_gps(lat, lon):
    """
    将 GPS 坐标格式化为人类可读字符串
    例：30.2704° N, 120.1182° E
    """
    lat_dir = "N" if lat >= 0 else "S"
    lon_dir = "E" if lon >= 0 else "W"

    lat_str = f"{abs(lat):.4f}° {lat_dir}"
    lon_str = f"{abs(lon):.4f}° {lon_dir}"

    return f"{lat_str}, {lon_str}"


# =============================
# POST /api/images  上传图片
# =============================
import os
from datetime import datetime
import uuid

@image_bp.route("/images", methods=["POST"])
@jwt_required()
def upload_image():
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    # === 1️⃣ 文件校验 ===
    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    file_ext = os.path.splitext(file.filename)[1].lower()

    # === 2️⃣ 用户确认的 tags ===
    tags_raw = request.form.get("tags", "")
    tag_names = [t.strip() for t in tags_raw.split(",") if t.strip()]

    # === 3️⃣ 创建 Image 占位记录 ===
    image = Image(
        user_id=user_id,
        filename="",
        thumbnail_filename="",
        resolution_width=0,
        resolution_height=0,
        exif_time=None,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    # === 4️⃣ 生成文件名 ===
    from datetime import datetime
    import uuid

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = uuid.uuid4().hex[:8]
    base_filename = f"User{user_id}_Image{image.id}_{timestamp}_{unique_id}"
    new_filename = f"{base_filename}{file_ext}"

    # === 5️⃣ 保存文件 ===
    original_path = os.path.join(UPLOAD_DIR, ORIGINAL_DIR, new_filename)
    os.makedirs(os.path.dirname(original_path), exist_ok=True)
    file.save(original_path)

    pil_img = PILImage.open(original_path)
    width, height = pil_img.size

    thumb_filename = f"{base_filename}.jpg"
    thumb_path = os.path.join(UPLOAD_DIR, THUMB_DIR, new_filename)
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    create_thumbnail(
        src_path=original_path,
        dst_path=thumb_path,
        max_size=256,
        quality=80
    )

    exif_time = extract_exif_time(original_path)

    # === 6️⃣ 更新 Image ===
    image.filename = f"{ORIGINAL_DIR}/{new_filename}"
    image.thumbnail_filename = f"{THUMB_DIR}/{new_filename}"
    image.resolution_width = width
    image.resolution_height = height
    image.exif_time = exif_time

    # === 7️⃣ 绑定 Tag ===
    for name in tag_names:
        tag = db.query(Tag).filter(Tag.name == name).first()
        if not tag:
            tag = Tag(name=name)
            db.add(tag)
            db.flush()
        image.tags.append(tag)

    db.commit()

    return {
        "id": image.id,
        "url": f"/uploads/{image.filename}",
        "thumbnail_url": f"/uploads/{image.thumbnail_filename}",
        "tags": tag_names,
    }


@image_bp.route("/images/analyze", methods=["POST"])
@jwt_required()
def analyze_image_exif():
    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    # === 1️⃣ 用 PIL 读取分辨率（不落盘）===
    try:
        pil_img = PILImage.open(file.stream)
        width, height = pil_img.size
    except Exception:
        return {"error": "Invalid image"}, 400

    # === 2️⃣ EXIF 解析（需要临时文件）===
    import tempfile

    exif_time = None
    gps = None
    device_info = None

    with tempfile.NamedTemporaryFile(delete=True) as tmp:
        file.stream.seek(0)
        tmp.write(file.stream.read())
        tmp.flush()

        exif_time = extract_exif_time(tmp.name)
        gps = extract_exif_gps(tmp.name)
        device_info = extract_exif_device(tmp.name)

    # === 3️⃣ location 美化 ===
    location = format_gps(*gps) if gps else None

    gps_info = None
    if gps:
        gps_info = {
            "lat": gps[0],
            "lon": gps[1],
        }

    # === 4️⃣ 统一使用 generate_exif_tags ===
    suggested_tags = generate_exif_tags(
        exif_time=exif_time,
        width=width,
        height=height,
        gps_info=gps_info,
        device_info=device_info,
    )

    return {
        "exif": {
            "time": exif_time,
            "width": width,
            "height": height,
            "location": location,
            "device": device_info,
        },
        "suggested_tags": suggested_tags,
    }


# =============================
# GET /api/images  图片列表（支持排序）
# =============================
from flask import request
from flask_jwt_extended import (
    verify_jwt_in_request,
    get_jwt_identity
)
from sqlalchemy.orm import Session
from sqlalchemy import func

@image_bp.route("/images", methods=["GET"])
def list_images():
    db: Session = SessionLocal()
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except Exception:
        pass

    sort = request.args.get("sort", "time")
    tag_param = request.args.get("tag")
    username_param = request.args.get("username")
    image_id_param = request.args.get("image_id")  # 新增
    print(image_id_param)
    tag_names = [t.strip() for t in tag_param.split(",")] if tag_param else []

    query = db.query(Image)

    # 精确 Image ID 查询
    if image_id_param:
        if image_id_param.isdigit():
            query = query.filter(Image.id == int(image_id_param))
        else:
            return {"images": [], "error": "Invalid image_id"}, 400

    # 标签筛选
    elif tag_names:
        query = query.join(Image.tags).filter(Tag.name.in_(tag_names)).distinct()

    # 用户名筛选
    elif username_param:
        query = query.join(User, Image.user).filter(
            User.username.ilike(f"%{username_param}%")
        )

    images = query.all()

    # 排序逻辑
    if sort == "hot":
        images.sort(
            key=lambda img: (
                (img.likes or 0) + (img.views or 0),  # hot程度
                img.likes or 0,                        # likes多的优先
                img.upload_time                         # 上传晚的优先
            ),
            reverse=True  # 倒序，让最大值在前
        )
    else:
        images.sort(key=lambda img: img.upload_time, reverse=True)


    # liked 状态
    liked_image_ids = set()
    if user_id:
        liked_image_ids = {il.image_id for il in db.query(ImageLike).filter(ImageLike.user_id == user_id).all()}

    # tag 使用次数
    tag_usage = dict(db.query(Tag.name, func.count(image_tags.c.image_id))
                     .join(image_tags)
                     .group_by(Tag.id)
                     .all())

    result = []
    for img in images:
        primary_tag = max(img.tags, key=lambda t: tag_usage.get(t.name, 0)).name if img.tags else "nullTag"
        result.append({
            "id": img.id,
            "url": f"/uploads/{img.filename}",
            "thumbnail_url": f"/uploads/{img.thumbnail_filename}",
            "width": img.resolution_width,
            "height": img.resolution_height,
            "likes": img.likes,
            "views": img.views,
            "liked": img.id in liked_image_ids,
            "upload_time": img.upload_time.isoformat(),
            "tags": [t.name for t in img.tags],
            "primary_tag": primary_tag,
            "username": img.user.username
        })

    return {"images": result}



# =============================
# DELETE /api/images/<id>
# =============================
@image_bp.route("/images/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id: int):
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    if image.user_id != user_id:
        return {"error": "Forbidden"}, 403

    for path in [image.filename, image.thumbnail_filename]:
        full_path = os.path.join(UPLOAD_DIR, path)
        if os.path.exists(full_path):
            os.remove(full_path)

    db.delete(image)
    db.commit()

    return {"message": "Image deleted"}


# =============================
# POST /api/images/<id>/view
# =============================
@image_bp.route("/images/<int:image_id>/view", methods=["POST"])
def view_image(image_id: int):
    db: Session = SessionLocal()

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    image.views += 1
    db.commit()

    return {"views": image.views}


# =============================
# POST /api/images/<id>/like
# =============================
@image_bp.route("/images/<int:image_id>/like", methods=["POST"])
@jwt_required()
def toggle_like(image_id: int):
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    like = (
        db.query(ImageLike)
        .filter(
            ImageLike.user_id == user_id,
            ImageLike.image_id == image_id
        )
        .first()
    )

    if like:
        db.delete(like)
        image.likes = max(image.likes - 1, 0)
        db.commit()
        return {"liked": False, "likes": image.likes}

    new_like = ImageLike(user_id=user_id, image_id=image_id)
    db.add(new_like)
    image.likes += 1
    db.commit()

    return {"liked": True, "likes": image.likes}


# =============================
# GET /api/images/mine
# =============================
@image_bp.route("/images/mine", methods=["GET"])
@jwt_required()
def list_my_images():
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    images = (
        db.query(Image)
        .filter(Image.user_id == user_id)
        .order_by(Image.upload_time.desc())
        .all()
    )

    result = []
    for img in images:
        result.append({
            "id": img.id,
            "url": f"/uploads/{img.filename}",
            "thumbnail_url": f"/uploads/{img.thumbnail_filename}",
            "width": img.resolution_width,
            "height": img.resolution_height,
            "likes": img.likes,
            "views": img.views,
            "upload_time": img.upload_time.isoformat(),
            "tags": [t.name for t in img.tags],  # ✅ 添加 tags
            "primary_tag": img.tags[0].name if img.tags else "nullTag",
        })
    return {"images": result}




@image_bp.route("/images/<int:image_id>", methods=["PATCH"])
@jwt_required()
def edit_image(image_id: int):
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    if image.user_id != user_id:
        return {"error": "Forbidden"}, 403

    # 处理 tags
    tags_raw = request.form.get("tags")
    if tags_raw is not None:
        tag_names = [t.strip() for t in tags_raw.split(",") if t.strip()]
        new_tags = []
        for name in tag_names:
            tag = db.query(Tag).filter(Tag.name == name).first()
            if not tag:
                tag = Tag(name=name)
                db.add(tag)
                db.flush()
            new_tags.append(tag)
        image.tags = new_tags  # 替换原有 tags

    # 处理文件替换
    if "file" in request.files:
        file = request.files["file"]
        if file.filename == "":
            return {"error": "Empty filename"}, 400
        if not allowed_file(file.filename):
            return {"error": "File type not allowed"}, 400

        # 删除原文件
        for path in [image.filename, image.thumbnail_filename]:
            full_path = os.path.join(UPLOAD_DIR, path)
            if os.path.exists(full_path):
                os.remove(full_path)

        # 保存新文件
        file_ext = os.path.splitext(file.filename)[1].lower()
        from datetime import datetime
        import uuid
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        base_filename = f"User{user_id}_Image{image.id}_{timestamp}_{unique_id}"
        new_filename = f"{base_filename}{file_ext}"

        original_path = os.path.join(UPLOAD_DIR, ORIGINAL_DIR, new_filename)
        os.makedirs(os.path.dirname(original_path), exist_ok=True)
        file.save(original_path)

        pil_img = PILImage.open(original_path)
        width, height = pil_img.size

        thumb_path = os.path.join(UPLOAD_DIR, THUMB_DIR, new_filename)
        os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
        pil_img.copy().save(thumb_path)

        exif_time = extract_exif_time(original_path)

        image.filename = f"{ORIGINAL_DIR}/{new_filename}"
        image.thumbnail_filename = f"{THUMB_DIR}/{new_filename}"
        image.resolution_width = width
        image.resolution_height = height
        image.exif_time = exif_time

    db.commit()

    return {
        "id": image.id,
        "url": f"/uploads/{image.filename}",
        "thumbnail_url": f"/uploads/{image.thumbnail_filename}",
        "tags": [t.name for t in image.tags],
        "width": image.resolution_width,
        "height": image.resolution_height,
    }

# =============================
# GET /api/images/recommend
# 轮播专用接口，返回热门/推荐前 N 张图片
# =============================
@image_bp.route("/images/recommend", methods=["GET"])
def recommend_images():
    db: Session = SessionLocal()

    # 可选：支持前端传 limit
    limit = request.args.get("limit", 5, type=int)

    # 按热度排序（views + likes）
    images = db.query(Image).all()
    images.sort(
        key=lambda img: (
            (img.likes or 0) + (img.views or 0),
            img.likes or 0,
            img.upload_time
        ),
        reverse=True
    )

    # 取前 N 张
    images = images[:limit]

    result = []
    for img in images:
        primary_tag = img.tags[0].name if img.tags else "nullTag"
        result.append({
            "id": img.id,
            "url": f"/uploads/{img.filename}",
            "thumbnail_url": f"/uploads/{img.thumbnail_filename}",
            "width": img.resolution_width,
            "height": img.resolution_height,
            "likes": img.likes,
            "views": img.views,
            "tags": [t.name for t in img.tags],
            "primary_tag": primary_tag,
            "username": img.user.username
        })

    return {"images": result}
