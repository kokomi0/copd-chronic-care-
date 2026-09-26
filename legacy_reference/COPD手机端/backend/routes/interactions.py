# -*- coding: utf-8 -*-
"""药物相互作用查询。

图谱里的相互作用是独立节点（DrugA/DrugB/Effect/Mechanism/Recommendation 等），
按关键词在 DrugA、DrugB、Effect 上做包含匹配；不带 q 则返回全部。
"""
from flask import Blueprint, jsonify, request

from database import service

interactions_bp = Blueprint("interactions", __name__, url_prefix="/api")


@interactions_bp.get("/interactions")
def list_interactions():
    q = (request.args.get("q") or "").strip()

    if q:
        query = (
            "MATCH (n:DrugInteraction) "
            "WHERE toLower(n.DrugA) CONTAINS toLower($q) "
            "   OR toLower(n.DrugB) CONTAINS toLower($q) "
            "   OR toLower(coalesce(n.Effect, '')) CONTAINS toLower($q) "
            "RETURN properties(n) AS props ORDER BY n.InteractionID"
        )
        rows = service.run(query, q=q)
    else:
        query = (
            "MATCH (n:DrugInteraction) "
            "RETURN properties(n) AS props ORDER BY n.InteractionID"
        )
        rows = service.run(query)

    items = [r["props"] or {} for r in rows]
    return jsonify({"ok": True, "q": q or None, "count": len(items), "interactions": items})
