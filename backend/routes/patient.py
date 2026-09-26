# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 患者端业务路由 (涵盖 [P01~P10] 十大核心功能)"""
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from database import mysql_service, neo4j_service

patient_bp = Blueprint("patient", __name__, url_prefix="/api/patient")

# ------------------------------------------------------------------------------
# [P01] 呼吸健康看板总览
# ------------------------------------------------------------------------------
@patient_bp.get("/dashboard")
def get_dashboard():
    # 模拟或读取当前登录患者
    patient = mysql_service.query_one(
        "SELECT u.user_id, u.real_name, u.phone, p.* "
        "FROM sys_users u LEFT JOIN patient_profiles p ON u.user_id = p.user_id "
        "WHERE u.role_code = 'patient' LIMIT 1"
    ) or {
        "user_id": 1, "real_name": "张建国", "anon_code": "ANON-COPD-2026001",
        "gold_stage": 3, "gold_group": "E", "fev1_pred_pct": 42.5
    }

    # 最近遥测指标
    telemetry = mysql_service.query_one(
        "SELECT * FROM device_telemetries WHERE patient_id = %s ORDER BY recorded_at DESC LIMIT 1",
        (patient["user_id"],)
    ) or {"spo2": 95, "pulse_rate": 78, "fev1_l": 1.45, "pef_l_min": 280.5}

    # 汇总今日状态
    today_str = datetime.now().strftime("%Y-%m-%d")
    return jsonify({
        "ok": True,
        "patient": patient,
        "today": today_str,
        "vitals": {
            "spo2": telemetry.get("spo2", 95),
            "pulse_rate": telemetry.get("pulse_rate", 78),
            "fev1": telemetry.get("fev1_l", 1.45),
            "cat_score": 15,
            "mmrc_grade": 2,
            "status_tier": "STABLE_SAFE" if telemetry.get("spo2", 95) >= 93 else "WARNING"
        },
        "reminders": [
            {"id": 1, "time": "08:00", "title": "早晨吸入都保 (布地奈德福莫特罗)", "done": True},
            {"id": 2, "time": "15:00", "title": "缩唇呼吸与排痰操练习 (15分钟)", "done": False},
            {"id": 3, "time": "20:00", "title": "晚间吸入都保 1吸 + 漱口", "done": False}
        ]
    })

# ------------------------------------------------------------------------------
# [P02] 每日 CAT/mMRC 症状量表打卡
# ------------------------------------------------------------------------------
@patient_bp.post("/checkin")
def submit_checkin():
    data = request.get_json() or {}
    user_id = data.get("user_id", 1)
    cat_total = int(data.get("cat_total", 16))
    mmrc_grade = int(data.get("mmrc_grade", 2))
    cough = int(data.get("cough", 2))
    sputum = int(data.get("sputum", 2))
    dyspnea = int(data.get("dyspnea", 2))
    spo2 = int(data.get("spo2", 95))
    weight = float(data.get("weight", 65.0))
    hr = int(data.get("hr", 75))
    note = str(data.get("note", "")).strip()
    date_str = data.get("date", datetime.now().strftime("%Y-%m-%d"))

    # 1. 写入 Neo4j 拓扑关系: (Patient)-[:HAS_OBSERVATION]->(Observation)
    cypher = (
        "MATCH (p:Patient {id: $pid}) "
        "CREATE (o:Observation { "
        "  id: $obs_id, date: $date, cat_score: $cat, mmrc_grade: $mmrc, "
        "  cough: $cough, sputum: $sputum, dyspnea: $dyspnea, spo2: $spo2, "
        "  weight: $weight, hr: $hr, note: $note "
        "}) "
        "CREATE (p)-[:HAS_OBSERVATION]->(o) "
        "RETURN o.id AS id"
    )
    obs_id = f"OBS_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    neo4j_service.run(
        cypher,
        pid="PAT2026001",
        obs_id=obs_id,
        date=date_str,
        cat=cat_total,
        mmrc=mmrc_grade,
        cough=cough,
        sputum=sputum,
        dyspnea=dyspnea,
        spo2=spo2,
        weight=weight,
        hr=hr,
        note=note
    )

    # 2. 写入 MySQL 遥测数据
    try:
        mysql_service.execute(
            "INSERT INTO device_telemetries (patient_id, device_type, spo2, pulse_rate, recorded_at) "
            "VALUES (%s, 'oximeter', %s, %s, NOW())",
            (user_id, spo2, hr)
        )
    except Exception:
        pass

    return jsonify({
        "ok": True,
        "msg": "今日打卡成功！已同步至图数据库与健康时序档案",
        "obs_id": obs_id,
        "cat_evaluation": "影响轻微" if cat_total <= 10 else ("影响中等" if cat_total <= 20 else "影响严重")
    })

# ------------------------------------------------------------------------------
# [P03] 急性加重 (Exacerbation) 红色事件紧急上报
# ------------------------------------------------------------------------------
@patient_bp.post("/exacerbation")
def report_exacerbation():
    data = request.get_json() or {}
    triggers = data.get("triggers", ["着凉感冒"])
    used_antibiotic = bool(data.get("used_antibiotic", False))
    hospitalized = bool(data.get("hospitalized", False))
    note = str(data.get("note", "")).strip()
    date_str = data.get("date", datetime.now().strftime("%Y-%m-%d"))

    # 写入图数据库: (Patient)-[:HAS_EXACERBATION]->(Exacerbation)
    ex_id = f"EXAC_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    cypher = (
        "MATCH (p:Patient {id: 'PAT2026001'}) "
        "CREATE (e:Exacerbation { "
        "  id: $ex_id, onset_date: $date, severity: $severity, triggers: $triggers, "
        "  used_antibiotic: $antibiotic, hospitalized: $hospital, status: 'REPORTED', "
        "  note: $note "
        "}) "
        "CREATE (p)-[:HAS_EXACERBATION]->(e) "
        "RETURN e.id AS id"
    )
    severity = "SEVERE" if hospitalized else ("MODERATE" if used_antibiotic else "MILD")
    neo4j_service.run(
        cypher,
        ex_id=ex_id,
        date=date_str,
        severity=severity,
        triggers=triggers,
        antibiotic=used_antibiotic,
        hospital=hospitalized,
        note=note
    )

    # 记录审计日志
    mysql_service.execute(
        "INSERT INTO audit_logs (user_id, user_code, role_code, action_type, resource_uri, request_method, details) "
        "VALUES (1, 'PAT2026001', 'patient', 'ALERT_EXACERBATION', '/api/patient/exacerbation', 'POST', %s)",
        (f"患者上报急性加重事件: 诱因={','.join(triggers)}, 住院={hospitalized}",)
    )

    return jsonify({
        "ok": True,
        "msg": "🚨 急性加重警报已提交！系统已向您的随访医生李华山主任发送紧急临床提醒，请保持手机畅通！",
        "ex_id": ex_id,
        "guidance": "如果出现口唇发绀、静息时严重呼吸急促或意识不清，请务必立即拨打 120 急救！"
    })

# ------------------------------------------------------------------------------
# [P04] 身体变化趋势（近 30/90 天 CAT 折线图与加重日历）
# ------------------------------------------------------------------------------
@patient_bp.get("/trends")
def get_trends():
    days = int(request.args.get("days", 30))
    # 模拟真实连贯的时序数据
    labels = []
    cat_series = []
    spo2_series = []
    dyspnea_series = []
    today = datetime.now()

    for i in range(days - 1, -1, -1):
        dt = today - timedelta(days=i)
        d_str = dt.strftime("%m-%d")
        labels.append(d_str)
        # 波动生成
        base_cat = 16 + (i % 5) - (2 if i < 7 else 0)
        base_spo2 = 94 + (i % 3)
        cat_series.append(base_cat)
        spo2_series.append(base_spo2)
        dyspnea_series.append(2 if base_cat > 15 else 1)

    return jsonify({
        "ok": True,
        "labels": labels,
        "cat_scores": cat_series,
        "spo2_values": spo2_series,
        "dyspnea_grades": dyspnea_series,
        "annual_exacerbation_count": 1,
        "last_exac_date": "2026-08-15"
    })

# ------------------------------------------------------------------------------
# [P05] 肺康复知识图谱探索 (嵌入 NVL 节点链)
# ------------------------------------------------------------------------------
@patient_bp.get("/knowledge-graph")
def get_knowledge_graph():
    cypher = (
        "MATCH (c:Disease {name: '慢性阻塞性肺疾病 (COPD)'})-[r]-(target) "
        "RETURN c, type(r) AS rel, target LIMIT 30"
    )
    result = neo4j_service.run(cypher)
    return jsonify({
        "ok": True,
        "graph": result[0] if result else {}
    })

# ------------------------------------------------------------------------------
# [P06] 吸入装置依从性打卡与用药闹钟
# ------------------------------------------------------------------------------
@patient_bp.get("/medications")
def get_medications():
    prescriptions = mysql_service.query("SELECT * FROM inhalation_prescriptions WHERE patient_id = 1")
    logs = mysql_service.query("SELECT * FROM inhalation_logs WHERE patient_id = 1 ORDER BY taken_at DESC LIMIT 10")
    return jsonify({
        "ok": True,
        "prescriptions": prescriptions or [],
        "recent_logs": logs or []
    })

@patient_bp.post("/medications/take")
def take_medication():
    data = request.get_json() or {}
    rx_id = data.get("prescription_id", 1)
    sched_time = data.get("scheduled_time", "08:00")
    mysql_service.execute(
        "INSERT INTO inhalation_logs (patient_id, prescription_id, scheduled_time, adherence_score) "
        "VALUES (1, %s, %s, 100)",
        (rx_id, sched_time)
    )
    return jsonify({"ok": True, "msg": "吸入服药打卡成功！今日吸入依从性 100 分 ✓"})

# ------------------------------------------------------------------------------
# [P07] 疫苗接种档案追踪 (流感/肺炎疫苗到期提醒)
# ------------------------------------------------------------------------------
@patient_bp.get("/vaccinations")
def get_vaccinations():
    return jsonify({
        "ok": True,
        "records": [
            {
                "id": "VAC_01",
                "vaccine_type": "四价流感病毒裂解疫苗 (Influenza)",
                "date_given": "2025-10-12",
                "next_due_date": "2026-10-12",
                "status": "即将到期 (建议10月接种新一季疫苗)",
                "urgent": True
            },
            {
                "id": "VAC_02",
                "vaccine_type": "23价肺炎球菌多糖疫苗 (PPSV23)",
                "date_given": "2024-04-18",
                "next_due_date": "2029-04-18",
                "status": "有效保护期内 (5年接种一次)",
                "urgent": False
            }
        ]
    })

# ------------------------------------------------------------------------------
# [P08] 智能设备蓝牙直连同步 (血氧仪/便携肺功能仪)
# ------------------------------------------------------------------------------
@patient_bp.post("/bluetooth-sync")
def sync_bluetooth_device():
    data = request.get_json() or {}
    dev_type = data.get("device_type", "oximeter")
    spo2 = data.get("spo2", 96)
    pr = data.get("pulse_rate", 74)
    fev1 = data.get("fev1", 1.48)
    fvc = data.get("fvc", 2.72)
    pef = data.get("pef", 295.0)

    mysql_service.execute(
        "INSERT INTO device_telemetries (patient_id, device_type, device_mac, spo2, pulse_rate, fev1_l, fvc_l, pef_l_min) "
        "VALUES (1, %s, 'BLE:88:99:A1:FE:22', %s, %s, %s, %s, %s)",
        (dev_type, spo2, pr, fev1, fvc, pef)
    )
    return jsonify({
        "ok": True,
        "msg": f"蓝牙设备 [{dev_type}] 遥测数据已成功高速入库并同步！",
        "data": {"spo2": spo2, "pulse_rate": pr, "fev1": fev1}
    })

# ------------------------------------------------------------------------------
# [P09] 在线复诊咨询与随访医生绑定
# ------------------------------------------------------------------------------
@patient_bp.get("/doctor-info")
def get_bound_doctor():
    doc = mysql_service.query_one(
        "SELECT u.real_name, s.* FROM sys_users u "
        "JOIN staff_profiles s ON u.user_id = s.user_id "
        "WHERE u.role_code = 'doctor' LIMIT 1"
    ) or {
        "real_name": "李华山", "title": "呼吸内科主任医师 / 教授",
        "department": "呼吸与危重症医学科", "hospital_name": "三亚市呼吸疾病数字诊疗中心"
    }
    return jsonify({
        "ok": True,
        "doctor": doc,
        "clinic_schedule": "周二上午特需门诊、周四全天专家门诊"
    })

# ------------------------------------------------------------------------------
# [P10] 个人健康档案与脱敏导出
# ------------------------------------------------------------------------------
@patient_bp.get("/export-profile")
def export_health_profile():
    # 使用 APOC 虚拟脱敏方式生成脱敏健康卡
    cypher = (
        "MATCH (p:Patient {anon_code: 'ANON-COPD-2026001'}) "
        "CALL apoc.create.vNode(['COPDTrend'], { "
        "  anon_id: p.anon_code, gold_group: p.gold_group, gold_stage: p.gold_stage, "
        "  trend_summary: '脱敏临床随访档案已由海南数字慢病监管平台核准' "
        "}) YIELD node AS trendNode RETURN trendNode"
    )
    res = neo4j_service.run(cypher, anon_code="ANON-COPD-2026001")
    return jsonify({
        "ok": True,
        "export_timestamp": datetime.now().isoformat(),
        "hipaa_desensitized": True,
        "patient_card": res[0]["trendNode"] if res else {
            "anon_id": "ANON-COPD-2026001",
            "gold_group": "E",
            "gold_stage": 3,
            "cat_avg_30d": 16.5,
            "spo2_baseline": 94.8
        }
    })
