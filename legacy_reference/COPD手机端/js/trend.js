/* ===================================================================
 * trend.js —— 趋势页
 *
 * 把打卡记录画成折线图，并在情况变差时给出就医提示。
 *
 * 【注意】这里的提示只是"提醒你去看医生"，不是诊断。
 * 判断标准用的是慢阻肺常见的公认警示信号，不替医生下结论。
 * =================================================================== */

(function (global) {
  'use strict';

  var days = 7;   // 当前显示的天数，7 或 30

  /* 根据最近的记录，决定要不要显示红色就医提示条 */
  function buildAlert(records) {
    // records 是从旧到新的数组，元素可能是 null（那天没记）
    var withData = records.filter(function (r) { return r !== null; });
    if (withData.length === 0) return '';

    var reasons = [];

    // 1) 最近一次血氧低于 90%
    var lastSpo2 = null;
    for (var i = withData.length - 1; i >= 0; i--) {
      if (typeof withData[i].spo2 === 'number') { lastSpo2 = withData[i].spo2; break; }
    }
    if (lastSpo2 !== null && lastSpo2 < 90) {
      reasons.push('最近一次血氧只有 ' + lastSpo2 + '%（低于 90%）');
    }

    // 2) 连续 3 天气促达到 3 级以上（走 100 米就得停）
    var tail = records.slice(-3);
    var allSevere = tail.length === 3 && tail.every(function (r) {
      return r !== null && r.dyspnea >= 3;
    });
    if (allSevere) {
      reasons.push('连续 3 天气促较重');
    }

    // 3) 痰量明显增多（今天 >=3，且比前几天平均高 1 级以上）
    var last = records[records.length - 1];
    if (last && last.sputum >= 3) {
      var prev = records.slice(-7, -1).filter(function (r) { return r !== null; });
      if (prev.length >= 2) {
        var avg = prev.reduce(function (s, r) { return s + r.sputum; }, 0) / prev.length;
        if (last.sputum - avg >= 1) reasons.push('痰量比前几天明显增多');
      }
    }

    if (reasons.length === 0) return '';
    return '⚠️ ' + reasons.join('；') + '。<br>建议尽快到<strong>呼吸内科</strong>就诊。'
         + '如果出现口唇发紫、说不出整句话、意识模糊，请立即拨打 120。';
  }

  /* 渲染历史记录列表（新的在上面） */
  function buildList(dates, records) {
    var box = document.getElementById('trendList');
    var html = '';

    for (var i = records.length - 1; i >= 0; i--) {
      var r = records[i];
      if (!r) continue;
      var parts = ['咳嗽 ' + r.cough, '咳痰 ' + r.sputum, '气促 ' + r.dyspnea];
      if (typeof r.spo2 === 'number') parts.push('血氧 ' + r.spo2 + '%');
      if (typeof r.weight === 'number') parts.push('体重 ' + r.weight);
      if (typeof r.hr === 'number') parts.push('心率 ' + r.hr);

      html += '<div class="record">'
            +   '<div class="record-date">' + Store.shortDate(dates[i]) + '</div>'
            +   '<div class="record-body">' + parts.join('　') + '</div>'
            +   (r.note ? '<div class="record-note">' + escapeHtml(r.note) + '</div>' : '')
            + '</div>';
    }

    box.innerHTML = html || '<p class="empty">最近' + days + '天还没有记录。</p>';
  }

  /* 用户输入的备注要转义，避免特殊字符把页面弄乱 */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function render() {
    var dates = Store.recentDays(days);
    var all = Store.getCheckins();
    var records = dates.map(function (d) { return all[d] || null; });
    var labels = dates.map(Store.shortDate);

    // ---- 就医提示条 ----
    var alertBox = document.getElementById('trendAlert');
    var msg = buildAlert(records);
    if (msg) {
      alertBox.innerHTML = msg;
      alertBox.classList.remove('hidden');
    } else {
      alertBox.classList.add('hidden');
    }

    // ---- 气促折线（0-4 级）----
    Chart.drawLine(document.getElementById('chartDyspnea'), {
      labels: labels,
      data: records.map(function (r) { return r ? r.dyspnea : null; }),
      min: 0, max: 4,
      color: '#0b7285',
      unit: '级'
    });

    // ---- 血氧折线（85-100%）----
    Chart.drawLine(document.getElementById('chartSpo2'), {
      labels: labels,
      data: records.map(function (r) {
        return (r && typeof r.spo2 === 'number') ? r.spo2 : null;
      }),
      min: 85, max: 100,
      color: '#2b8a3e',
      unit: '%'
    });

    // ---- 体重折线（范围跟着数据走，方便看出突然变重）----
    var weights = records.map(function (r) {
      return (r && typeof r.weight === 'number') ? r.weight : null;
    });
    var wVals = weights.filter(function (v) { return v !== null; });
    var wMin = 30, wMax = 100;
    if (wVals.length) {
      var lo = Math.min.apply(null, wVals);
      var hi = Math.max.apply(null, wVals);
      if (lo === hi) { lo -= 2; hi += 2; }
      else { var pad = Math.max(1, (hi - lo) * 0.35); lo -= pad; hi += pad; }
      wMin = lo; wMax = hi;
    }
    Chart.drawLine(document.getElementById('chartWeight'), {
      labels: labels,
      data: weights,
      min: wMin, max: wMax,
      color: '#b06f00',
      unit: 'kg'
    });

    // ---- 心率折线（40-140）----
    Chart.drawLine(document.getElementById('chartHr'), {
      labels: labels,
      data: records.map(function (r) {
        return (r && typeof r.hr === 'number') ? r.hr : null;
      }),
      min: 40, max: 140,
      color: '#d6336c',
      unit: ''
    });

    buildList(dates, records);
  }

  function init() {
    var seg = document.getElementById('trendRange');
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      Array.prototype.forEach.call(seg.children, function (b) {
        b.classList.toggle('active', b === btn);
      });
      days = Number(btn.dataset.days);
      render();
    });

    // 打卡保存后自动刷新
    document.addEventListener('copd:datachanged', render);
  }

  global.Trend = { init: init, render: render };
})(window);
