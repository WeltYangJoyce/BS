from flask import Blueprint
from database import SessionLocal
from models import Tag

tag_bp = Blueprint("tag", __name__, url_prefix="/api")

@tag_bp.route("/tags", methods=["GET"])
def list_tags():
    db = SessionLocal()
    tags = db.query(Tag).order_by(Tag.name.asc()).all()

    return {
        "tags": [
            {"id": t.id, "name": t.name}
            for t in tags
        ]
    }
