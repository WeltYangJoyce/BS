# backend/routes/image_routes.py
from flask import Blueprint, request
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename
from sqlalchemy import desc
from sqlalchemy.exc import IntegrityError
import os

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    verify_jwt_in_request
)

from PIL import Image as PILImage
import exifread

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
    
    # =============================
    # 1️⃣ 文件校验
    # =============================
    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    # 获取文件扩展名
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    # =============================
    # 2️⃣ Tag 解析（可选）
    # =============================
    tags_raw = request.form.get("tags", "")
    tag_names = [
        t.strip()
        for t in tags_raw.split(",")
        if t.strip()
    ]

    # =============================
    # 3️⃣ 先创建数据库记录，获取 image.id
    # =============================
    # 先创建一个占位的 image 记录
    image = Image(
        user_id=user_id,
        filename="",  # 稍后填充
        thumbnail_filename="",  # 稍后填充
        resolution_width=0,
        resolution_height=0,
        exif_time=None,
    )
    
    db.add(image)
    db.commit()
    db.refresh(image)
    
    # =============================
    # 4️⃣ 生成统一文件名
    # =============================
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # 使用 UUID 确保唯一性
    unique_id = uuid.uuid4().hex[:8]
    base_filename = f"User{user_id}_Image{image.id}_{timestamp}_{unique_id}"
    
    # 保留原文件扩展名
    new_filename = f"{base_filename}{file_ext}"
    
    # =============================
    # 5️⃣ 保存图片
    # =============================
    original_path = os.path.join(UPLOAD_DIR, ORIGINAL_DIR, new_filename)
    os.makedirs(os.path.dirname(original_path), exist_ok=True)
    file.save(original_path)

    pil_img = PILImage.open(original_path)
    width, height = pil_img.size

    thumb_path = os.path.join(UPLOAD_DIR, THUMB_DIR, new_filename)
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    pil_img.copy().save(thumb_path)

    exif_time = extract_exif_time(original_path)
    
    # =============================
    # 6️⃣ 更新数据库记录的文件名
    # =============================
    image.filename = f"{ORIGINAL_DIR}/{new_filename}"
    image.thumbnail_filename = f"{THUMB_DIR}/{new_filename}"
    image.resolution_width = width
    image.resolution_height = height
    image.exif_time = exif_time
    
    db.commit()

    # =============================
    # 7️⃣ 绑定 Tag（核心）
    # =============================
    if tag_names:
        for name in tag_names:
            tag = (
                db.query(Tag)
                .filter(Tag.name == name)
                .first()
            )
            if not tag:
                tag = Tag(name=name)
                db.add(tag)
                db.flush()

            image.tags.append(tag)

        db.commit()

    # =============================
    # 8️⃣ 返回
    # =============================
    return {
        "id": image.id,
        "filename": new_filename,  # 返回新的文件名
        "url": f"/uploads/{image.filename}",
        "thumbnail_url": f"/uploads/{image.thumbnail_filename}",
        "tags": tag_names,
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
