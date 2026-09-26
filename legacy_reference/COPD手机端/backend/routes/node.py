# -*- coding: utf-8 -*-
"""节点详情：查看某个节点自身属性，以及它相邻的节点和关系。"""
from flask import Blueprint, jsonify

from database import service

node_bp = Blueprint("node", __name__, url_prefix="/api")


@node_bp.get("/node/<element_id>")
def node_detail(element_id):
    query = (
        "MATCH (n) WHERE elementId(n) = $id "
        "OPTIONAL MATCH (n)-[r]-(m) "
        "WITH n, r, m, CASE WHEN startNode(r) = n THEN 'out' ELSE 'in' END AS dir "
        "RETURN labels(n) AS labels, properties(n) AS props, "
        "collect(DISTINCT {id: elementId(m), labels: labels(m), type: type(r), "
        "        direction: dir, properties: properties(m)}) AS neighbors"
    )
    rows = service.run(query, id=element_id)
    if not rows or rows[0]["props"] is None:
        return jsonify({"ok": False, "error": "节点不存在"}), 404

    r = rows[0]
    neighbors = [
        nb for nb in (r["neighbors"] or []) if nb.get("id") is not None
    ]
    return jsonify({
        "ok": True,
        "id": element_id,
        "labels": r["labels"],
        "properties": r["props"],
        "neighbors": neighbors,
    })
