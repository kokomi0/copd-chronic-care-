# -*- coding: utf-8 -*-
"""按症状查询：输入症状（如"气促"），分类返回相关疾病、非药物治疗、药物、并发症。

App 里的症状叫法和图谱里的用词不完全一致（如 App 说"气促"，图谱写"呼吸困难"），
这里用一个同义词表把常见症状词展开，扩大命中范围，不动图谱里的数据。
"""
from flask import Blueprint, jsonify, request

from database import service
from .search import _display_name

symptom_bp = Blueprint("symptom", __name__, url_prefix="/api")

# App 症状词 → 图谱里实际会出现的同义词（中英文都补上）
SYMPTOM_ALIASES = {
    "气促": ["气促", "呼吸困难", "憋气", "喘", "dyspnea"],
    "喘": ["喘", "气促", "呼吸困难", "dyspnea"],
    "呼吸困难": ["呼吸困难", "气促", "喘", "dyspnea"],
    "咳嗽": ["咳嗽", "咳", "cough"],
    "咳": ["咳", "咳嗽", "cough"],
    "咳痰": ["咳痰", "痰", "sputum"],
    "痰": ["痰", "咳痰", "sputum"],
    "发烧": ["发烧", "发热", "fever"],
    "发热": ["发热", "发烧", "fever"],
    "疲劳": ["疲劳", "乏力", "疲倦", "fatigue"],
    "乏力": ["乏力", "疲劳", "疲倦", "fatigue"],
}


def _expand(q):
    return SYMPTOM_ALIASES.get(q, [q])


def _match(label, qs, limit=50):
    """在指定标签的节点里，用任意属性匹配同义词中的任意一个。"""
    query = (
        "MATCH (n) WHERE $label IN labels(n) "
        "  AND any(k IN keys(n) WHERE any(t IN $qs "
        "        WHERE toLower(toString(n[k])) CONTAINS toLower(t))) "
        "RETURN elementId(n) AS id, properties(n) AS props LIMIT $limit"
    )
    rows = service.run(query, label=label, qs=qs, limit=limit)
    return [
        {
            "id": r["id"],
            "labels": [label],
            "title": _display_name(r["props"] or {}),
            "properties": r["props"] or {},
        }
        for r in rows
    ]


@symptom_bp.get("/symptom")
def by_symptom():
    q = (request.args.get("q") or "").strip()
    if not q:
        return jsonify({"ok": False, "error": "缺少参数 q（症状关键词）"}), 400

    qs = _expand(q)
    return jsonify({
        "ok": True,
        "q": q,
        "aliases": qs,
        "diseases": _match("Disease", qs),
        "treatments": _match("NonDrugTreatment", qs),
        "medications": _match("Medication", qs),
        "complications": _match("Complication", qs),
    })
