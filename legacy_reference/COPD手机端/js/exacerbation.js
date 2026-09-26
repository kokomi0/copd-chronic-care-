/* ===================================================================
 * exacerbation.js —— 急性加重日记
 *
 * 急性加重（AECOPD）：咳嗽、咳痰、气促突然明显变重的一段时期。
 * 这里记下每次加重的时间、诱因、是否用药/住院，方便复诊时和医生复盘，
 * 也能看出加重的规律（比如一换季就犯）。
 * =================================================================== */

(function (global) {
  'use strict';

  var TRIGGERS = ['感冒/受凉', '雾霾/空气差', '劳累/活动多', '停药/漏药', '其他/不明'];

  var currentTriggers = [];
  var elDate, elTriggerBox, elNote, elMsg, elList, elStat;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function segValue(id) {
    var active = document.querySelector('#' + id + ' .seg-btn.active');
    return active ? active.dataset.v : null;
  }

  function setSeg(id, val) {
    var btns = document.querySelectorAll('#' + id + ' .seg-btn');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('active', b.dataset.v === String(val));
    });
  }

  /* 诱因是一排可多选的小按钮（.chip） */
  function buildTriggers() {
    elTriggerBox.innerHTML = '';
    TRIGGERS.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.textContent = t;
      btn.classList.toggle('selected', currentTriggers.indexOf(t) >= 0);
      btn.addEventListener('click', function () {
        var i = currentTriggers.indexOf(t);
        if (i >= 0) { currentTriggers.splice(i, 1); } else { currentTriggers.push(t); }
        btn.classList.toggle('selected', i < 0);
      });
      elTriggerBox.appendChild(btn);
    });
  }

  function save() {
    var date = elDate.value || todayStr();
    var ex = {
      id: String(Date.now()),
      date: date,
      triggers: currentTriggers.slice(),
      antibiotic: segValue('exAntibiotic') === '是',
      hospital: segValue('exHospital') === '是',
      note: elNote.value.trim()
    };

    if (!Store.addExacerbation(ex)) { elMsg.textContent = ''; return; }

    // 重置表单
    currentTriggers = [];
    buildTriggers();
    setSeg('exAntibiotic', null);
    setSeg('exHospital', null);
    elNote.value = '';
    elDate.value = todayStr();

    elMsg.style.color = '#2b8a3e';
    elMsg.textContent = '已记录 ✓';
    render();
  }

  function renderStat() {
    var list = Store.getExacerbations();
    var now = new Date();
    var oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    var count = list.filter(function (e) { return new Date(e.date) >= oneYearAgo; }).length;

    elStat.innerHTML = count
      ? '近一年共 <strong>' + count + '</strong> 次急性加重。'
        + (count >= 2 ? '一年加重 2 次及以上，建议和医生聊聊调整方案。' : '')
      : '近一年没有记录急性加重。';
  }

  function renderList() {
    var list = Store.getExacerbations();
    if (!list.length) {
      elList.innerHTML = '<p class="empty">还没有记录。出现急性加重时，在上面记一笔。</p>';
      return;
    }
    var html = '';
    for (var i = list.length - 1; i >= 0; i--) {
      var e = list[i];
      var tags = (e.triggers || []).map(escapeHtml).join('、');
      var flags = [];
      if (e.antibiotic) flags.push('用了抗生素/激素');
      if (e.hospital) flags.push('住院');

      html += '<div class="record">'
            +   '<div class="card-head">'
            +     '<span class="record-date">' + escapeHtml(e.date) + '</span>'
            +     '<button class="med-del" data-id="' + escapeHtml(e.id) + '">删除</button>'
            +   '</div>'
            +   (tags ? '<div class="record-body">诱因：' + tags + '</div>' : '')
            +   (flags.length ? '<div class="record-body">' + flags.join(' · ') + '</div>' : '')
            +   (e.note ? '<div class="record-note">' + escapeHtml(e.note) + '</div>' : '')
            + '</div>';
    }
    elList.innerHTML = html;
  }

  function onListClick(e) {
    var del = e.target.closest('.med-del');
    if (!del) return;
    if (confirm('删除这条记录？')) {
      Store.removeExacerbation(del.dataset.id);
      render();
    }
  }

  function render() {
    renderStat();
    renderList();
  }

  function init() {
    elDate = document.getElementById('exDate');
    elTriggerBox = document.getElementById('exTriggers');
    elNote = document.getElementById('exNote');
    elMsg = document.getElementById('exMsg');
    elList = document.getElementById('exList');
    elStat = document.getElementById('exStat');

    elDate.value = todayStr();
    buildTriggers();

    // 是/否按钮组
    ['exAntibiotic', 'exHospital'].forEach(function (id) {
      document.getElementById(id).addEventListener('click', function (e) {
        var btn = e.target.closest('.seg-btn');
        if (!btn) return;
        var seg = document.getElementById(id);
        Array.prototype.forEach.call(seg.children, function (b) {
          b.classList.toggle('active', b === btn);
        });
      });
    });

    document.getElementById('exSave').addEventListener('click', save);
    elList.addEventListener('click', onListClick);

    render();
  }

  global.Exacerbation = { init: init, render: render };
})(window);
