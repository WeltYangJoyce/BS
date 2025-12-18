# backend/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# =============================
# 基础路径
# =============================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOAD_DIR = os.path.join(DATA_DIR, "uploads")

ORIGINAL_DIR = os.path.join(UPLOAD_DIR, "original")
THUMB_DIR = os.path.join(UPLOAD_DIR, "thumbs")

# =============================
# 确保目录存在
# =============================

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(ORIGINAL_DIR, exist_ok=True)
os.makedirs(THUMB_DIR, exist_ok=True)

# =============================
# 数据库配置
# =============================

DATABASE_PATH = os.path.join(DATA_DIR, "user.db")
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

# =============================
# 初始化数据库（由 app.py 调用）
# =============================

def init_db():
    import models  # 确保 models 被加载
    Base.metadata.create_all(bind=engine)
