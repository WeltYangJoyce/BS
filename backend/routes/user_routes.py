from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from flask_jwt_extended import create_access_token

from database import SessionLocal
from models import User

user_bp = Blueprint("user", __name__)


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return {"error": "Invalid JSON"}, 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return {"error": "Missing fields"}, 400

    db: Session = SessionLocal()

    if db.query(User).filter(User.username == username).first():
        return {"error": "Username already exists"}, 400

    if db.query(User).filter(User.email == email).first():
        return {"error": "Email already exists"}, 400

    new_user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email
        }
    }, 201


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return {"error": "Invalid JSON"}, 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"error": "Missing fields"}, 400

    db: Session = SessionLocal()
    user = db.query(User).filter(User.username == username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return {"error": "Invalid username or password"}, 401

    # 🔑 核心：生成 JWT
    access_token = create_access_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }), 200
