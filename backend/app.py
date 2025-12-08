from flask import Flask
from flask_cors import CORS
from routes.user_routes import user_bp
from database import init_db

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "your-secret"
CORS(app)

# Register routes
app.register_blueprint(user_bp, url_prefix="/api")

# init database
init_db()

@app.route("/")
def home():
    return {"message": "Backend is running"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
