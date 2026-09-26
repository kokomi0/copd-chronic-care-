# -*- coding: utf-8 -*-
"""按标签列出全部节点（知识库「分类浏览」用）。

与 search 不同，这里不需要关键词，直接把某一类节点整类取回，
前端知识库按分类点进去就能看到该类所有条目。
"""
from flask import Blueprint, jsonify, request

from database import service
from .search import _display_name

list_bp = Blueprint("list", __name__, url_prefix="/api")


@list_bp.get("/list")
def list_nodes():
    label = (request.args.get("label") or "").strip()
    if not label:
        return jsonify({"ok": False, "error": "缺少参数 label（节点标签）"}), 400

    try:
        limit = int(request.args.get("limit", 200) or 200)
    except ValueError:
        limit = 200
    limit = max(1, min(limit, 500))

    query = (
        "MATCH (n) WHERE $label IN labels(n) "
        "RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props "
        "LIMIT $limit"
    )
    rows = service.run(query, label=label, limit=limit)

    results = []
    for r in rows:
        props = r["props"] or {}
        results.append({
            "id": r["id"],
            "labels": r["labels"],
            "title": _display_name(props),
            "properties": props,
        })
    return jsonify({"ok": True, "count": len(results), "results": results})
