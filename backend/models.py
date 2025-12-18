# backend/models.py
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


# =============================
# User 表
# =============================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)

    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    # 反向关系
    images = relationship(
        "Image",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# =============================
# Image 表
# =============================

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, autoincrement=True)

    # 外键
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    # 文件信息
    filename = Column(String(255), nullable=False)
    thumbnail_filename = Column(String(255), nullable=False)

    # 上传时间
    upload_time = Column(DateTime, default=datetime.utcnow)

    # EXIF 信息（Phase 2 基础）
    exif_time = Column(String(50), nullable=True)
    exif_location = Column(String(255), nullable=True)

    # 分辨率
    resolution_width = Column(Integer, nullable=True)
    resolution_height = Column(Integer, nullable=True)

    # 热度
    views = Column(Integer, default=0)
    likes = Column(Integer, default=0)

    # 关系
    user = relationship("User", back_populates="images")

# backend/models.py

from sqlalchemy import UniqueConstraint

class ImageLike(Base):
    __tablename__ = "image_likes"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    image_id = Column(
        Integer,
        ForeignKey("images.id", ondelete="CASCADE"),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint("user_id", "image_id", name="uix_user_image_like"),
    )
