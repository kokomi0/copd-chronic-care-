# -*- coding: utf-8 -*-
"""图谱概览：列出所有节点标签与关系类型及其数量，方便前端了解「仓库」里有什么。"""
from flask import Blueprint, jsonify

from database import service

schema_bp = Blueprint("schema", __name__, url_prefix="/api")


@schema_bp.get("/schema")
def schema():
    labels = []
    for row in service.run("CALL db.labels() YIELD label RETURN label ORDER BY label"):
        lbl = row["label"]
        cnt = service.run(
            "MATCH (n) WHERE $lbl IN labels(n) RETURN count(n) AS c", lbl=lbl
        )[0]["c"]
        labels.append({"label": lbl, "count": cnt})

    rels = []
    for row in service.run(
        "CALL db.relationshipTypes() YIELD relationshipType "
        "RETURN relationshipType ORDER BY relationshipType"
    ):
        rt = row["relationshipType"]
        cnt = service.run(
            "MATCH ()-[r]->() WHERE type(r) = $rt RETURN count(r) AS c", rt=rt
        )[0]["c"]
        rels.append({"type": rt, "count": cnt})

    return jsonify({"labels": labels, "relationships": rels})
