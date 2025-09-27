# 🎮 CS饰品投资管理系统

一个CS（Counter-Strike）游戏饰品交易的投资管理系统，帮助玩家系统化管理饰品投资组合，实时追踪收益表现。

## 📖 项目简介

这是一个全栈Web应用，专门为CS饰品投资者和收藏家设计。通过现代化的界面和完善的数据分析功能，帮助用户：

- 🎯 **精确管理**：系统化管理饰品投资组合
- 📊 **数据分析**：实时追踪投资收益和市场表现  
- 💰 **成本控制**：自动计算加权平均成本和盈亏

## ✨ 主要功能

### 🎁 物品管理
- 完整的CS饰品信息管理（中英文名称、Steam ID等）
- 支持与Steam市场数据对接
- 物品详细信息查看和编辑

### 📦 库存管理  
- 实时库存数量追踪
- 自动计算加权平均成本
- 当前持仓价值统计
- 库存概览和详细视图

### 💹 交易记录
- 完整的买入/卖出交易记录
- 交易历史查询和筛选
- 自动计算交易盈亏
- 支持批量交易导入

### 📊 投资分析
- **投资池仪表板**：总投入、当前价值、收益率展示
- **实时盈亏计算**：支持手动输入市场价值
- **投资时间线**：直观展示投资历程

### 📈 数据统计
- 按时间范围的日统计分析
- 盈亏状况和交易活跃度分析
- 多维度数据可视化
- 投资表现趋势图表

## 🏗️ 技术架构

### 后端技术栈
- **Java 21** + **Spring Boot 3.x**
- **MySQL 8.0** 数据库
- **JPA/Hibernate** ORM框架
- **Maven** 项目管理

### 前端技术栈  
- **React 18** + **TypeScript**
- **Vite** 构建工具
- **现代化CSS** 响应式设计
- **Nginx** 生产环境托管

### 部署方案
- **Docker Compose** 一键部署
- **多阶段构建** 优化镜像大小
- **反向代理** 统一API路由
- **数据持久化** MySQL数据卷

## 🚀 快速开始

### 先决条件
- 已安装 Docker 与 Docker Compose（Windows 可使用 Docker Desktop）

### 一键启动
```bash
# 克隆项目
git clone https://github.com/your-username/csinventory.git
cd csinventory

# 构建并启动所有服务
docker compose up -d --build

# 启动（后续使用）
docker compose up -d
```

### 访问应用
启动后，您可以通过以下地址访问：

- 🌐 **前端界面**：http://localhost:3000
- 🔌 **后端API**：http://localhost:9090/api/*  
- 🗄️ **MySQL数据库**：localhost:3307
  - 数据库：`cs_inventory`
  - 用户名：`csuser`
  - 密码：`cspass`

## 📁 项目结构

```
csinventory/
├── 📁 src/main/java/          # Spring Boot 后端
│   ├── 📁 domain/             # 实体模型
│   ├── 📁 service/            # 业务逻辑  
│   ├── 📁 web/                # REST控制器
│   └── 📁 repo/               # 数据访问层
├── 📁 frontend/               # React 前端
│   ├── 📁 src/components/     # React组件
│   ├── 📁 src/lib/            # API客户端
│   └── 📄 nginx.conf          # Nginx配置
├── 📄 docker-compose.yml      # 服务编排
├── 📄 Dockerfile             # 后端镜像
└── 📄 frontend/Dockerfile    # 前端镜像
```

## 🔧 开发指南

### 本地开发环境
```bash
# 后端开发（需要Java 21）
./mvnw spring-boot:run

# 前端开发（需要Node.js）  
cd frontend
npm install
npm run dev  # 开发服务器：http://localhost:5173
```

### 常用命令
```bash
# 查看服务日志
docker compose logs -f backend
docker compose logs -f frontend  
docker compose logs -f mysql

# 停止所有服务
docker compose down

# 重新构建指定服务
docker compose build frontend --no-cache
docker compose build backend --no-cache

# 数据库备份
docker exec csinventory-mysql-1 mysqldump -u csuser -pcspass cs_inventory > backup.sql
```

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者们！

## 📞 联系方式

如果您有任何问题或建议，欢迎通过以下方式联系：

- 📧 提交 [Issue](https://github.com/your-username/csinventory/issues)
- 💬 发起 [Discussion](https://github.com/your-username/csinventory/discussions)

---

⭐ 如果这个项目对您有帮助，请给它一个Star！
