# CS Inventory 前端

基于 Vite + React + TypeScript 的简易控制台。

## 开发运行（Windows）

1. 确保后端已运行在 `http://localhost:8080`，并且接口前缀为 `/api`。
2. 安装依赖：
   ```bash
   cd frontend
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```
   默认地址会显示在终端（一般是 `http://localhost:5173`）。

## 代理配置
开发时已在 `vite.config.ts` 配置了代理：访问 `/api/*` 会被转发至 `http://localhost:8080`，避免 CORS 问题。

## 功能
- 创建物品：`/api/items` POST
- 创建交易：`/api/trades` POST（当前需要手填 Item ID）
- 按日统计查询：`/api/stats/daily?start=...&end=...`

## 目录结构
- `src/lib/api.ts`：API 封装
- `src/components/ItemForm.tsx`：物品表单
- `src/components/TradeForm.tsx`：交易表单
- `src/components/DailyStats.tsx`：按日统计视图
- `src/App.tsx`：简易导航与页面
