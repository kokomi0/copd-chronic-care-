# 智肺呼吸 (RespiCare 360) 数据库资产目录

本目录包含本平台所使用的关系型数据库与图数据库初始化脚本、结构定义与说明文档。

---

## 1. 文件说明

| 文件名 | 数据库引擎 | 用途说明 |
| :--- | :--- | :--- |
| `schema_mysql.sql` | **MySQL 8.0** | 包含用户表、RBAC 5大角色、患者档案、依从性记录、遥测时序、审计日志等 9 张表及初始种子数据。 |
| `schema_neo4j.cypher` | **Neo4j 5.x** | 包含 COPD 临床医学本体（疾病、症状、药物、康复操）、患者图谱节点与 APOC 虚拟脱敏节点脚本。 |

---

## 2. 数据库快速导入指南

### 2.1 MySQL 8.0 导入
- 默认库名：`respicare_db`
- 导入命令（终端或 Navicat / DataGrip 中直接执行）：
```bash
mysql -u root -p < schema_mysql.sql
```

### 2.2 Neo4j 5.x 导入
- 在 Neo4j Browser 控制台 (http://localhost:7474) 或 cypher-shell 中运行 `schema_neo4j.cypher`。
- *注：若本地未安装 Neo4j，平台后端已内置高可用医学图谱回退引擎，不影响前端知识图谱浏览和功能使用。*
