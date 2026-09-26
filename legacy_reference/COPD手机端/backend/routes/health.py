# -*- coding: utf-8 -*-
"""健康检查：确认后端进程 + Neo4j 连接都正常。"""
from flask import Blueprint, jsonify

from database import service

health_bp = Blueprint("health", __name__, url_prefix="/api")


@health_bp.get("/health")
def health():
    try:
        ok, msg = service.verify()
        return jsonify({"ok": True, "neo4j": msg}), 200
    except Exception as e:
        return jsonify({"ok": False, "error": f"{type(e).__name__}: {e}"}), 503
