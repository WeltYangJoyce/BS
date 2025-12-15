# backend/routes/image_routes.py
from flask import Blueprint, request
from sqlalchemy.orm import Session
from werkzeug.utils import secure_filename
import os
import json

from PIL import Image as PILImage
import exifread

from database import SessionLocal, UPLOAD_DIR
from models import Image, User

image_bp = Blueprint("image", __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# =============================
# EXIF 工具函数
# =============================
def extract_exif(filepath):
    """
    读取图片 EXIF，返回 dict（只保留有价值字段）
    """
    exif_result = {}

    try:
        with open(filepath, "rb") as f:
            tags = exifread.process_file(f, details=False)

        # 常见有意义的 EXIF 字段
        EXIF_WHITELIST = [
            "Image Make",
            "Image Model",
            "EXIF DateTimeOriginal",
            "EXIF LensModel",
            "EXIF FNumber",
            "EXIF ExposureTime",
            "EXIF ISOSpeedRatings",
            "EXIF FocalLength"
        ]

        for key in EXIF_WHITELIST:
            if key in tags:
                exif_result[key] = str(tags[key])

    except Exception as e:
        # EXIF 失败不影响上传
        print("EXIF parse failed:", e)

    return exif_result


# =============================
# POST /api/images  上传图片（含 EXIF）
# =============================
@image_bp.route("/images", methods=["POST"])
def upload_image():
    db: Session = SessionLocal()

    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        return {"error": "Invalid user"}, 401

    if "file" not in request.files:
        return {"error": "No file provided"}, 400

    file = request.files["file"]
    if file.filename == "":
        return {"error": "Empty filename"}, 400

    if not allowed_file(file.filename):
        return {"error": "File type not allowed"}, 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(UPLOAD_DIR, filename)
    file.save(save_path)

   
    exif_dict = extract_exif(save_path)

    image = Image(
        filename=filename,
        filepath=save_path,
        owner_id=user.id,
        exif_data=json.dumps(exif_dict) if exif_dict else None
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return {
        "message": "Image uploaded",
        "image_id": image.id,
        "exif": exif_dict
    }


# =============================
# GET /api/images  图片列表
# =============================
@image_bp.route("/images", methods=["GET"])
def list_images():
    db: Session = SessionLocal()

    images = db.query(Image).order_by(Image.upload_time.desc()).all()

    result = []
    for img in images:
        result.append({
            "id": img.id,
            "filename": img.filename,
            "owner_id": img.owner_id,
            "upload_time": img.upload_time.isoformat() if img.upload_time else None
        })

    return {"images": result}


# =============================
# DELETE /api/images/<id> 删除图片
# =============================
@image_bp.route("/images/<int:image_id>", methods=["DELETE"])
def delete_image(image_id):
    db: Session = SessionLocal()

    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return {"error": "Unauthorized"}, 401

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        return {"error": "Invalid user"}, 401

    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        return {"error": "Image not found"}, 404

    if image.owner_id != user.id:
        return {"error": "Forbidden"}, 403

    if image.filepath and os.path.exists(image.filepath):
        os.remove(image.filepath)

    db.delete(image)
    db.commit()

    return {"message": "Image deleted"}
