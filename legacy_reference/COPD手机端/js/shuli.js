/* ===================================================================
 * shuli.js —— 健康梳理 / 就诊小结
 *
 * 把最近的记录汇总成一张"就诊小结"，复诊时直接给医生看：
 *   - 基本信息（来自个人健康档案）
 *   - 近 30 天打卡 / 血氧 / 气促
 *   - 用药依从、呼吸训练
 *   - 就医提示
 * 支持「打印 / 另存 PDF」和「复制文字版」两种导出方式。
 *
 * 【说明】这里的就医提示只是提醒，不是诊断。
 * =================================================================== */

(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 近 30 天打卡统计 */
  function summarizeCheckins() {
    var days = Store.recentDays(30);
    var all = Store.getCheckins();
    var records = days.map(function (d) { return all[d] || null; }).filter(Boolean);

    if (!records.length) {
      return { days: 0, spo2Avg: null, spo2Min: null, spo2Last: null, dyspneaLast: null, weightFirst: null, weightLast: null };
    }

    var spo2 = records.map(function (r) { return r.spo2; })
                      .filter(function (v) { return typeof v === 'number'; });
    var dyspnea = records.map(function (r) { return r.dyspnea; });
    var weights = records.map(function (r) { return r.weight; })
                         .filter(function (v) { return typeof v === 'number'; });
    var sum = spo2.reduce(function (a, b) { return a + b; }, 0);

    return {
      days: records.length,
      spo2Avg: spo2.length ? Math.round(sum / spo2.length) : null,
      spo2Min: spo2.length ? Math.min.apply(null, spo2) : null,
      spo2Last: spo2.length ? spo2[spo2.length - 1] : null,
      dyspneaLast: dyspnea.length ? dyspnea[dyspnea.length - 1] : null,
      weightFirst: weights.length ? weights[0] : null,
      weightLast: weights.length ? weights[weights.length - 1] : null
    };
  }

  /* 近 7 天用药依从率 */
  function summarizeMeds() {
    var meds = Store.getMeds();
    if (!meds.length) return { total: 0, due: 0, taken: 0, rate: 0 };

    var days = Store.recentDays(7);
    var logs = Store.getMedLogs();
    var due = 0, taken = 0;
    days.forEach(function (d) {
      meds.forEach(function (m) {
        due++;
        if ((logs[d] || []).indexOf(m.id) >= 0) taken++;
      });
    });
    return { total: meds.length, due: due, taken: taken, rate: due ? Math.round(taken / due * 100) : 0 };
  }

  /* 近 7 天呼吸训练 */
  function summarizeTraining() {
    var days = Store.recentDays(7);
    var all = Store.getTraining();
    var sec = 0, sets = 0;
    days.forEach(function (d) {
      var t = all[d];
      if (t) { sec += t.seconds || 0; sets += t.sets || 0; }
    });
    return { seconds: sec, sets: sets };
  }

  function buildAlert(c) {
    var reasons = [];
    if (c.spo2Last !== null && c.spo2Last < 90) reasons.push('最近血氧 ' + c.spo2Last + '%（低于 90%）');
    if (c.dyspneaLast !== null && c.dyspneaLast >= 3) reasons.push('最近气促较明显（' + c.dyspneaLast + ' 级）');
    if (!reasons.length) return '';
    return '⚠️ ' + reasons.join('；') + '。<br>建议尽快到<strong>呼吸内科</strong>就诊。'
         + '如果出现口唇发紫、说不出整句话、意识模糊，请立即拨打 120。';
  }

  function renderProfile() {
    var box = document.getElementById('shuliProfile');
    if (!box) return;
    var p = Store.getProfile();
    var parts = [];
    if (p.name) parts.push(escapeHtml(p.name));
    if (p.age) parts.push(p.age + ' 岁');
    if (p.sex) parts.push(p.sex);
    if (p.year) parts.push('确诊 ' + p.year + ' 年');
    if (p.gold) parts.push(p.gold === '未知' ? 'GOLD 分期未知' : 'GOLD ' + p.gold + ' 期');
    if (p.smoke) parts.push(p.smoke === '仍在吸' ? '吸烟' : '吸烟（' + p.smoke + '）');
    if (p.bmi) parts.push('BMI ' + p.bmi);

    box.innerHTML = parts.length
      ? '<div class="record"><div class="record-body">' + parts.join(' · ') + '</div></div>'
      : '<p class="empty">还没有健康档案，去「我的」页填写。</p>';
  }

  function renderSummary() {
    var box = document.getElementById('shuliSummary');
    if (!box) return;

    var c = summarizeCheckins();
    var m = summarizeMeds();
    var t = summarizeTraining();

    var rows = [];
    if (c.days) {
      rows.push(['打卡', '近 30 天 ' + c.days + ' 天']);
      if (c.spo2Avg !== null) rows.push(['血氧', '均值 ' + c.spo2Avg + '% · 最低 ' + c.spo2Min + '%']);
      if (c.dyspneaLast !== null) rows.push(['最近气促', c.dyspneaLast + ' 级']);
    } else {
      rows.push(['打卡', '最近 30 天还没有记录']);
    }
    rows.push(['用药', m.total ? m.total + ' 种 · 近 7 天依从 ' + m.rate + '%' : '还没有设置提醒']);

    var trainMin = Math.floor(t.seconds / 60);
    rows.push(['训练', t.seconds ? '近 7 天 ' + trainMin + ' 分钟 · ' + t.sets + ' 次呼吸' : '近 7 天还没有训练']);

    box.innerHTML = rows.map(function (r) {
      return '<div class="shuli-row"><span class="k-key">' + r[0] + '</span>' + escapeHtml(r[1]) + '</div>';
    }).join('');

    var alertBox = document.getElementById('shuliAlert');
    if (alertBox) {
      var msg = buildAlert(c);
      alertBox.innerHTML = msg || '<p class="empty">近期数据平稳，继续按医嘱用药和记录。</p>';
    }
  }

  /* 生成纯文字版小结（复制到微信/短信用） */
  function buildTextReport() {
    var c = summarizeCheckins();
    var m = summarizeMeds();
    var t = summarizeTraining();
    var p = Store.getProfile();

    var lines = [];
    lines.push('【慢阻肺健康管理 · 就诊小结】');
    lines.push('生成日期：' + new Date().toLocaleDateString('zh-CN'));
    lines.push('');

    var base = [];
    if (p.name) base.push(p.name);
    if (p.age) base.push(p.age + ' 岁');
    if (p.sex) base.push(p.sex);
    if (p.year) base.push('确诊 ' + p.year + ' 年');
    if (p.gold) base.push(p.gold === '未知' ? 'GOLD 分期未知' : 'GOLD ' + p.gold + ' 期');
    if (p.bmi) base.push('BMI ' + p.bmi);
    lines.push('基本信息：' + (base.join('，') || '未填写'));
    lines.push('');

    lines.push('近 30 天打卡：' + (c.days ? c.days + ' 天' : '无记录'));
    if (c.spo2Avg !== null) lines.push('血氧：均值 ' + c.spo2Avg + '%，最低 ' + c.spo2Min + '%');
    if (c.dyspneaLast !== null) lines.push('最近气促：' + c.dyspneaLast + ' 级');
    lines.push('用药：' + (m.total ? m.total + ' 种，近 7 天依从 ' + m.rate + '%' : '未设置'));
    lines.push('呼吸训练：' + (t.seconds ? '近 7 天 ' + Math.floor(t.seconds / 60) + ' 分钟' : '无'));

    var alert = buildAlert(c).replace(/<[^>]+>/g, '');
    if (alert) { lines.push(''); lines.push('提示：' + alert); }
    lines.push('');
    lines.push('（本小结仅供医生参考，不能替代诊断。）');
    return lines.join('\n');
  }

  function copyText() {
    var txt = buildTextReport();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        function () { alert('已复制，可粘贴到微信/短信发给医生或家人。'); },
        function () { fallbackCopy(txt); }
      );
    } else {
      fallbackCopy(txt);
    }
  }

  function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      alert('已复制，可粘贴到微信/短信发给医生或家人。');
    } catch (e) {
      alert('复制失败，请长按手动复制。');
    }
    document.body.removeChild(ta);
  }

  function render() {
    renderProfile();
    renderSummary();
  }

  function init() {
    document.getElementById('shuliPrint').addEventListener('click', function () { window.print(); });
    document.getElementById('shuliCopy').addEventListener('click', copyText);
  }

  global.Shuli = { init: init, render: render };
})(window);
