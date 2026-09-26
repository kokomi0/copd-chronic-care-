/* ===================================================================
 * ask-doctor.js —— 问医生页
 *
 * 上半部分：Neo4j 风格的知识图谱可视化（手写 Canvas 力导向布局，
 *           节点按标签着色、可拖拽，数据来自后端 /api/graph）。
 * 下半部分：提问 AI 对话区，问题发给后端 /api/ask，由本地 Ollama 回答。
 * =================================================================== */

(function (global) {
  'use strict';

  var PALETTE = [
    '#0b7285', '#e8590c', '#7048e8', '#2f9e44', '#c2255c', '#1971c2',
    '#e6a700', '#862e9c', '#12b886', '#f03e3e', '#5c940d', '#364fc7'
  ];

  var canvas = null, ctx = null;
  var nodes = [];        // {id, label, title, x, y, vx, vy, deg}
  var edges = [];        // {s, t, type}（s/t 是 nodes 的下标）
  var labelColor = {};   // 标签 -> 颜色
  var simRunning = false;
  var rafId = null;
  var dragIndex = -1;
  var lastW = 0, lastH = 0;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- 数据加载 ---------- */
  function loadGraph() {
    drawEmpty('正在加载知识图谱…');
    Api.get('/api/graph').then(function (data) {
      buildGraph(data.nodes || [], data.edges || []);
    }).catch(function (err) {
      drawEmpty('加载图谱失败：' + err.message + '（请先启动后端服务）');
      document.getElementById('askLegend').innerHTML = '';
      document.getElementById('askStat').textContent = '';
    });
  }

  function buildGraph(rawNodes, rawEdges) {
    var idToIndex = {};
    var pi = 0;
    nodes = [];
    labelColor = {};

    rawNodes.forEach(function (n) {
      var label = n.label || '节点';
      if (!labelColor[label]) {
        labelColor[label] = PALETTE[pi % PALETTE.length];
        pi++;
      }
      idToIndex[n.id] = nodes.length;
      nodes.push({
        id: n.id,
        label: label,
        title: n.title || '(未命名)',
        x: 0.5, y: 0.5, vx: 0, vy: 0, deg: 0
      });
    });

    edges = [];
    rawEdges.forEach(function (e) {
      var s = idToIndex[e.source], t = idToIndex[e.target];
      if (s === undefined || t === undefined || s === t) return;
      edges.push({ s: s, t: t, type: e.type });
      nodes[s].deg++;
      nodes[t].deg++;
    });

    renderLegend();
    reLayout();
  }

  function renderLegend() {
    var stat = document.getElementById('askStat');
    if (stat) stat.textContent = nodes.length + ' 个节点 · ' + edges.length + ' 条关系';

    var legend = document.getElementById('askLegend');
    var html = '';
    Object.keys(labelColor).forEach(function (l) {
      html += '<span class="ask-legend-item">'
            +   '<span class="ask-legend-dot" style="background:' + labelColor[l] + '"></span>'
            +   escapeHtml(l)
            + '</span>';
    });
    legend.innerHTML = html;
  }

  /* ---------- 力导向布局 ---------- */
  function reLayout() {
    nodes.forEach(function (n) {
      n.x = 0.5 + (Math.random() - 0.5) * 0.3;
      n.y = 0.5 + (Math.random() - 0.5) * 0.3;
      n.vx = 0; n.vy = 0;
    });
    startSim();
  }

  function startSim() {
    if (simRunning || !nodes.length) return;
    simRunning = true;
    rafId = requestAnimationFrame(tick);
  }

  function stopSim() {
    simRunning = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  function tick() {
    step();
    draw();
    rafId = requestAnimationFrame(tick);
  }

  function step() {
    var n = nodes.length;
    var rep = 0.0008, rest = 0.09, spring = 0.05, grav = 0.004, damp = 0.85;
    var maxv = 0.025;

    // 斥力：所有节点两两相斥（节点少，直接 O(n²)）
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var a = nodes[i], b = nodes[j];
        var dx = a.x - b.x, dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 0.0001) { d2 = 0.0001; dx = 0.01; dy = 0.01; }
        var d = Math.sqrt(d2);
        var f = rep / d2;
        a.vx += dx / d * f; a.vy += dy / d * f;
        b.vx -= dx / d * f; b.vy -= dy / d * f;
      }
    }

    // 弹簧：相连的节点拉近到理想距离
    edges.forEach(function (e) {
      var a = nodes[e.s], b = nodes[e.t];
      var dx = b.x - a.x, dy = b.y - a.y;
      var d = Math.sqrt(dx * dx + dy * dy) || 0.001;
      var f = (d - rest) * spring;
      a.vx += dx / d * f; a.vy += dy / d * f;
      b.vx -= dx / d * f; b.vy -= dy / d * f;
    });

    // 向中心的重力 + 积分（被拖拽的节点固定在手指位置）
    nodes.forEach(function (nd, i) {
      if (i === dragIndex) { nd.vx = 0; nd.vy = 0; return; }
      nd.vx += (0.5 - nd.x) * grav;
      nd.vy += (0.5 - nd.y) * grav;
      nd.vx *= damp;
      nd.vy *= damp;
      // 限速，防止刚起步时四处乱飞
      var sv = Math.sqrt(nd.vx * nd.vx + nd.vy * nd.vy);
      if (sv > maxv) { nd.vx *= maxv / sv; nd.vy *= maxv / sv; }
      nd.x += nd.vx;
      nd.y += nd.vy;
      nd.x = Math.max(0.04, Math.min(0.96, nd.x));
      nd.y = Math.max(0.04, Math.min(0.96, nd.y));
    });
  }

  /* ---------- 绘制 ---------- */
  function draw() {
    if (!ctx) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;

    // 只在尺寸变化时重建画布，避免每帧清空重设
    var dpr = global.devicePixelRatio || 1;
    if (w !== lastW || h !== lastH) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastW = w; lastH = h;
    }
    ctx.clearRect(0, 0, w, h);

    var showEdgeLabel = edges.length <= 40;

    // 边
    ctx.strokeStyle = '#c9d3d9';
    ctx.lineWidth = 1;
    edges.forEach(function (e) {
      var a = nodes[e.s], b = nodes[e.t];
      var ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      if (showEdgeLabel && e.type) {
        ctx.fillStyle = '#9aa5ad';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(e.type, (ax + bx) / 2, (ay + by) / 2 - 2);
      }
    });

    // 节点
    nodes.forEach(function (nd, i) {
      var x = nd.x * w, y = nd.y * h;
      var r = 5 + Math.min(nd.deg, 12) * 0.7;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = labelColor[nd.label] || '#8a959c';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      if (i === dragIndex) {
        ctx.strokeStyle = '#e8590c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      var name = String(nd.title || '');
      if (name.length > 7) name = name.slice(0, 7) + '…';
      ctx.fillStyle = '#3a4a53';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(name, x, y + r + 12);
    });
  }

  function drawEmpty(text) {
    if (!ctx) return;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    var dpr = global.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#9aa5ad';
    ctx.font = '15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2);
    ctx.textBaseline = 'alphabetic';
  }

  /* ---------- 拖拽节点 ---------- */
  function nodeRadius(nd) { return 5 + Math.min(nd.deg, 12) * 0.7; }

  function hitTest(px, py) {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    for (var i = nodes.length - 1; i >= 0; i--) {
      var nd = nodes[i];
      var dx = px - nd.x * w, dy = py - nd.y * h;
      var r = nodeRadius(nd) + 8;
      if (dx * dx + dy * dy <= r * r) return i;
    }
    return -1;
  }

  function onPointerDown(e) {
    var rect = canvas.getBoundingClientRect();
    var idx = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    if (idx >= 0) {
      dragIndex = idx;
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
    }
  }

  function onPointerMove(e) {
    if (dragIndex < 0) return;
    var rect = canvas.getBoundingClientRect();
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var nd = nodes[dragIndex];
    nd.x = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / w));
    nd.y = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / h));
    nd.vx = 0; nd.vy = 0;
    e.preventDefault();
  }

  function onPointerUp() { dragIndex = -1; }

  /* ---------- 提问 AI ---------- */
  function appendMsg(role, text, loading) {
    var chat = document.getElementById('askChat');
    var div = document.createElement('div');
    div.className = 'ask-msg ask-msg-' + role + (loading ? ' loading' : '');
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function sendQuestion() {
    var input = document.getElementById('askInput');
    var btn = document.getElementById('askSend');
    var q = (input.value || '').trim();
    if (!q) return;
    input.value = '';
    appendMsg('user', q);
    var loading = appendMsg('ai', '正在思考…', true);
    btn.disabled = true;

    Api.post('/api/ask', { question: q }).then(function (data) {
      loading.remove();
      appendMsg('ai', data.answer || '（没有回答）');
    }).catch(function (err) {
      loading.remove();
      appendMsg('ai', '出错了：' + err.message);
    }).then(function () {
      btn.disabled = false;
    });
  }

  /* ---------- 生命周期 ---------- */
  function render() {
    if (!ctx) {
      canvas = document.getElementById('askGraph');
      ctx = canvas && canvas.getContext('2d');
    }
    if (!canvas || !ctx) return;

    if (nodes.length === 0) {
      loadGraph();
    } else {
      startSim();
      draw();
    }

    var chat = document.getElementById('askChat');
    if (chat && chat.children.length === 0) {
      appendMsg('ai', '你好，我是慢阻肺健康助手。有什么想了解的，可以在下方问我。');
    }
  }

  function init() {
    canvas = document.getElementById('askGraph');
    ctx = canvas.getContext('2d');

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerUp);

    document.getElementById('askSend').addEventListener('click', sendQuestion);
    document.getElementById('askInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') sendQuestion();
    });
    document.getElementById('askReload').addEventListener('click', loadGraph);

    // 切走本页时停掉动画，省电
    document.addEventListener('copd:pagechange', function (e) {
      if (e.detail !== 'ask') stopSim();
    });
  }

  global.AskDoctor = { init: init, render: render };
})(window);
