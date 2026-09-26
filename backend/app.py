# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - Flask 后端主应用入口"""
import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes import register_routes

# 配置系统日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("respicare.app")

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # 启用全局跨域访问，允许现代自适应前端与移动端无缝调用
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # 注册 5 大角色 RESTful 路由与知识图谱接口
    register_routes(app)

    @app.get("/")
    def index():
        return jsonify({
            "system": "智肺呼吸 (RespiCare 360) —— 慢阻肺数字化智慧管理与知识图谱协同平台",
            "version": "1.2.0-commercial",
            "status": "HEALTHY",
            "architecture": "Flask + MySQL 8.0 + Neo4j 5.x APOC + React Adaptive",
            "roles_supported": ["patient", "doctor", "nurse", "director", "tech_admin"],
            "docs_api": "/api/health"
        })

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "UP",
            "backend": "Flask 3.0",
            "mysql_database": Config.MYSQL_DB,
            "neo4j_uri": Config.NEO4J_URI,
            "port": Config.PORT
        })

    return app

app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting RespiCare 360 Backend on http://{Config.HOST}:{Config.PORT}")
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
