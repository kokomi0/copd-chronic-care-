/* ===================================================================
 * knowledge.js —— 知识库查询页
 *
 * 调用后端接口（js/api.js），查询本地 Neo4j 医学知识图谱：
 *   综合检索 / 按症状 / 药物相互作用 / 医生
 * =================================================================== */

(function (global) {
  'use strict';

  var mode = 'search';
  var lastView = null;   // 点进节点详情后，「返回」时回到哪

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 跳过从文档抽取的 field_XXX 编号字段，只展示有意义的属性 */
  function prettyProps(props) {
    var skip = /^field/;
    var out = '';
    Object.keys(props || {}).forEach(function (k) {
      if (skip.test(k)) return;
      var v = props[k];
      if (v === null || v === undefined || v === '') return;
      if (Array.isArray(v) && v.length === 0) return;
      var s = String(v);
      if (s.length > 80) s = s.slice(0, 80) + '…';
      out += '<div class="k-prop"><span class="k-key">' + escapeHtml(k) + '</span>' + escapeHtml(s) + '</div>';
    });
    return out;
  }

  /* 从节点属性里挑一个能当名字的字段（同后端 _display_name 的思路） */
  function nodeTitle(props) {
    var names = ['name', 'namecn', 'nameen', 'diseasename', 'genericname',
                 'brandname', 'complicationname', 'groupname', 'treatmentname', 'title', 'topic'];
    var low = {};
    Object.keys(props || {}).forEach(function (k) { low[k.toLowerCase()] = props[k]; });
    for (var i = 0; i < names.length; i++) {
      if (low[names[i]]) return low[names[i]];
    }
    return null;
  }

  function showNode(id) {
    var box = document.getElementById('kResults');
    var msg = document.getElementById('kMsg');
    msg.textContent = '';
    box.innerHTML = '<p class="empty">正在加载详情…</p>';
    Api.get('/api/node/' + encodeURIComponent(id)).then(function (data) {
      renderNodeDetail(box, data);
    }).catch(function (err) {
      box.innerHTML = '<p class="empty">加载详情失败：' + err.message + '</p>';
    });
  }

  function renderNodeDetail(box, data) {
    var props = data.properties || {};
    var title = nodeTitle(props);

    var html = '<p class="hint"><button class="btn-ghost" id="kBack">← 返回</button></p>'
             + '<div class="k-card">'
             +   (title ? '<div class="k-title">' + escapeHtml(title) + '</div>' : '')
             +   '<div class="k-labels">' + (data.labels || []).map(function (l) {
                   return '<span class="k-tag">' + escapeHtml(l) + '</span>';
                 }).join('') + '</div>'
             +   prettyProps(props)
             + '</div>';

    var neighbors = data.neighbors || [];
    if (neighbors.length) {
      html += '<div class="card"><h2 class="card-title">关联内容 <span class="badge">' + neighbors.length + '</span></h2>';
      neighbors.forEach(function (nb) {
        var rel = nb.type + (nb.direction === 'out' ? ' →' : ' ←');
        html += '<div class="k-item">'
              +   '<div class="k-title">' + escapeHtml(rel) + ' ' + escapeHtml(nb.labels && nb.labels[0]) + '</div>'
              +   prettyProps(nb.properties)
              + '</div>';
      });
      html += '</div>';
    }

    box.innerHTML = html;
    document.getElementById('kBack').addEventListener('click', function () { goBack(); });
  }

  function goBack() {
    if (lastView) lastView();
  }

  function renderSearch(box, data) {
    if (!data.results || !data.results.length) {
      box.innerHTML = '<p class="empty">没有找到相关内容。</p>';
      return;
    }
    var html = '<p class="hint">找到 ' + data.count + ' 条结果，点击条目可看详情</p>';
    data.results.forEach(function (r) {
      html += '<div class="k-card k-click" data-id="' + escapeHtml(r.id) + '">'
            +   '<div class="k-title">' + escapeHtml(r.title) + ' <span class="k-more">详情 ›</span></div>'
            +   '<div class="k-labels">' + (r.labels || []).map(function (l) {
                  return '<span class="k-tag">' + escapeHtml(l) + '</span>';
                }).join('') + '</div>'
            +   prettyProps(r.properties)
            + '</div>';
    });
    box.innerHTML = html;
  }

  function renderSymptom(box, data) {
    var groups = [
      ['相关疾病', data.diseases],
      ['非药物治疗', data.treatments],
      ['相关药物', data.medications],
      ['相关并发症', data.complications]
    ];
    var html = '';
    groups.forEach(function (g) {
      if (!g[1] || !g[1].length) return;
      html += '<div class="card"><h2 class="card-title">' + g[0] + '<span class="badge">' + g[1].length + '</span></h2>';
      g[1].forEach(function (item) {
        html += '<div class="k-item k-click" data-id="' + escapeHtml(item.id) + '">'
              + '<div class="k-title">' + escapeHtml(item.title) + ' <span class="k-more">详情 ›</span></div>'
              + prettyProps(item.properties)
              + '</div>';
      });
      html += '</div>';
    });
    box.innerHTML = html || '<p class="empty">没有找到与「' + escapeHtml(data.q) + '」相关的内容。</p>';
  }

  function renderInteractions(box, data) {
    if (!data.interactions || !data.interactions.length) {
      box.innerHTML = '<p class="empty">没有找到相关相互作用。</p>';
      return;
    }
    var html = '<p class="hint">共 ' + data.count + ' 条</p>';
    data.interactions.forEach(function (it) {
      var sev = it.Severity || '';
      var sevClass = /严重|重度|禁用/.test(sev) ? 'k-sev-danger'
                   : (/中度/.test(sev) ? 'k-sev-warn' : 'k-sev-ok');
      html += '<div class="k-card">'
            +   '<div class="k-title">' + escapeHtml(it.DrugA) + ' ＋ ' + escapeHtml(it.DrugB) + '</div>'
            +   '<span class="k-tag ' + sevClass + '">' + escapeHtml(sev) + '</span>'
            +   (it.Effect ? '<div class="k-prop"><span class="k-key">作用</span>' + escapeHtml(it.Effect) + '</div>' : '')
            +   (it.Recommendation ? '<div class="k-prop"><span class="k-key">建议</span>' + escapeHtml(it.Recommendation) + '</div>' : '')
            +   (it.Mechanism ? '<div class="k-prop"><span class="k-key">机制</span>' + escapeHtml(it.Mechanism) + '</div>' : '')
            + '</div>';
    });
    box.innerHTML = html;
  }

  function renderSchedules(list) {
    if (!list || !list.length) return '';
    var txt = list.map(function (s) {
      return (s.dayOfWeek || '') + ' ' + (s.startTime || '') + '-' + (s.endTime || '');
    }).join('；');
    return '<div class="k-prop"><span class="k-key">排班</span>' + escapeHtml(txt) + '</div>';
  }

  function renderDoctors(box, data, q) {
    var list = data.doctors || [];
    if (q) {
      var ql = q.toLowerCase();
      list = list.filter(function (x) {
        var d = x.doctor || {};
        return [d.name, d.hospital, d.department, d.specialty].some(function (s) {
          return s && String(s).toLowerCase().indexOf(ql) >= 0;
        });
      });
    }
    if (!list.length) {
      box.innerHTML = '<p class="empty">没有找到医生。</p>';
      return;
    }
    var html = '<p class="hint">共 ' + list.length + ' 位医生</p>';
    list.forEach(function (x) {
      var d = x.doctor || {};
      html += '<div class="k-card">'
            +   '<div class="k-title">' + escapeHtml(d.name) + '</div>'
            +   '<div class="k-labels">' + escapeHtml(d.hospital) + ' · ' + escapeHtml(d.department) + '</div>'
            +   '<div class="k-prop"><span class="k-key">职称</span>' + escapeHtml(d.title) + '</div>'
            +   (d.specialty ? '<div class="k-prop"><span class="k-key">擅长</span>' + escapeHtml(d.specialty) + '</div>' : '')
            +   (d.consultationHours ? '<div class="k-prop"><span class="k-key">门诊</span>' + escapeHtml(d.consultationHours) + '</div>' : '')
            +   renderSchedules(x.schedules)
            + '</div>';
    });
    box.innerHTML = html;
  }

  /* 分类浏览：列出所有节点标签（带数量），点进去看该类全部节点 */
  function setCategoryUI(isCategory) {
    document.getElementById('kQuery').classList.toggle('hidden', isCategory);
    document.getElementById('kSearch').classList.toggle('hidden', isCategory);
  }

  function showCategories() {
    var box = document.getElementById('kResults');
    var msg = document.getElementById('kMsg');
    box.innerHTML = '<p class="empty">正在加载分类…</p>';
    lastView = showCategories;
    Api.get('/api/schema').then(function (data) {
      var labels = (data.labels || []).filter(function (l) { return l.count > 0; });
      var html = '<div class="k-cat-list">';
      labels.forEach(function (l) {
        html += '<button class="k-cat" data-label="' + escapeHtml(l.label) + '">'
              +   '<span>' + escapeHtml(l.label) + '</span>'
              +   '<span class="k-cat-count">' + l.count + '</span>'
              + '</button>';
      });
      html += '</div>';
      box.innerHTML = html;
      msg.textContent = '';
      Array.prototype.forEach.call(box.querySelectorAll('.k-cat'), function (btn) {
        btn.addEventListener('click', function () { showCategoryNodes(btn.dataset.label); });
      });
    }).catch(function (err) {
      box.innerHTML = '<p class="empty">加载分类失败：' + err.message + '</p>';
    });
  }

  function showCategoryNodes(label) {
    var box = document.getElementById('kResults');
    var msg = document.getElementById('kMsg');
    box.innerHTML = '<p class="empty">正在加载「' + escapeHtml(label) + '」…</p>';
    lastView = function () { showCategoryNodes(label); };
    Api.get('/api/list?label=' + encodeURIComponent(label)).then(function (data) {
      msg.textContent = '';
      renderSearch(box, data);
      var back = '<p class="hint"><button class="btn-ghost" id="kBack">← 返回分类</button></p>';
      box.insertAdjacentHTML('afterbegin', back);
      document.getElementById('kBack').addEventListener('click', showCategories);
    }).catch(function (err) {
      box.innerHTML = '<p class="empty">加载失败：' + err.message + '</p>';
    });
  }

  function doQuery(q) {
    q = (q || '').trim();
    var msg = document.getElementById('kMsg');
    var box = document.getElementById('kResults');
    msg.textContent = '查询中…';
    box.innerHTML = '';
    lastView = function () { doQuery(document.getElementById('kQuery').value); };

    var p;
    if (mode === 'search') {
      if (!q) { msg.textContent = '请输入关键词'; return; }
      p = Api.get('/api/search?q=' + encodeURIComponent(q));
    } else if (mode === 'symptom') {
      if (!q) { msg.textContent = '请输入症状，如「呼吸困难」'; return; }
      p = Api.get('/api/symptom?q=' + encodeURIComponent(q));
    } else if (mode === 'interactions') {
      p = Api.get('/api/interactions' + (q ? '?q=' + encodeURIComponent(q) : ''));
    } else {
      p = Api.get('/api/doctors');
    }

    p.then(function (data) {
      msg.textContent = '';
      if (mode === 'search') renderSearch(box, data);
      else if (mode === 'symptom') renderSymptom(box, data);
      else if (mode === 'interactions') renderInteractions(box, data);
      else renderDoctors(box, data, q);
    }).catch(function (err) {
      msg.textContent = '查询失败：' + err.message + '（请确认已启动后端服务）';
    });
  }

  function init() {
    var seg = document.getElementById('kMode');
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      Array.prototype.forEach.call(seg.children, function (b) {
        b.classList.toggle('active', b === btn);
      });
      mode = btn.dataset.mode;
      var isCategory = (mode === 'category');
      setCategoryUI(isCategory);
      document.getElementById('kResults').innerHTML = '';
      document.getElementById('kMsg').textContent = '';
      if (isCategory) showCategories();
    });

    document.getElementById('kSearch').addEventListener('click', function () {
      doQuery(document.getElementById('kQuery').value);
    });
    document.getElementById('kQuery').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doQuery(e.target.value);
    });

    // 点条目看节点详情（搜索 / 症状 / 分类列表的结果都带 data-id）
    document.getElementById('kResults').addEventListener('click', function (e) {
      var el = e.target.closest('[data-id]');
      if (el) showNode(el.dataset.id);
    });
  }

  global.Knowledge = { init: init };
})(window);
