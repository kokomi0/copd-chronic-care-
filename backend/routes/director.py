# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 院长管理端大屏路由 (涵盖 [M01~M09] 九大核心功能)"""
from flask import Blueprint, jsonify

director_bp = Blueprint("director", __name__, url_prefix="/api/director")

# ------------------------------------------------------------------------------
# [M01] 全院慢病综合管理大屏
# ------------------------------------------------------------------------------
@director_bp.get("/cockpit")
def get_cockpit():
    return jsonify({
        "ok": True,
        "kpis": {
            "total_registered_patients": 1286,
            "active_checkin_rate_today": "86.4%",
            "monthly_active_patients": 1120,
            "annual_exac_reduction_rate": "-28.5%",
            "patient_satisfaction": "98.2%"
        },
        "monthly_trend": [
            {"month": "4月", "checkins": 8200, "exacs": 42},
            {"month": "5月", "checkins": 8900, "exacs": 38},
            {"month": "6月", "checkins": 9400, "exacs": 31},
            {"month": "7月", "checkins": 9800, "exacs": 28},
            {"month": "8月", "checkins": 10400, "exacs": 25},
            {"month": "9月", "checkins": 11200, "exacs": 22}
        ]
    })

# ------------------------------------------------------------------------------
# [M02] 急性加重发生率与再入院指标监控
# ------------------------------------------------------------------------------
@director_bp.get("/readmission-metrics")
def get_readmission_metrics():
    return jsonify({
        "ok": True,
        "metrics": {
            "day30_readmission_rate": "4.8%",
            "national_average": "9.5%",
            "annual_hospitalization_rate": "12.3%",
            "average_length_of_stay": "6.8 天",
            "avoidable_exac_blocked": 142
        }
    })

# ------------------------------------------------------------------------------
# [M03] 医护团队随访达标率与工作负荷排行
# ------------------------------------------------------------------------------
@director_bp.get("/staff-workload")
def get_staff_workload():
    return jsonify({
        "ok": True,
        "leaderboard": [
            {"rank": 1, "name": "李华山 (呼吸主任医师)", "patients": 280, "followup_rate": "98.5%", "score": 99.2},
            {"rank": 2, "name": "王春燕 (专科护士长)", "patients": 320, "followup_rate": "97.8%", "score": 98.4},
            {"rank": 3, "name": "张文远 (主治医师)", "patients": 210, "followup_rate": "95.2%", "score": 96.0},
            {"rank": 4, "name": "赵美华 (主管护师)", "patients": 240, "followup_rate": "94.6%", "score": 95.1}
        ]
    })

# ------------------------------------------------------------------------------
# [M04] GOLD A/B/E 组人群分布演变分析
# ------------------------------------------------------------------------------
@director_bp.get("/gold-evolution")
def get_gold_evolution():
    return jsonify({
        "ok": True,
        "current_distribution": [
            {"group": "A组 (轻症少加重)", "count": 280, "pct": "21.8%"},
            {"group": "B组 (重症状少加重)", "count": 620, "pct": "48.2%"},
            {"group": "E组 (频繁加重高危)", "count": 386, "pct": "30.0%"}
        ],
        "migration_analysis": "通过规范三联制剂和呼吸康复，过去半年中 62 位 E 组患者未再发生中重度急性加重，病情趋于稳态。"
    })

# ------------------------------------------------------------------------------
# [M05] 知识图谱临床规范路径质控分析
# ------------------------------------------------------------------------------
@director_bp.get("/clinical-pathway")
def get_clinical_pathway():
    return jsonify({
        "ok": True,
        "pathway_compliance": "94.2%",
        "graph_guided_checks": 4520,
        "inappropriate_rx_blocked": 68,
        "top_adherence_items": [
            {"item": "吸入激素联合长效支扩剂 (ICS+LABA/LAMA) 规范率", "pct": "96.4%"},
            {"item": "每年入秋流感疫苗预防接种宣教率", "pct": "92.0%"},
            {"item": "随访评估 CAT+mMRC 量表完整率", "pct": "95.5%"}
        ]
    })

# ------------------------------------------------------------------------------
# [M06] 吸入剂全院使用依从性宏观分析
# ------------------------------------------------------------------------------
@director_bp.get("/adherence-macro")
def get_adherence_macro():
    return jsonify({
        "ok": True,
        "mean_adherence": "88.6%",
        "device_compliance": [
            {"device": "都保 (Turbuhaler)", "count": 540, "adherence": "91.2%"},
            {"device": "准纳尔 (Diskus)", "count": 380, "adherence": "89.5%"},
            {"device": "易纳器 (Ellipta)", "count": 260, "adherence": "93.4%"},
            {"device": "定量气雾剂 (pMDI)", "count": 106, "adherence": "78.0%"}
        ]
    })

# ------------------------------------------------------------------------------
# [M07] 疫苗预防接种覆盖率大盘
# ------------------------------------------------------------------------------
@director_bp.get("/vaccine-coverage")
def get_vaccine_coverage():
    return jsonify({
        "ok": True,
        "influenza_rate": "68.4%",
        "pneumococcal_rate": "42.8%",
        "target_rate": "75.0%",
        "high_risk_e_group_vac_rate": "81.2%"
    })

# ------------------------------------------------------------------------------
# [M08] 医疗安全风险与合规预警拦截
# ------------------------------------------------------------------------------
@director_bp.get("/risk-interception")
def get_risk_interception():
    return jsonify({
        "ok": True,
        "total_intercepted": 92,
        "breakdown": [
            {"type": "重复用药 (同时开立两类同质β2受体激动剂)", "count": 48},
            {"type": "重度缺氧未及时签署家庭氧疗建议", "count": 26},
            {"type": "抗生素超时不规范使用预警", "count": 18}
        ]
    })

# ------------------------------------------------------------------------------
# [M09] 经营与科研报表多维导出
# ------------------------------------------------------------------------------
@director_bp.get("/export-reports")
def export_reports():
    return jsonify({
        "ok": True,
        "available_reports": [
            {"id": "R01", "name": "全院慢阻肺全周期质控国家慢病平台达标报表.xlsx", "generated": "2026-09-26"},
            {"id": "R02", "name": "三亚市PCCM数字慢病专科医防融合运营分析白皮书.pdf", "generated": "2026-09-20"},
            {"id": "R03", "name": "GOLD_E组科研队列多中心时序脱敏数据集.json", "generated": "2026-09-25"}
        ]
    })
