from flask import Blueprint, request
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User

user_bp = Blueprint("user", __name__)

@user_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    db: Session = SessionLocal()

    if db.query(User).filter(User.username == data["username"]).first():
        return {"error": "Username already exists"}, 400
    
    if db.query(User).filter(User.email == data["email"]).first():
        return {"error": "Email already exists"}, 400

    new_user = User(
        username=data["username"],
        email=data["email"],
        password_hash=generate_password_hash(data["password"])
    )
    db.add(new_user)
    db.commit()

    return {"message": "User registered"}

@user_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    db: Session = SessionLocal()

    user = db.query(User).filter(User.username == data["username"]).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return {"error": "Invalid username or password"}, 401

    return {"message": "Login success"}
