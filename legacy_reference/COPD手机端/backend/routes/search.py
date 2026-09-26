# -*- coding: utf-8 -*-
"""图谱关键词检索（「仓库寻找」核心）。

按关键词在所有节点属性里做包含匹配，可选按标签过滤。
图谱当前只有几百个节点，全属性扫描足够快；数据量大后再换全文索引。
"""
from flask import Blueprint, jsonify, request

from database import service

search_bp = Blueprint("search", __name__, url_prefix="/api")

# 各实体用于展示的「名称」字段，按优先级取第一个非空值作为标题。
# 图谱里属性命名不统一（有 camelCase 也有 PascalCase），所以统一按小写匹配。
NAME_KEYS = [
    "name", "namecn", "nameen", "diseasename", "diseasenamec",
    "genericname", "genericnamec", "brandname", "brandnamecommon",
    "complicationname", "complicationnamec", "groupname", "goldstage",
    "treatmentname", "treatmentnamec", "procedurename", "devicename",
    "testname", "pattern", "topic", "title",
    "drugid", "diseaseid", "doctorid", "patientid",
]


def _display_name(props):
    lowered = {k.lower(): v for k, v in props.items()}
    for k in NAME_KEYS:
        v = lowered.get(k)
        if v:
            return v
    return "(未命名)"


@search_bp.get("/search")
def search():
    q = (request.args.get("q") or "").strip()
    label = (request.args.get("label") or "").strip() or None

    try:
        limit = int(request.args.get("limit", 20) or 20)
    except ValueError:
        limit = 20
    limit = max(1, min(limit, 100))

    if not q:
        return jsonify({"ok": False, "error": "缺少参数 q（搜索关键词）"}), 400

    query = (
        "MATCH (n) "
        "WHERE ($label IS NULL OR $label IN labels(n)) "
        "  AND any(k IN keys(n) WHERE toLower(toString(n[k])) CONTAINS toLower($q)) "
        "RETURN elementId(n) AS id, labels(n) AS labels, properties(n) AS props "
        "LIMIT $limit"
    )
    rows = service.run(query, q=q, label=label, limit=limit)

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
