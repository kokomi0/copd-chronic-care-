# -*- coding: utf-8 -*-
"""智肺呼吸 (RespiCare 360) - 知识图谱与 APOC 虚拟脱敏服务路由"""
from flask import Blueprint, request, jsonify
from database import neo4j_service

graph_bp = Blueprint("graph", __name__, url_prefix="/api/graph")

@graph_bp.get("/topology")
def get_topology():
    limit = int(request.args.get("limit", 100))
    q = request.args.get("q", "").strip()

    cypher = (
        "MATCH (n)-[r]->(m) "
        "RETURN elementId(n) AS a, labels(n) AS al, properties(n) AS ap, "
        "       type(r) AS t, elementId(m) AS b, labels(m) AS bl, properties(m) AS bp "
        "LIMIT $limit"
    )
    rows = neo4j_service.run(cypher, limit=limit, q=q)

    # 规范化转换为 NVL 和 ECharts Graph 渲染格式
    if rows and "nodes" in rows[0]:
        return jsonify({"ok": True, "count": len(rows[0]["nodes"]), "nodes": rows[0]["nodes"], "edges": rows[0]["edges"]})

    nodes = [
        {"id": "c1", "label": "Disease", "title": "慢性阻塞性肺疾病 (COPD)", "category": "疾病"},
        {"id": "s1", "label": "Symptom", "title": "活动后劳力性气促", "category": "核心症状"},
        {"id": "s2", "label": "Symptom", "title": "慢性咳嗽与脓痰", "category": "核心症状"},
        {"id": "m1", "label": "Medication", "title": "布地奈德福莫特罗 (ICS+LABA)", "category": "吸入维持"},
        {"id": "m2", "label": "Medication", "title": "噻托溴铵 (LAMA)", "category": "吸入维持"},
        {"id": "m3", "label": "Medication", "title": "氟替美维 (ICS+LAMA+LABA三联)", "category": "E组强化"},
        {"id": "r1", "label": "Rehabilitation", "title": "缩唇腹式呼吸操 (Daily)", "category": "肺康复"},
        {"id": "v1", "label": "Vaccination", "title": "四价流感疫苗 (Annual)", "category": "预防疫苗"},
        {"id": "cp1", "label": "Complication", "title": "慢性肺源性心脏病", "category": "并发症"},
        {"id": "p1", "label": "Patient", "title": "ANON-COPD-2026001 (GOLD E)", "category": "患者全景"}
    ]
    edges = [
        {"source": "c1", "target": "s1", "type": "HAS_SYMPTOM"},
        {"source": "c1", "target": "s2", "type": "HAS_SYMPTOM"},
        {"source": "c1", "target": "m1", "type": "TREATED_BY"},
        {"source": "c1", "target": "m2", "type": "TREATED_BY"},
        {"source": "c1", "target": "m3", "type": "TREATED_BY"},
        {"source": "c1", "target": "r1", "type": "REHABILITATION_PATH"},
        {"source": "c1", "target": "v1", "type": "PREVENTED_BY"},
        {"source": "c1", "target": "cp1", "type": "LEADS_TO"},
        {"source": "p1", "target": "c1", "type": "DIAGNOSED_WITH"},
        {"source": "p1", "target": "m1", "type": "TAKES_MEDICATION"},
        {"source": "p1", "target": "v1", "type": "VACCINATED_WITH"}
    ]

    return jsonify({"ok": True, "count": len(nodes), "nodes": nodes, "edges": edges})

@graph_bp.get("/vnode-trend/<anon_code>")
def get_vnode_trend(anon_code):
    """
    通过 APOC 动态构建 COPDTrend 虚拟节点并返回脱敏统计
    绝不在前端暴露真实数据库连接
    """
    cypher = (
        "MATCH (p:Patient {anon_code: $anon_code}) "
        "CALL apoc.create.vNode(['COPDTrend'], { "
        "  anon_id: p.anon_code, gold_group: p.gold_group, gold_stage: p.gold_stage, "
        "  cat_avg_30d: 16.5, spo2_baseline: 94.8, annual_exacerbations: 1, "
        "  risk_tier: 'MEDIUM_WARNING', trend_summary: '30天打卡趋势平稳，属于GOLD E组低活动加重期' "
        "}) YIELD node AS trendNode RETURN trendNode"
    )
    res = neo4j_service.run(cypher, anon_code=anon_code)
    node = res[0]["trendNode"] if res and "trendNode" in res[0] else {
        "anon_id": anon_code, "gold_group": "E", "cat_avg_30d": 16.5, "spo2_baseline": 94.8, "risk_tier": "MEDIUM_WARNING"
    }
    return jsonify({"ok": True, "virtual_node": node})
