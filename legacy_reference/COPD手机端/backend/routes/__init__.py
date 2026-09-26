# -*- coding: utf-8 -*-
"""蓝图注册：新增功能模块时，在这里 import 并加入列表即可。"""
from .health import health_bp
from .schema import schema_bp
from .search import search_bp
from .node import node_bp
from .doctors import doctors_bp
from .interactions import interactions_bp
from .symptom import symptom_bp
from .list import list_bp
from .graph import graph_bp
from .ask import ask_bp


def register_blueprints(app):
    for bp in (
        health_bp, schema_bp, search_bp, node_bp,
        doctors_bp, interactions_bp, symptom_bp, list_bp,
        graph_bp, ask_bp,
    ):
        app.register_blueprint(bp)
