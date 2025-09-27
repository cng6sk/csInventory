# CS Inventory（前后端 Docker 编排）

该项目包含：
- 后端：Spring Boot（端口 9090:8080，接口前缀 `/api`）
- 前端：Vite + React（容器内由 Nginx 托管，端口 3000:80）
- 数据库：MySQL 8.0（端口 3307:3306）

已提供 `docker-compose.yml`，可一键启动三者。

## 先决条件
- 已安装 Docker 与 Docker Compose（Windows 可使用 Docker Desktop）

## 一键启动
```bash
# 在项目根目录构筑
docker compose up -d --build

# 启动
docker compose up -d
```

启动后：
- 前端访问：`http://localhost:3000`
- 后端 API：`http://localhost:9090/api/*`
- MySQL：`localhost:3307`，库：`cs_inventory`，用户：`csuser/cspass`

## 目录与镜像说明
- 根目录 `Dockerfile`：后端（多阶段构建，JDK21），容器端口 8080
- `frontend/Dockerfile`：前端（Node 构建 + Nginx 托管），容器端口 80
- `frontend/nginx.conf`：Nginx 反向代理 `/api` 到 `backend:8080`
- `docker-compose.yml`：三服务编排（mysql/backend/frontend）

## 常用命令
```bash
# 查看日志（按需查看）
docker compose logs -f backend
# 或
docker compose logs -f frontend
# 或
docker compose logs -f mysql

# 停止并移除容器
docker compose down

# 仅重新构建前端
docker compose build frontend --no-cache
# 仅重新构建后端
docker compose build backend --no-cache
```

## 本地开发（可选）
- 后端：`./mvnw spring-boot:run`
- 前端（开发模式）：需安装 Node.js，`cd frontend && npm install && npm run dev`（默认 5173 端口，已配置开发代理至 8080）

## 备注
- 生产部署时建议将 MySQL 数据卷 `db_data` 绑定到宿主机路径，注意备份与权限。
- 如需调整端口或数据库配置，修改 `docker-compose.yml` 与 `src/main/resources/application.yml`（或通过环境变量覆盖）。 