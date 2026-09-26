# -*- coding: utf-8 -*-
"""问医生 AI 问答：调用本地 Ollama 大模型生成回答。

前端把问题 POST 到 /api/ask，这里转给 Ollama 的 /api/chat（关闭流式），
再把回答回传。大模型只做健康科普，不代替医生诊断。
"""
import json
import urllib.request

from flask import Blueprint, jsonify, request

from config import Config

ask_bp = Blueprint("ask", __name__, url_prefix="/api")

SYSTEM_PROMPT = (
    "你是「慢阻肺健康管理」App 里的问医生助手。请用中文、温和耐心的语气回答，"
    "回答尽量简洁、通俗，适合中老年慢阻肺患者理解。"
    "你只提供慢阻肺（COPD）相关的健康科普和一般性建议，"
    "不能替代医生诊断；涉及用药调整、急性加重或紧急情况时，要提醒用户及时就医。"
)


def _chat(question):
    url = Config.OLLAMA_BASE_URL.rstrip("/") + "/api/chat"
    payload = json.dumps({
        "model": Config.OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": question},
        ],
        "stream": False,
    }).encode("utf-8")

    req = urllib.request.Request(
        url, data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    return (data.get("message") or {}).get("content", "")


@ask_bp.post("/ask")
def ask():
    body = request.get_json(silent=True) or {}
    question = (body.get("question") or "").strip()
    if not question:
        return jsonify({"ok": False, "error": "请先输入问题"}), 400

    try:
        answer = _chat(question)
    except Exception as e:
        return jsonify({
            "ok": False,
            "error": "AI 回答失败，请确认 Ollama 已启动：" + str(e),
        }), 502

    if not answer:
        return jsonify({"ok": False, "error": "模型没有返回内容"}), 502

    return jsonify({"ok": True, "answer": answer})
