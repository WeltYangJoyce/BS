# backend/app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from database import init_db, UPLOAD_DIR
from routes.user_routes import user_bp
from routes.image_routes import image_bp
from routes.tag_routes import tag_bp

# =============================
# 创建 Flask App
# =============================

app = Flask(__name__)

# =============================
# 基础配置
# =============================

app.config["SECRET_KEY"] = "dev-secret-key"  # Phase 3 可换为环境变量
app.config["JWT_SECRET_KEY"] = "jwt-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Phase 2 不设置过期，后面再加

# =============================
# 扩展初始化
# =============================

CORS(app)
jwt = JWTManager(app)

# =============================
# 数据库初始化
# =============================

init_db()

# =============================
# 注册 Blueprint
# =============================

app.register_blueprint(user_bp, url_prefix="/api")
app.register_blueprint(image_bp, url_prefix="/api")
app.register_blueprint(tag_bp,url_prefix="/api")

# =============================
# 静态文件访问（图片）
# =============================

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    """
    访问路径示例：
    http://localhost:5000/uploads/original/xxx.jpg
    http://localhost:5000/uploads/thumbs/xxx.jpg
    """
    return send_from_directory(UPLOAD_DIR, filename)

from flask_jwt_extended import JWTManager
from flask import jsonify

@jwt.invalid_token_loader
def invalid_token_callback(reason):
    return jsonify({"error": "invalid_token", "reason": reason}), 422

@jwt.unauthorized_loader
def missing_token_callback(reason):
    return jsonify({"error": "missing_token", "reason": reason}), 401


# =============================
# 启动入口
# =============================

if __name__ == "__main__":
    app.run(host='0.0.0.0',port=5000,debug=True)
