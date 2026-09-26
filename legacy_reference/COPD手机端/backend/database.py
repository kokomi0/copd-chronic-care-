# -*- coding: utf-8 -*-
"""Neo4j 连接层：全局只维护一个驱动实例，业务代码通过 service 执行 Cypher。

以后所有对图数据库的读写都走这里，避免散落各处的连接字符串。
"""
from neo4j import GraphDatabase

from config import Config


class Neo4jService:
    def __init__(self, uri, user, password, database=None):
        self.database = database
        # 驱动是惰性连接：这里不真正连库，第一次执行查询时才连
        self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def verify(self):
        """测试连通性，返回 (ok, message)。"""
        self._driver.verify_connectivity()
        with self._driver.session(database=self.database) as session:
            n = session.run("MATCH (n) RETURN count(n) AS c").single()["c"]
        return True, f"Neo4j 连接成功，当前数据库共 {n} 个节点"

    def run(self, query, **params):
        """执行只读查询，返回记录列表（每行转成 dict）。"""
        with self._driver.session(database=self.database) as session:
            result = session.run(query, **params)
            return [dict(record) for record in result]

    def close(self):
        self._driver.close()


# 全局单例，app.py 启动时即可使用
service = Neo4jService(
    Config.NEO4J_URI,
    Config.NEO4J_USER,
    Config.NEO4J_PASSWORD,
    Config.NEO4J_DATABASE,
)
