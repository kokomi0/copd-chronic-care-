# 智肺呼吸 (RespiCare 360) 系统架构设计说明书 (v1.2)
## —— 慢阻肺数字化智慧管理与知识图谱协同平台

---

## 1. 系统概述与业务定位

**智肺呼吸 (RespiCare 360)** 是一套面向慢性阻塞性肺疾病 (COPD) 全病程管理的现代化数字医疗系统。系统围绕 **GOLD 2024 (全球慢阻肺倡议)** 最新指南规范，通过 **“关系型数据库 (PostgreSQL) + 图数据库 (Neo4j 5.x with APOC Core)”** 的双库协同架构，打破传统慢病管理数据孤岛。

系统全面支持 **电脑桌面宽屏 (PC 端 ≥ 1024px)** 与 **手机移动端 (Mobile 端 < 768px)** 的高保真自适应响应式布局，满足五大角色在不同终端场景下的工作需要：
- **患者 (Patient)**：便捷打卡、急性加重一键上报、用药闹钟、蓝牙物联、康复图谱探索与脱敏档案。
- **医生 (Doctor)**：患者全景图谱、GOLD E 组急性加重雷达预警、临床处置复核、三联用药评估与科研队列。
- **护士 (Nurse)**：病区监控大盘、漏卡一键催办催缴、应急初筛分诊、实操视频宣教、疫苗预约核销。
- **院长 (Director)**：全院慢病综合管理驾驶舱、急性加重与再入院 KPI、医护负荷排行、临床路径质控。
- **技术运维 (Tech Admin)**：Neo4j 拓扑性能与 APOC 过程监控、RBAC 角色权限、脱敏虚拟节点配置、双写调度。

---

## 2. 总体架构拓扑图

```mermaid
flowchart TB
    subgraph ClientLayer [终端交互层 - 电脑/手机全场景自适应]
        direction TB
        C1["🖥️ PC 临床管理端 (≥1024px)<br>宽屏三栏工作台 / 质控大屏 / 图谱分析"]
        C2["📱 移动随访端 (<768px)<br>金刚区网格 / 底部4-Tab / 触控交互"]
        C3["📟 IoT 智能硬件<br>便携蓝牙肺功能仪 / 脉搏血氧仪"]
    end

    subgraph GatewayLayer [接入与安全网关]
        direction TB
        GW["API Gateway / Nginx 反向代理 (HTTPS/WSS)"]
        RateLimit["Redis 60s 验证码防刷与限流"]
        JWTAuth["JWT 鉴权中间件 + RBAC 5大角色权限过滤器"]
    end

    subgraph ServiceLayer [后端业务服务层 - FastAPI (Python 3.14)]
        direction TB
        AuthSvc["认证服务 (手机验证码 / 工号密码 / 双因子)"]
        PatientSvc["患者服务 (CAT/mMRC 量表 / 加重上报 / 蓝牙同步)"]
        DoctorSvc["医生临床服务 (GOLD E 预警雷达 / 方案调整 / 线上问诊)"]
        NurseSvc["护理工作台 (病区打卡监控 / 漏卡催办 / 应急初筛)"]
        DirectorSvc["管理驾驶舱 (慢病大屏 / 再入院监控 / 科研多维导出)"]
        AdminSvc["运维中心 (APOC 性能监控 / 灰度发布 / 双写调度)"]
        GraphSvc["图谱引擎 (本体检索 / apoc.create.vNode 脱敏中间件)"]
    end

    subgraph StorageLayer [双库协同持久化引擎]
        direction TB
        subgraph RelationalDB [关系型数据库 - PostgreSQL 15+]
            PG1["用户账户与手机号 (RBAC)"]
            PG2["处方与吸入装置依从性"]
            PG3["IoT 遥测数据明细"]
            PG4["全链路操作审计日志"]
        end

        subgraph GraphDB [图数据库 - Neo4j 5.x + APOC Core]
            N1["(:Patient) 节点与金指标"]
            N2["(:Observation) 每日打卡时序"]
            N3["(:Exacerbation) 急性加重红色事件"]
            N4["(:Vaccination) 疫苗预防档案"]
            N5["COPD 临床本体知识库 (疾病/症状/药物/相互作用)"]
            N6["(Virtual:COPDTrend) APOC 虚拟脱敏聚合节点"]
        end

        subgraph Cache [高速缓存 - Redis 7.x]
            RD1["短信验证码 (60s 倒计时 / TTL 300s)"]
            RD2["JWT Token 黑名单 & 用户 Session"]
        end
    end

    ClientLayer --> GW
    GW --> RateLimit
    GW --> JWTAuth
    JWTAuth --> ServiceLayer
    ServiceLayer --> StorageLayer
    AdminSvc -.->|CDC 双写一致性补偿| RelationalDB
    AdminSvc -.->|Bolt 拓扑监控| GraphDB
```

---

## 3. 双库分工与数据一致性机制

| 维度 | PostgreSQL (关系库) | Neo4j 5.x (图数据库) |
| :--- | :--- | :--- |
| **存储重点** | 强一致性业务：账号凭证、手机号、密码 Hash (bcrypt)、工号、短信验证码记录、RBAC 角色权限、设备裸数据流、审计日志。 | 拓扑图谱业务：患者生命周期演变关系、CAT/mMRC 纵向时序链、急性加重级联事件、疫苗覆盖网络、GOLD A/B/E 动态分群、医学本体知识库。 |
| **主要实体** | `users`, `patient_profiles`, `staff_profiles`, `audit_logs`, `inhalation_prescriptions`, `device_telemetry` | `Patient`, `Observation`, `Exacerbation`, `Vaccination`, `Disease`, `Symptom`, `Medication`, `Doctor` |
| **写入方式** | 事务保证 ACID 写入，生成标准 Snowflake/UUID 主键。 | 通过后端驱动写入图谱，以 `patient_code` 为锚点关联图节点。 |
| **隐私保护** | 存储真名与手机号，经严格权限鉴权访问。 | 仅存脱敏编码 (`anon_code`)，对外暴露经由 `apoc.create.vNode` 动态虚拟脱敏。 |

### 双写一致性与 CDC 补偿设计
1. **主写入链路**：患者注册或关键打卡首先在 PostgreSQL 提交核心事务，保证用户凭证与法律合规审计可信。
2. **异步投影入图**：提交成功后，由服务层向 Neo4j 写入对应 `(Patient)-[:HAS_OBSERVATION]->(Observation)` 关系。
3. **一致性检查器 (CDC/补偿)**：技术运维模块 `[T09]` 内置健康检查任务，定期比对 PG 提交序列与 Neo4j 节点数，发现缺失自动重放补偿队列，保证网络闪断下的最终一致性。

---

## 4. Neo4j APOC 虚拟节点脱敏机制规范

根据国家医疗健康信息互联互通标准化成熟度测评与 HIPAA 规范，系统**严格杜绝前端直连 Neo4j 裸数据库**，所有查询均需经过后端 API 网关，并通过 APOC 过程生成虚拟节点 (`apoc.create.vNode`)，隐藏内部物理属性与敏感主键。

### 脱敏 Cypher 核心实现模式：
```cypher
// 示例：查询患者近 30 天慢阻肺趋势，生成脱敏 COPDTrend 虚拟节点
MATCH (p:Patient {anon_code: $anon_code})
OPTIONAL MATCH (p)-[:HAS_OBSERVATION]->(o:Observation)
WHERE o.date >= date() - duration('P30D')
WITH p, count(o) AS checkin_days, avg(o.cat_score) AS avg_cat, avg(o.spo2) AS avg_spo2
OPTIONAL MATCH (p)-[:HAS_EXACERBATION]->(e:Exacerbation)
WHERE e.onset_date >= date() - duration('P365D')
WITH p, checkin_days, avg_cat, avg_spo2, count(e) AS exac_1y_count
// 调用 APOC 生成内存虚拟节点返回，不持久化敏感数据
CALL apoc.create.vNode(['COPDTrend'], {
  anon_id: p.anon_code,
  gold_group: p.gold_group,
  active_rate_30d: round((checkin_days * 1.0 / 30.0) * 100, 1),
  cat_index: round(avg_cat, 1),
  spo2_baseline: round(avg_spo2, 1),
  annual_exacerbation_count: exac_1y_count,
  risk_level: CASE
    WHEN exac_1y_count >= 2 OR avg_cat >= 20 THEN 'HIGH_DANGER'
    WHEN exac_1y_count = 1 OR avg_cat >= 10 THEN 'MEDIUM_WARNING'
    ELSE 'SAFE_STABLE'
  END,
  desensitized_at: datetime()
}) YIELD node AS trendNode
RETURN trendNode;
```

---

## 5. 前端自适应设计规范 (PC + 手机双模无缝切换)

系统采用 **CSS Fluid Container + Flex/Grid 流式断点** 架构，实现单一代码库无缝适配任意屏幕：

1. **桌面宽屏 (Desktop ≥ 1024px)**：
   - **布局**：顶部品牌控制台 + 左侧收折式快捷导航 (240px/64px) + 右侧多列复合仪表盘。
   - **视觉特点**：卡片式现代微质感、悬浮微阴影、支持三栏并行（如左侧患者列表、中间打卡时序折线图、右侧知识图谱拓扑）。
2. **平板中屏 (Tablet 768px ~ 1023px)**：
   - **布局**：双列网格自动折叠、侧边栏自动变为抽屉式菜单。
3. **手机窄屏 (Mobile < 768px)**：
   - **布局**：流式全宽单列卡片、金刚区 3x3 / 4x2 功能图标阵列、底部 4-Tab 固定导航栏（首页、工作台、图谱、我的）。
4. **演示仿真控制器**：
   - 顶部提供一键切换器：支持在电脑上直接开启“📱 手机视口模拟框 (390x844 iPhone 视口)”或“🖥️ 电脑宽屏全景模式”，方便产品路演、临床评审与测试调试。

---

## 6. 工程代码目录规范

```text
f:\知识图谱项目\
├── docs/                                # 架构设计、数据字典、DDL 与 Cypher 脚本
│   ├── ARCHITECTURE.md                  # 完整系统架构设计说明书 (本文件)
│   ├── DATABASE_POSTGRES.sql            # PostgreSQL DDL 脚本与初始 RBAC 种子
│   └── NEO4J_CYPHER_INIT.cypher         # Neo4j 初始化 Cypher 脚本与本体定义
├── backend/                             # 后端项目 (FastAPI + Python 3.14)
│   ├── app/
│   │   ├── core/                        # 安全、JWT 算法、系统配置
│   │   ├── db/                          # PostgreSQL / Neo4j / Redis 驱动池
│   │   ├── models/                      # Pydantic 规范与实体
│   │   ├── routers/                     # 5 大角色 RESTful 路由与认证
│   │   │   ├── auth.py                  # 短信 60s 倒计时、多角色登录
│   │   │   ├── patient.py               # 患者端 [P01~P10]
│   │   │   ├── doctor.py                # 医生端 [D01~D09]
│   │   │   ├── nurse.py                 # 护士端 [N01~N09]
│   │   │   ├── director.py              # 院长端 [M01~M09]
│   │   │   ├── admin.py                 # 运维端 [T01~T09]
│   │   │   └── graph.py                 # 图谱与 APOC 虚拟脱敏
│   │   ├── services/                    # 知识图谱服务、短信网关与审计服务
│   │   └── main.py                      # FastAPI 入口
│   ├── requirements.txt                 # 生产依赖配置
│   └── run_backend.py                   # 启动脚本
├── web/                                 # 前端项目 (自适应 PC 桌面与手机端)
│   ├── index.html                       # 单页应用入口
│   ├── css/
│   │   ├── theme.css                    # 呼吸青绿 Teal (#00897B) 色彩规范与 Dark/Light
│   │   └── responsive.css               # PC 宽屏三栏与手机流式 Tab 自适应响应样式
│   ├── js/
│   │   ├── config.js                    # 5 角色权限、46+ 功能字典
│   │   ├── store.js                     # 双库前端缓存与 API 适配层
│   │   ├── auth.js                      # 认证模块 (角色选择/60s验证码/密码校验)
│   │   ├── graph-nvl.js                 # 知识图谱 NVL Canvas 交互渲染引擎
│   │   ├── charts.js                    # ECharts 风格 Canvas 医疗图表库
│   │   ├── bluetooth.js                 # 智能血氧/便携肺功能仪蓝牙仿真接入
│   │   ├── roles/                       # 五大角色专属模块实现
│   │   │   ├── patient.js               # [P01~P10] 患者端
│   │   │   ├── doctor.js                # [D01~D09] 医生端
│   │   │   ├── nurse.js                 # [N01~N09] 护士端
│   │   │   ├── director.js              # [M01~M09] 院长端
│   │   │   └── admin.js                 # [T01~T09] 运维端
│   │   └── app.js                       # 调度总控、路由与模态弹窗系统
│   └── assets/
│       └── logo.png                     # 平台品牌 Logo
├── 启动智肺呼吸平台.bat                    # 双击一键本地运行预览 (自动开浏览器)
└── README.md                            # 项目快速上手与使用手册
```
