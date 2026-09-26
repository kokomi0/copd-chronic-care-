/* ===================================================================
 * app.js —— 页面入口
 *
 * 负责：底部标签切换、清空数据、把各个模块串起来。
 * =================================================================== */

(function (global) {
  'use strict';

  var PAGES = ['home', 'checkin', 'training', 'trend', 'doctors', 'knowledge', 'ask', 'shuli', 'mine'];

  /* 切换到底部某个标签页 */
  function showPage(name) {
    PAGES.forEach(function (p) {
      document.getElementById('page-' + p).classList.toggle('active', p === name);
    });

    var tabs = document.querySelectorAll('.tab');
    Array.prototype.forEach.call(tabs, function (t) {
      var on = t.dataset.page === name;
      t.classList.toggle('active', on);
    });

    // 通知各模块"现在显示的是哪个页"，方便它们按需刷新
    document.dispatchEvent(new CustomEvent('copd:pagechange', { detail: name }));

    // 图表在页面隐藏时宽高为 0，所以每次切到趋势页都要重画
    if (name === 'trend') Trend.render();
    if (name === 'doctors') Doctors.render();
    if (name === 'mine') { Meds.render(); Profile.render(); }
    if (name === 'checkin') Checkin.load();
    if (name === 'training') Breath.render();
    if (name === 'shuli') Shuli.render();
    if (name === 'ask') AskDoctor.render();

    global.scrollTo(0, 0);
  }

  function initTabs() {
    document.querySelector('.tab-bar').addEventListener('click', function (e) {
      var btn = e.target.closest('.tab');
      if (btn) showPage(btn.dataset.page);
    });
  }

  /* 顶部问候 + 日期（首页导航卡片会用到） */
  function initHero() {
    var h = new Date().getHours();
    var word = (h < 6) ? '夜深了，注意休息'
             : (h < 9) ? '早上好'
             : (h < 12) ? '上午好'
             : (h < 14) ? '中午好'
             : (h < 18) ? '下午好'
             : '晚上好';

    var d = new Date();
    var week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    var dateText = (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + week;

    var greet = document.getElementById('heroGreeting');
    var dateEl = document.getElementById('heroDate');
    if (greet) greet.textContent = word;
    if (dateEl) dateEl.textContent = dateText;
  }

  /* 首页的功能导航卡片：点击跳到对应页面 */
  function initNavCards() {
    var grid = document.querySelector('.nav-grid');
    if (!grid) return;
    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.nav-card');
      if (card && card.dataset.go) showPage(card.dataset.go);
    });
  }

  function initClear() {
    document.getElementById('clearData').addEventListener('click', function () {
      if (confirm('确定要清空全部记录吗？此操作无法撤销。')) {
        Store.clearAll();
        alert('已清空。');
        showPage('checkin');
        Checkin.load();
        Trend.render();
        Meds.render();
        Doctors.render();
      }
    });
  }

  function initSplash() {
    var splash = document.getElementById('splash');
    if (!splash) return;
    // 约 1.6 秒后淡出并移除启动页
    setTimeout(function () {
      splash.classList.add('hide');
      setTimeout(function () {
        if (splash.parentNode) splash.parentNode.removeChild(splash);
      }, 550); // 等淡出动画播完再删
    }, 1600);
  }

  global.App = {
    boot: function () {
      Checkin.init();
      Trend.init();
      Meds.init();
      Doctors.render();
      Knowledge.init();
      Shuli.init();
      AskDoctor.init();
      Breath.init();
      Profile.init();
      Backup.init();
      initTabs();
      initHero();
      initNavCards();
      initClear();
      showPage('home');
      initSplash();
    }
  };
})(window);

document.addEventListener('DOMContentLoaded', function () {
  App.boot();
});
