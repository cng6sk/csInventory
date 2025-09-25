# ======= Build stage =======
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --quiet || npm i --quiet
COPY . .
RUN npm run build

# ======= Run stage =======
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Nginx 反向代理前端 /api -> backend:8080，供容器内调用
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 