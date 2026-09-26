# -*- coding: utf-8 -*-
"""后端配置：从 .env 读取，缺省时用默认值，便于本地直连 Neo4j。"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def _load_dotenv(path):
    """极简 .env 解析：KEY=VALUE，支持 # 注释与空行，避免额外依赖。"""
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
    # ---- Neo4j ----
    NEO4J_URI = os.environ.get("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER = os.environ.get("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD = os.environ.get("NEO4J_PASSWORD", "neo4j")
    NEO4J_DATABASE = os.environ.get("NEO4J_DATABASE", "neo4j")

    # ---- Ollama（本地大模型，供「问医生」提问 AI 使用）----
    OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")

    # ---- Flask ----
    HOST = os.environ.get("BACKEND_HOST", "0.0.0.0")
    PORT = int(os.environ.get("BACKEND_PORT", "5000"))
    DEBUG = os.environ.get("BACKEND_DEBUG", "0") == "1"
