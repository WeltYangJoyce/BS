
## 项目概览

这是一个前后端分离的图片管理原型：前端使用 React + Vite，后端使用 Flask。主要功能包括用户认证、图片上传、EXIF 解析、缩略图生成、标签管理与基础检索展示。

本仓库包含简明的使用与部署说明；更详细的实验说明、设计细节与测试结果请参阅项目报告：[Report.md](Report.md)。

## 快速开始（本地开发）

1) 后端（开发）

```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

2) 前端（开发）

```bash
cd frontend
npm install
npm run dev
```

3) 一键启动（Docker Compose）
`docker-compose.yml`,`Dockerfile.backend`,`Dockerfile.frontend`为dockers容器相关
```bash
docker-compose up --build
```

提示：开发时通过环境变量 `VITE_API_BASE_URL` 指定后端地址（例如 `http://localhost:5000/api`）。

## 常用命令速查

- 后端本地运行：参见上方后端命令。
- 前端本地运行：参见上方前端命令。
- Docker 一键启动：`docker-compose up --build`。

## 目录概览（简要）

- `backend/`：Flask 应用（入口 `backend/app.py`，路由在 `backend/routes/`，数据库与上传目录在 `backend/data/`）。
- `frontend/`：React 应用（入口 `frontend/src/main.jsx`，API 客户端在 `frontend/src/api/`）。
- 部署相关：`docker-compose.yml`, `Dockerfile.backend`, `Dockerfile.frontend`, `nginx.conf`。

## 重要链接

- 详细实验报告（含系统设计、测试与截图）：[Report.md](Report.md)
- 设计文档：[Design.md](Design.md)
- 后端实现参考：[backend/app.py](backend/app.py)
- 路由实现：`backend/routes/`


