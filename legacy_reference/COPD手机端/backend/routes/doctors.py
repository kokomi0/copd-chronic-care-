# -*- coding: utf-8 -*-
"""医生推荐：医生列表 + 每周排班。"""
from flask import Blueprint, jsonify

from database import service

doctors_bp = Blueprint("doctors", __name__, url_prefix="/api")

# 排班里 dayOfWeek 是中文，用它做排序权重（周一=1 … 周日=7）
WEEK_ORDER = {"周一": 1, "周二": 2, "周三": 3, "周四": 4, "周五": 5, "周六": 6, "周日": 7}


@doctors_bp.get("/doctors")
def list_doctors():
    query = (
        "MATCH (d:Doctor) "
        "RETURN properties(d) AS props, "
        "       [(d)-[:HAS_SCHEDULE]->(s:DoctorSchedule) | properties(s)] AS schedules"
    )
    rows = service.run(query)

    doctors = []
    for r in rows:
        props = r["props"] or {}
        schedules = sorted(
            r["schedules"] or [],
            key=lambda s: (WEEK_ORDER.get(s.get("dayOfWeek"), 9), s.get("startTime", "")),
        )
        doctors.append({"doctor": props, "schedules": schedules})

    doctors.sort(key=lambda x: x["doctor"].get("doctorId", ""))
    return jsonify({"ok": True, "count": len(doctors), "doctors": doctors})
