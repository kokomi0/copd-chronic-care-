# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 护士端护理工作台路由 (涵盖 [N01~N09] 九大核心功能)"""
from flask import Blueprint, request, jsonify
from database import mysql_service

nurse_bp = Blueprint("nurse", __name__, url_prefix="/api/nurse")

# ------------------------------------------------------------------------------
# [N01] 辖区/病区患者今日打卡监控台
# ------------------------------------------------------------------------------
@nurse_bp.get("/today-monitoring")
def get_today_monitoring():
    return jsonify({
        "ok": True,
        "ward": "呼吸慢病数字化病区二区 (PCCM随访专区)",
        "total_assigned": 36,
        "checked_count": 31,
        "missed_count": 5,
        "critical_count": 2,
        "patients": [
            {"id": 1, "name": "张建国", "code": "PAT2026001", "checked": True, "cat": 15, "spo2": 96, "risk": "稳定"},
            {"id": 2, "name": "王玉梅", "code": "PAT2026002", "checked": True, "cat": 14, "spo2": 95, "risk": "良好"},
            {"id": 3, "name": "刘福荣", "code": "PAT2026003", "checked": False, "cat": 24, "spo2": 91, "risk": "漏卡预警"},
            {"id": 4, "name": "赵金生", "code": "PAT2026004", "checked": False, "cat": 18, "spo2": 92, "risk": "漏卡预警"},
            {"id": 5, "name": "陈德胜", "code": "PAT2026005", "checked": True, "cat": 22, "spo2": 90, "risk": "低氧警示"}
        ]
    })

# ------------------------------------------------------------------------------
# [N02] 漏卡患者一键随访催办与脱落预警
# ------------------------------------------------------------------------------
@nurse_bp.post("/nudge-missed")
def nudge_missed_patients():
    data = request.get_json() or {}
    patient_codes = data.get("patient_codes", ["PAT2026003", "PAT2026004"])
    return jsonify({
        "ok": True,
        "msg": f"已成功向 {len(patient_codes)} 位漏卡患者发送短信催办通知与健康关怀弹窗！",
        "nudged_count": len(patient_codes),
        "sms_template": "【智肺呼吸】尊敬的慢友，您今日尚未完成呼吸症状打卡与吸入用药核销，为了您的肺功能健康，请及时打开平台打卡。"
    })

# ------------------------------------------------------------------------------
# [N03] 急性加重应急接诊初筛
# ------------------------------------------------------------------------------
@nurse_bp.post("/triage")
def submit_triage():
    data = request.get_json() or {}
    spo2 = int(data.get("spo2", 91))
    rr = int(data.get("respiratory_rate", 24))
    speech = data.get("speech_difficulty", "不能说完整长句")
    consciousness = data.get("consciousness", "清醒稍烦躁")

    triage_level = "一级 (濒危急救)" if spo2 < 88 or consciousness != "清醒稍烦躁" else "二级 (急症重危优先)"

    return jsonify({
        "ok": True,
        "triage_level": triage_level,
        "recommended_path": "立即启动绿色通道进入PCCM抢救室，给予低流量吸氧 (1-2L/min，维持SpO2 88-92%) 并急查动脉血气分析！",
        "nurse_badge": "NUR6601"
    })

# ------------------------------------------------------------------------------
# [N04] 吸入装置实操视频与图谱宣教指引
# ------------------------------------------------------------------------------
@nurse_bp.get("/inhaler-training")
def get_inhaler_training():
    return jsonify({
        "ok": True,
        "devices": [
            {
                "name": "都保 (Turbuhaler) - 布地奈德福莫特罗",
                "steps": ["1. 旋开外盖并保持直立", "2. 向右旋转到底再向左旋转闻及咔哒声", "3. 远离吸嘴用力呼尽余气", "4. 紧包吸嘴用力深长吸气", "5. 屏气5~10秒后漱口并吐出"],
                "video_url": "/assets/video-turbuhaler.mp4",
                "common_mistakes": "未保持直立装药、吸气力度不足、吸药后未含漱导致鹅口疮"
            },
            {
                "name": "准纳尔 (Diskus) - 沙美特罗替卡松",
                "steps": ["1. 一手握外壳拇指推开滑槽", "2. 向外推扳手至咔哒声", "3. 呼气后水平含入吸嘴平稳吸入", "4. 屏气10秒", "5. 滑回外壳关闭并漱口"],
                "video_url": "/assets/video-diskus.mp4",
                "common_mistakes": "对着吸嘴呼气吹散药粉、未彻底屏气"
            }
        ]
    })

# ------------------------------------------------------------------------------
# [N05] 疫苗接种预约与执行核销
# ------------------------------------------------------------------------------
@nurse_bp.post("/verify-vaccination")
def verify_vaccination():
    data = request.get_json() or {}
    patient_id = data.get("patient_id", 1)
    vac_type = data.get("vaccine_type", "四价流感病毒裂解疫苗")
    lot_no = data.get("lot_number", "FLU-202609-088")
    site = data.get("site", "左上臂三角肌")

    return jsonify({
        "ok": True,
        "msg": f"患者 [张建国] 的 {vac_type} 接种已由王春燕护士长核销成功！",
        "verified_at": "2026-09-26 15:40:00",
        "next_year_due": "2027-09-26"
    })

# ------------------------------------------------------------------------------
# [N06] 家用血氧/肺功能手工复核校验
# ------------------------------------------------------------------------------
@nurse_bp.post("/audit-telemetry")
def audit_telemetry():
    data = request.get_json() or {}
    tel_id = data.get("telemetry_id", 1)
    status = data.get("audit_status", "APPROVED")  # APPROVED / REJECTED
    note = data.get("note", "已电话核实患者当时活动后测量，休息15分钟后复测血氧95%，已纠正记录")

    return jsonify({
        "ok": True,
        "msg": "遥测数据已完成护士复核并标记归档",
        "audit_status": status,
        "note": note
    })

# ------------------------------------------------------------------------------
# [N07] 康复排痰操与呼吸训练指导
# ------------------------------------------------------------------------------
@nurse_bp.get("/rehab-guidelines")
def get_rehab_guidelines():
    return jsonify({
        "ok": True,
        "techniques": [
            {
                "title": "缩唇呼吸法 (Pursed-Lip)",
                "rhythm": "吸气2秒，呼气4~6秒 (吸呼比 1:2~1:3)",
                "action": "用鼻深吸气，呼气时嘴唇缩成吹口哨状，缓慢吹出气体，腹部微收"
            },
            {
                "title": "膈肌腹式呼吸 (Diaphragmatic)",
                "rhythm": "一手放胸前，一手放腹部",
                "action": "吸气时腹部隆起胸部尽量不动，呼气时腹部凹陷"
            },
            {
                "title": "有效咳嗽与哈气排痰 (Huffing)",
                "rhythm": "深吸气后屏气2秒，张口连续发出'哈、哈'声2~3次",
                "action": "利用高速气流将细支气管分泌物带入主支气管后咳出"
            }
        ]
    })

# ------------------------------------------------------------------------------
# [N08] 护理交接班记录与批注
# ------------------------------------------------------------------------------
@nurse_bp.get("/handover-records")
def get_handover_records():
    return jsonify({
        "ok": True,
        "shift": "白班 -> 晚夜班交接",
        "nurse_on_duty": "王春燕 (主管护师)",
        "successor": "张晓洁 (护士)",
        "special_focus": [
            "刘福荣 (PAT2026003)：今日气促加重伴痰量增多，已交待家属注意夜间血氧监测，必要时启动无创呼吸机或呼叫急诊。",
            "陈德胜 (PAT2026005)：下午血氧90%，已指导其进行20分钟卧位腹式呼吸，复测94%。"
        ]
    })

# ------------------------------------------------------------------------------
# [N09] 随访问卷与宣教触达分发
# ------------------------------------------------------------------------------
@nurse_bp.post("/dispatch-survey")
def dispatch_survey():
    data = request.get_json() or {}
    survey_name = data.get("survey_name", "秋冬季COPD防寒保暖与规范吸入宣教通知")
    return jsonify({
        "ok": True,
        "msg": f"宣教资料 [{survey_name}] 已成功推送至病区全员 36 位慢阻肺患者手机端！",
        "reach_rate": "100%"
    })
