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
from models import Image, ImageLike
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
@image_bp.route("/images", methods=["POST"])
@jwt_required()
def upload_image():
    db: Session = SessionLocal()
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    filename = secure_filename(file.filename)

    # 保存原图
    original_path = os.path.join(UPLOAD_DIR, ORIGINAL_DIR, filename)
    os.makedirs(os.path.dirname(original_path), exist_ok=True)
    file.save(original_path)

    pil_img = PILImage.open(original_path)
    width, height = pil_img.size

    # Phase 2：缩略图暂用原图
    thumb_path = os.path.join(UPLOAD_DIR, THUMB_DIR, filename)
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    pil_img.copy().save(thumb_path)

    exif_time = extract_exif_time(original_path)

    image = Image(
        user_id=user_id,
        filename=f"{ORIGINAL_DIR}/{filename}",
        thumbnail_filename=f"{THUMB_DIR}/{filename}",
        resolution_width=width,
        resolution_height=height,
        exif_time=exif_time,
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return {
        "id": image.id,
        "url": f"/uploads/{image.filename}",
        "thumbnail_url": f"/uploads/{image.thumbnail_filename}",
    }


# =============================
# GET /api/images  图片列表（支持排序）
# =============================
@image_bp.route("/images", methods=["GET"])
def list_images():
    db: Session = SessionLocal()

    # 可选登录（为了 liked 状态）
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except:
        pass

    sort = request.args.get("sort", "time")

    images = db.query(Image).all()

    # 🔥 Python 层排序（核心）
    if sort == "hot":
        print("hot\n")
        images.sort(
        key=lambda img: (
            (img.likes or 0) + (img.views or 0),  # 主：hot
            img.likes or 0,                       # 次：likes
            img.upload_time                       # 再次：新图优先
        ),
            reverse=True
        )
    else:
        print("time\n")
        images.sort(
            key=lambda img: img.upload_time,
            reverse=True
        )

    for img in images:
        print("img_id = ",img.id,",img.like = ",img.likes,",img.view = ",img.views,",hot = ",img.likes+img.views)
        # print(img.likes+img.views)
    liked_image_ids = set()
    if user_id:
        liked_image_ids = {
            il.image_id
            for il in db.query(ImageLike)
            .filter(ImageLike.user_id == user_id)
            .all()
        }

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
            "liked": img.id in liked_image_ids,
            "upload_time": img.upload_time.isoformat(),
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
        })

    return {"images": result}
