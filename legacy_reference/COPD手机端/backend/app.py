# -*- coding: utf-8 -*-
"""慢阻肺健康管理 · 后端服务入口。

启动：双击「启动后端.bat」，或 `python app.py`。
"""
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes import register_blueprints


def create_app():
    app = Flask(__name__)
    # 让中文在返回的 JSON 里直接显示（不转成 \uXXXX）
    app.json.ensure_ascii = False
    # 允许前端（手机浏览器 / localhost:8000）跨域调用本服务
    CORS(app)

    register_blueprints(app)

    @app.get("/")
    def index():
        return jsonify({
            "name": "COPD 后端服务",
            "endpoints": {
                "health": "/api/health",
                "schema": "/api/schema",
                "search": "/api/search?q=关键词&label=Medication",
                "node": "/api/node/<elementId>",
                "doctors": "/api/doctors",
                "interactions": "/api/interactions?q=药物",
                "symptom": "/api/symptom?q=气促",
            },
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"ok": False, "error": "接口不存在"}), 404

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host=Config.HOST, port=Config.PORT, debug=Config.DEBUG)
