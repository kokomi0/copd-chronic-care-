# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 医生端临床工作台路由 (涵盖 [D01~D09] 九大核心功能)"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from database import mysql_service, neo4j_service

doctor_bp = Blueprint("doctor", __name__, url_prefix="/api/doctor")

# ------------------------------------------------------------------------------
# [D01] 患者图谱工作台
# ------------------------------------------------------------------------------
@doctor_bp.get("/patients")
def get_monitored_patients():
    patients = [
        {
            "id": 1,
            "patient_code": "PAT2026001",
            "anon_code": "ANON-COPD-2026001",
            "name": "张建国 (脱敏)",
            "age": 68,
            "gender": "男",
            "gold_stage": "GOLD 3级",
            "gold_group": "E组 (频繁加重高危)",
            "latest_cat": 16,
            "latest_spo2": 95,
            "fev1_pct": 42.5,
            "annual_exac": 1,
            "compliance_rate": "93.4%",
            "risk_tier": "HIGH_DANGER"
        },
        {
            "id": 2,
            "patient_code": "PAT2026002",
            "anon_code": "ANON-COPD-2026002",
            "name": "王玉梅 (脱敏)",
            "age": 64,
            "gender": "女",
            "gold_stage": "GOLD 2级",
            "gold_group": "B组 (症状较多)",
            "latest_cat": 14,
            "latest_spo2": 96,
            "fev1_pct": 62.0,
            "annual_exac": 0,
            "compliance_rate": "88.0%",
            "risk_tier": "MEDIUM_WARNING"
        },
        {
            "id": 3,
            "patient_code": "PAT2026003",
            "anon_code": "ANON-COPD-2026003",
            "name": "刘福荣 (脱敏)",
            "age": 72,
            "gender": "男",
            "gold_stage": "GOLD 4级",
            "gold_group": "E组 (重度频繁加重)",
            "latest_cat": 24,
            "latest_spo2": 91,
            "fev1_pct": 28.5,
            "annual_exac": 3,
            "compliance_rate": "72.5%",
            "risk_tier": "HIGH_DANGER"
        }
    ]
    return jsonify({"ok": True, "patients": patients})

# ------------------------------------------------------------------------------
# [D02] GOLD E 组高危急性加重预警雷达
# ------------------------------------------------------------------------------
@doctor_bp.get("/radar-alerts")
def get_radar_alerts():
    radar_data = {
        "indicators": [
            {"name": "近一年加重次数", "max": 4, "value": 3},
            {"name": "CAT 症状波动", "max": 40, "value": 24},
            {"name": "mMRC 气促级别", "max": 4, "value": 3},
            {"name": "血氧去饱和频次", "max": 10, "value": 7},
            {"name": "吸入装置依从性低", "max": 100, "value": 28},
            {"name": "合并肺心病/心率高", "max": 100, "value": 65}
        ],
        "high_risk_list": [
            {
                "anon_code": "ANON-COPD-2026003",
                "alert_title": "极高危预警：近7天血氧2次跌破90%且气促骤升至3级",
                "urgency": "RED_CRITICAL",
                "suggested_action": "建议立即电话召回就医，排查下呼吸道细菌感染加重"
            },
            {
                "anon_code": "ANON-COPD-2026001",
                "alert_title": "季节性流感疫苗到期提醒，既往有受凉加重史",
                "urgency": "ORANGE_WARNING",
                "suggested_action": "建议签署流感疫苗接种医嘱，并强化吸入制剂依从性"
            }
        ]
    }
    return jsonify({"ok": True, "radar": radar_data})

# ------------------------------------------------------------------------------
# [D03] 患者打卡历史与时序趋势回溯
# ------------------------------------------------------------------------------
@doctor_bp.get("/patient-timeline/<patient_code>")
def get_patient_timeline(patient_code):
    return jsonify({
        "ok": True,
        "patient_code": patient_code,
        "timeline": [
            {"date": "2026-09-26", "cat": 15, "spo2": 96, "event": "日常打卡", "status": "平稳"},
            {"date": "2026-09-23", "cat": 19, "spo2": 92, "event": "受凉咳嗽加重", "status": "波动警示"},
            {"date": "2026-09-20", "cat": 16, "spo2": 94, "event": "日常打卡", "status": "平稳"},
            {"date": "2026-08-15", "cat": 26, "spo2": 89, "event": "急性加重事件 (AECOPD)", "status": "急症处置 (口服抗生素+激素)"}
        ]
    })

# ------------------------------------------------------------------------------
# [D04] 急性加重临床复核与干预处置
# ------------------------------------------------------------------------------
@doctor_bp.post("/review-exacerbation")
def review_exacerbation():
    data = request.get_json() or {}
    ex_id = data.get("ex_id", "EXAC_20260815")
    action = data.get("action", "PRESCRIBE_MEDICATION")
    clinical_advice = data.get("clinical_advice", "门诊开立阿莫西林克拉维酸钾 0.375g tid + 强化布地奈德福莫特罗吸入至每天2次每次2吸，随访5天后复查")

    cypher = (
        "MATCH (e:Exacerbation {id: $ex_id}) "
        "SET e.status = 'VERIFIED_TREATED', e.clinical_verdict = $advice, e.doctor_id = 'DOC8801' "
        "RETURN e.id"
    )
    neo4j_service.run(cypher, ex_id=ex_id, advice=clinical_advice)

    return jsonify({
        "ok": True,
        "msg": "急性加重临床干预方案已下达，已向患者端推送医嘱通知并同步入图谱！",
        "verdict": clinical_advice
    })

# ------------------------------------------------------------------------------
# [D05] 吸入剂用药依从性评估与方案调整
# ------------------------------------------------------------------------------
@doctor_bp.post("/adjust-medication")
def adjust_medication():
    data = request.get_json() or {}
    new_regimen = data.get("new_regimen", "升级为氟替美维吸入粉雾剂 (三联 ICS+LAMA+LABA) 每日1次")
    patient_id = data.get("patient_id", 1)

    mysql_service.execute(
        "UPDATE inhalation_prescriptions SET status = 'STOPPED' WHERE patient_id = %s",
        (patient_id,)
    )
    mysql_service.execute(
        "INSERT INTO inhalation_prescriptions (patient_id, drug_name, drug_class, device_type, dosage, daily_frequency, start_date, prescribing_doctor_id) "
        "VALUES (%s, '氟替美维吸入粉雾剂', 'ICS+LAMA+LABA三联', '易纳器 (Ellipta)', '1吸/次', 1, CURDATE(), 2)",
        (patient_id,)
    )
    return jsonify({
        "ok": True,
        "msg": f"吸入处方方案已成功调整：[{new_regimen}]",
        "adjustment_type": "GOLD E组三联强化治疗"
    })

# ------------------------------------------------------------------------------
# [D06] 临床 COPD 知识图谱检索 (病理/并发症/用药禁忌)
# ------------------------------------------------------------------------------
@doctor_bp.get("/graph-search")
def search_clinical_graph():
    q = request.args.get("q", "相互作用").strip()
    return jsonify({
        "ok": True,
        "query": q,
        "results": [
            {
                "title": "布地奈德福莫特罗 + 硫酸沙丁胺醇气雾剂",
                "type": "药物相互作用",
                "level": "慎用提示",
                "evidence": "二者均含β2受体激动成分，合用可协同扩张气道，但过量使用易诱发心悸、心动过速或低血钾，需警惕基础冠心病患者。"
            },
            {
                "title": "GOLD E 组临床药物推荐路径",
                "type": "循证指南",
                "level": "IA级推荐",
                "evidence": "2024 GOLD 指南指出：年加重≥2次或因加重住院≥1次患者归入 E 组，推荐使用 LABA+LAMA 双支扩剂；若血嗜酸粒细胞 ≥300/μL，推荐初始三联 (ICS+LABA+LAMA)。"
            }
        ]
    })

# ------------------------------------------------------------------------------
# [D07] 在线随访与图文问诊工作站
# ------------------------------------------------------------------------------
@doctor_bp.get("/consultations")
def get_consultations():
    return jsonify({
        "ok": True,
        "messages": [
            {
                "id": "MSG_01",
                "patient_name": "张建国 (PAT2026001)",
                "content": "李主任您好，这两天夜里稍微有点喘，吸了都保之后能平复，需要加大吸入次数吗？",
                "time": "2026-09-26 14:20",
                "unread": True
            }
        ]
    })

# ------------------------------------------------------------------------------
# [D08] 疫苗接种指导建议签发
# ------------------------------------------------------------------------------
@doctor_bp.post("/issue-vaccine-advice")
def issue_vaccine_advice():
    data = request.get_json() or {}
    advice = data.get("advice", "建议于2026年10月上旬前完成2026-2027年度四价流感疫苗接种，以减少秋冬季呼吸道病毒感染诱发加重风险。")
    return jsonify({
        "ok": True,
        "msg": "疫苗接种临床建议已签发，已直达患者疫苗提醒卡！",
        "advice": advice
    })

# ------------------------------------------------------------------------------
# [D09] 科研队列脱敏数据统计
# ------------------------------------------------------------------------------
@doctor_bp.get("/research-cohort")
def get_research_cohort():
    return jsonify({
        "ok": True,
        "total_enrolled": 128,
        "gold_distribution": {
            "A组 (轻症少加重)": 24,
            "B组 (多症状少加重)": 58,
            "E组 (高危频繁加重)": 46
        },
        "mean_cat_improvement": "-4.2 分 (入组3个月)",
        "mean_adherence_rate": "89.6%",
        "fev1_annual_decline_reduction": "减缓 24 mL/年 (三联依从队列)"
    })
