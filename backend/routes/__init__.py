# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 路由蓝图总注册器"""
from .auth import auth_bp
from .patient import patient_bp
from .doctor import doctor_bp
from .nurse import nurse_bp
from .director import director_bp
from .admin import admin_bp
from .graph import graph_bp

def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(patient_bp)
    app.register_blueprint(doctor_bp)
    app.register_blueprint(nurse_bp)
    app.register_blueprint(director_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(graph_bp)
