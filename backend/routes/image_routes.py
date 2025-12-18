# backend/routes/image_routes.py
from flask import Blueprint, request
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename
import os

from flask_jwt_extended import jwt_required, get_jwt_identity
from PIL import Image as PILImage
import exifread

from database import SessionLocal, UPLOAD_DIR
from models import Image

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
    """
    提取 EXIF 拍摄时间（Phase 2 只要这个）
    """
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
    print("AUTH HEADER =", request.headers.get("Authorization"))
    user_id = int(get_jwt_identity())

    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]

    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    filename = secure_filename(file.filename)

    # 路径准备
    original_path = os.path.join(UPLOAD_DIR, ORIGINAL_DIR, filename)
    os.makedirs(os.path.dirname(original_path), exist_ok=True)

    # 保存原图
    file.save(original_path)

    # 读取尺寸
    pil_img = PILImage.open(original_path)
    width, height = pil_img.size

    # Phase 2：缩略图暂用原图
    thumb_path = os.path.join(UPLOAD_DIR, THUMB_DIR, filename)
    os.makedirs(os.path.dirname(thumb_path), exist_ok=True)
    pil_img.copy().save(thumb_path)

    # EXIF
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
# GET /api/images  图片列表
# =============================
@image_bp.route("/images", methods=["GET"])
def list_images():
    db: Session = SessionLocal()

    images = (
        db.query(Image)
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


# =============================
# DELETE /api/images/<id>
# =============================
@image_bp.route("/images/<int:image_id>", methods=["DELETE"])
@jwt_required()
def delete_image(image_id: int):
    db: Session = SessionLocal()
    user_id = get_jwt_identity()

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    if image.user_id != user_id:
        return {"error": "Forbidden"}, 403

    # 删除文件
    for path in [image.filename, image.thumbnail_filename]:
        full_path = os.path.join(UPLOAD_DIR, path)
        if os.path.exists(full_path):
            os.remove(full_path)

    db.delete(image)
    db.commit()

    return {"message": "Image deleted"}
