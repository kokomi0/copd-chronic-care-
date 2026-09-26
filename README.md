# 智肺呼吸 (RespiCare 360) · 慢阻肺数字化智慧管理与知识图谱协同平台

[![React 18](https://img.shields.io/badge/Frontend-React_18_%7C_Vite_5-00897B?style=flat-square&logo=react)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Backend-Flask_3.0_%7C_Python_3.12+-004D40?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![Neo4j](https://img.shields.io/badge/Graph_DB-Neo4j_5.x_%7C_APOC-0288D1?style=flat-square&logo=neo4j)](https://neo4j.com/)
[![MySQL 8.0](https://img.shields.io/badge/RDBMS-MySQL_8.0-E65100?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Theme](https://img.shields.io/badge/Theme-Teal_%2300897B-00897B?style=flat-square)](#)

---

## 📖 项目简介 (Project Overview)

**智肺呼吸 (RespiCare 360)** 是一套面向慢性阻塞性肺疾病（COPD）患者全病程闭环管理的商业级数字医疗与临床科研协同平台。平台融合 **关系型数据（MySQL 8.0）** 与 **图数据库技术（Neo4j 5.x + APOC 引擎）**，通过 **React 18 + Vite 5** 前端工程和 **Flask 3.0** 后端微服务，为不同医疗业务主体提供物理级隔离的专业工作空间与临床路径推理支持。

---

## 🌟 核心特性与架构亮点 (Core Features)

### 1. 强路由拦截与 RBAC 多角色物理隔离
- **冷启动守卫 (Auth Guard)**：未授权状态一律强制重定向至 `/login` 认证中心，支持明/密文切换、60s 频控短信验证码与密码双通道登录。
- **角色物理级隔离**：完全移除顶部角色切换下拉框，右上角严格展示只读认证徽章；跨角色越权访问触发守卫并安全回退。
- **五大角色专属工作台**：
  1. 👤 **慢阻肺患者端 (`patient`)**：CAT 评分打卡、SpO2 波动时序、AECOPD 红色急救通道、吸入装置依从性提醒、呼吸康复全景知识图谱。
  2. 👨‍⚕️ **专科医生端 (`doctor`)**：管辖患者全景档案、GOLD 2024 E 组高危加重雷达、时序趋势研判、吸入剂三联阶梯方案调整、图谱循证路径检索。
  3. 👩‍⚕️ **专科护士端 (`nurse`)**：病区打卡监控大盘、漏卡一键短信/电话批量催办、应急接诊初筛分诊、吸入装置实操视频/考核、白夜班交接记录。
  4. 🏥 **管理院长端 (`director`)**：全院慢病运营大盘、30 天再入院阻断指标、GOLD A/B/E 分布漏斗、医护随访达标排行、经营与科研报表导出。
  5. ⚙️ **技术运维端 (`tech_admin`)**：Neo4j 5.x Bolt 连接池监控、Cypher 慢查询毫秒监控、APOC 虚拟脱敏节点 (`vNode`)、全链路安全审计日志。

### 2. 手机 / 平板 / 电脑全响应式自适应
- **电脑端 (≥ 1024px)**：250px 左侧固定侧边栏（6~7 个核心业务菜单）+ 多列卡片网格。
- **平板端 (768px ~ 1023px)**：Mini 侧边栏纯图标折叠模式 + 双列内容网格。
- **手机移动端 (< 768px)**：侧边栏自动隐藏，顶部汉堡按钮唤起侧滑抽屉（Drawer）导航，底部固定 4 大高频 Tab 导航栏，触控区域全面优化。
- **📲 扫码在手机端体验**：一键弹出局域网 Wi-Fi 访问二维码，微信或原生浏览器扫码即刻体验完整移动端。

### 3. 双库协同与 APOC 虚拟脱敏节点
- **MySQL 8.0**：存储用户凭证、CAT 问卷明细、就诊记录与日志，保证 ACID 事务完整性。
- **Neo4j 5.x + APOC**：构建“疾病-症状-用药-装置-疫苗-并发症”多层知识网络，支持基于 Cypher 拓扑的深度推理与临床路径合规质控。

---

## 📂 项目代码目录结构 (Repository Structure)

```text
知识图谱项目/
├── backend/                       # Python Flask 后端微服务
│   ├── routes/                    # RESTful API 路由模块 (auth, patient, doctor, nurse, director, admin, graph)
│   ├── app.py                     # Flask 启动主入口 (Port 5001)
│   ├── config.py                  # 数据库连接与 JWT 配置
│   ├── database.py                # MySQL 连接池与 Neo4j 驱动管理
│   └── requirements.txt           # Python 依赖清单
├── frontend/                      # React 18 + Vite 5 前端应用
│   ├── src/
│   │   ├── components/            # 图表、图标、NVL 图谱、二维码与工作台组件
│   │   ├── context/               # AuthContext 鉴权与全局会话状态
│   │   ├── layouts/               # AppLayout 响应式布局与抽屉导航
│   │   ├── pages/                 # 五大角色工作台页面与登录认证
│   │   ├── routes/                # 强路由拦截与 RBAC 路由表
│   │   ├── services/              # 导航菜单配置、蓝牙 IoT、存储与网络服务
│   │   └── styles/                # 呼吸青绿主题规范与移动端响应式样式
│   ├── vite.config.js             # Vite 代理与 0.0.0.0 局域网监听配置
│   └── package.json               # 前端依赖配置
├── database/                      # 数据库初始化脚本与设计说明
│   ├── schema_mysql.sql           # MySQL 8.0 表结构与测试种子数据
│   ├── schema_neo4j.cypher        # Neo4j 5.x 知识图谱 Cypher 导入脚本
│   └── README.md                  # 数据库架构与配置指引
├── docs/                          # 架构设计与接口文档
│   └── ARCHITECTURE.md            # 系统总体技术架构说明书
├── 启动智肺呼吸平台(React全栈).bat  # 一键启动全栈服务脚本
└── README.md                      # 项目主文档
```

---

## 🚀 极速本地部署与启动指引 (Quick Start)

### 1. 启动后端服务 (Backend)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*后端服务将运行在 `http://127.0.0.1:5001`，健康探针：`http://127.0.0.1:5001/api/health`。*

### 2. 启动前端应用 (Frontend)
```bash
cd frontend
npm install
npm run dev
```
*前端开发服务器将启动在 `http://localhost:5173`，并在局域网同步开放访问（如 `http://192.168.1.10:5173`）。*

### 3. 一键批处理启动 (Windows)
直接双击项目根目录下的 **`启动智肺呼吸平台(React全栈).bat`**，即可自动拉起前后端服务并在浏览器中打开。

---

## 🔑 默认演示测试账号 (Demo Credentials)

> 所有测试账号默认密码统一为：**`123456`**；短信验证码统一为：**`666888`**。

| 角色类型 | 账号 / 手机号 | 真实姓名 | 演示重点业务 |
| :--- | :--- | :--- | :--- |
| **慢阻肺患者** | `13800000001` 或 `PAT2026001` | 张建国 (GOLD 3级 E组) | CAT 症状打卡、SpO2 波动图、红色急救通道 |
| **专科医生** | `DOC8801` 或 `13900000002` | 李华山 (呼吸主任医师) | GOLD E 组雷达、时序研判、三联方案调整 |
| **专科护士** | `NUR6601` 或 `13700000003` | 王春燕 (主管护师) | 漏卡批量催办、应急分诊、排痰操督导 |
| **管理院长** | `DIR0001` 或 `13600000004` | 陈远东 (业务副院长) | 全院驾驶舱、30天再入院阻断、报表导出 |
| **技术运维** | `ADM9901` 或 `13500000005` | 周天成 (系统架构师) | Bolt 拓扑监控、RBAC 矩阵、vNode 脱敏策略 |

---

## 📄 开源许可证与医疗免责声明 (License & Disclaimer)

- 本系统仅供计算机软件与数字化医疗工程研究学习使用，涉及真实诊疗请以持牌临床执业医师面诊医嘱为准。
- License: MIT License.
