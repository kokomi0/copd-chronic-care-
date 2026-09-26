# COPD 后端服务

连接本地 Neo4j 知识图谱，为慢阻肺健康管理 App 提供数据查询接口。

## 技术栈

- Python 3.14 + Flask + flask-cors
- Neo4j 官方驱动 `neo4j`（Bolt 协议）

## 目录结构

```
backend/
├── app.py            # 入口（应用工厂 + 启动）
├── config.py         # 配置（读 .env）
├── database.py       # Neo4j 连接层（全局单例）
├── routes/           # 接口蓝图，按功能拆分
│   ├── health.py     # /api/health   健康检查 + 连接测试
│   ├── schema.py     # /api/schema   图谱标签/关系概览
│   ├── search.py     # /api/search   关键词检索（仓库寻找核心）
│   ├── node.py       # /api/node/<id> 节点 + 邻居详情
│   ├── doctors.py    # /api/doctors  医生列表 + 每周排班
│   ├── interactions.py # /api/interactions 药物相互作用查询
│   ├── symptom.py    # /api/symptom  按症状查疾病/治疗/药物/并发症
│   └── list.py       # /api/list     按标签分类列出节点
├── .env              # 真实连接配置（已 gitignore）
├── .env.example      # 配置模板
├── requirements.txt
└── 启动后端.bat       # 双击启动
```

## 启动

双击 `启动后端.bat`，或在 backend 目录下运行：

```bash
python app.py
```

## 接口说明

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 服务与 Neo4j 连通性检查 |
| GET | `/api/schema` | 所有节点标签 / 关系类型及数量 |
| GET | `/api/search?q=关键词&label=Medication&limit=20` | 按关键词检索节点，`label` 可选 |
| GET | `/api/node/<elementId>` | 节点属性 + 相邻节点与关系 |
| GET | `/api/doctors` | 医生列表 + 每周排班 |
| GET | `/api/interactions?q=药物` | 药物相互作用查询（不带 q 返回全部） |
| GET | `/api/symptom?q=症状` | 按症状分类返回疾病/非药物治疗/药物/并发症 |
| GET | `/api/list?label=标签` | 按标签分类列出节点 |

## 如何新增功能

1. 在 `routes/` 下新建一个蓝图文件（如 `doctors.py`）；
2. 在 `routes/__init__.py` 里 import 并加入注册列表；
3. 业务代码统一通过 `from database import service` 执行 Cypher。

图谱数据模型（节点标签、关系类型）见 `GET /api/schema`。
