# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 后端核心配置模块"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

def _load_dotenv(path):
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)

_load_dotenv(BASE_DIR / ".env")

class Config:
    # Flask 基础
    ENV = os.environ.get("FLASK_ENV", "development")
    DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"
    SECRET_KEY = os.environ.get("SECRET_KEY", "RespiCare360-FlaskSecret-Medical-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "RespiCare360-JWTSecretKey-2026-COPD")
    JWT_ACCESS_TOKEN_EXPIRES_HOURS = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_HOURS", 24))

    # MySQL 8.0 关系库
    MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
    MYSQL_PORT = int(os.environ.get("MYSQL_PORT", 3306))
    MYSQL_USER = os.environ.get("MYSQL_USER", "root")
    MYSQL_PASSWORD = os.environ.get("MYSQL_PASSWORD", "bb20030408AZ")
    MYSQL_DB = os.environ.get("MYSQL_DB", "respicare_db")
    MYSQL_CHARSET = "utf8mb4"

    # Neo4j 5.x 知识图谱
    NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "TwinAdmin2026!")
    NEO4J_DATABASE = os.environ.get("NEO4J_DATABASE", "neo4j")

    # Redis 高速缓存 (选配，未启动时自动平滑回退至内存缓存)
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # 服务监听
    HOST = os.environ.get("SERVER_HOST", "0.0.0.0")
    PORT = int(os.environ.get("SERVER_PORT", 5001))
