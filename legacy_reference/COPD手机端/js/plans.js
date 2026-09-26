/* ===================================================================
 * plans.js —— 疫苗 / 复诊提醒
 *
 * 慢阻肺随访里几件有周期的事：流感疫苗、肺炎疫苗、肺功能复查。
 * 记下「上次完成」的日期，自动算出「下次建议」时间并提示是否到期。
 * =================================================================== */

(function (global) {
  'use strict';

  var PLANS = [
    { key: 'flu',    label: '流感疫苗',  years: 1, hint: '每年 1 次，建议每年秋季接种' },
    { key: 'pneumo', label: '肺炎疫苗',  years: 5, hint: '每 5 年 1 次，遵医嘱' },
    { key: 'pft',    label: '肺功能复查', years: 1, hint: '每年复查一次肺功能' }
  ];

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function nextDue(last, years) {
    if (!last) return null;
    var d = new Date(last + 'T00:00:00');
    d.setFullYear(d.getFullYear() + years);
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function isDue(next) {
    return next ? next <= todayStr() : false;
  }

  function render() {
    var box = document.getElementById('plansList');
    var plans = Store.getPlans();

    var html = '';
    PLANS.forEach(function (p) {
      var last = plans[p.key] || null;
      var next = nextDue(last, p.years);
      var due = isDue(next);

      html += '<div class="plan-item">'
            +   '<div class="med-info">'
            +     '<div class="med-name">' + p.label + '</div>'
            +     '<div class="med-meta">' + p.hint + '</div>'
            +     '<div class="med-meta">上次完成：' + (last ? Store.shortDate(last) : '未记录') + '</div>'
            +     '<div class="med-meta">下次建议：' + (next ? Store.shortDate(next) : '—')
            +       (due ? ' <span class="plan-due">已到期</span>' : '') + '</div>'
            +   '</div>'
            +   '<button class="btn-ghost plan-done" data-key="' + p.key + '">今天已完成</button>'
            + '</div>';
    });
    box.innerHTML = html;
  }

  function onClick(e) {
    var btn = e.target.closest('.plan-done');
    if (!btn) return;
    var key = btn.dataset.key;
    Store.savePlan(key, todayStr());
    render();
  }

  function init() {
    document.getElementById('plansList').addEventListener('click', onClick);
    render();
  }

  global.Plans = { init: init, render: render };
})(window);
