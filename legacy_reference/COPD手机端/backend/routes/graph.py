# -*- coding: utf-8 -*-
"""图谱可视化：把节点和关系一次性返回给前端画图。

默认返回整图（MATCH (n)-[r]->(m) ... LIMIT 100），
也可用 ?q=关键词 只返回命中节点及其相邻关系。
"""
from flask import Blueprint, jsonify, request

from database import service
from .search import _display_name

graph_bp = Blueprint("graph", __name__, url_prefix="/api")


@graph_bp.get("/graph")
def graph():
    try:
        limit = int(request.args.get("limit", 100) or 100)
    except ValueError:
        limit = 100
    limit = max(1, min(limit, 300))

    q = (request.args.get("q") or "").strip()

    # 统一取「边 + 两端节点」，节点按 elementId 去重
    if q:
        query = (
            "MATCH (n) WHERE any(k IN keys(n) WHERE toLower(toString(n[k])) CONTAINS toLower($q)) "
            "MATCH (n)-[r]-(m) "
            "RETURN elementId(n) AS a, labels(n) AS al, properties(n) AS ap, "
            "       type(r) AS t, elementId(m) AS b, labels(m) AS bl, properties(m) AS bp "
            "LIMIT $limit"
        )
        rows = service.run(query, q=q, limit=limit)
    else:
        query = (
            "MATCH (n)-[r]->(m) "
            "RETURN elementId(n) AS a, labels(n) AS al, properties(n) AS ap, "
            "       type(r) AS t, elementId(m) AS b, labels(m) AS bl, properties(m) AS bp "
            "LIMIT $limit"
        )
        rows = service.run(query, limit=limit)

    nodes = {}
    edges = []
    for row in rows:
        a, b, t = row["a"], row["b"], row["t"]
        if a is None or b is None:
            continue
        if a not in nodes:
            nodes[a] = {
                "id": a,
                "label": (row["al"] or ["节点"])[0],
                "title": _display_name(row["ap"] or {}),
            }
        if b not in nodes:
            nodes[b] = {
                "id": b,
                "label": (row["bl"] or ["节点"])[0],
                "title": _display_name(row["bp"] or {}),
            }
        edges.append({"source": a, "target": b, "type": t})

    return jsonify({
        "ok": True,
        "count": len(nodes),
        "nodes": list(nodes.values()),
        "edges": edges,
    })
