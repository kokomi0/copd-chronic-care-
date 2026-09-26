/* ===================================================================
 * meds.js —— 用药提醒
 *
 * 结构：一条"提醒" = 一种药 + 一个服药时间。
 * 早晚都要吃的药，就添加两条。
 *
 * 【重要局限】这是网页版，只有网页开着的时候才会弹提醒。
 * 浏览器关了、手机锁屏久了，提醒不会响——界面上已如实说明。
 * 以后做成 App 才能实现真正的后台定时提醒。
 * =================================================================== */

(function (global) {
  'use strict';

  var elName, elDose, elTime, elToday, elList, elNotify, elSuggest;
  var suggestTimer = null;

  /* 用"药名 + 时间"生成唯一 id，同一时间同一药只会有一次 */
  function medId(name, time) {
    return name + '|' + time;
  }

  function addMed() {
    var name = elName.value.trim();
    var dose = elDose.value.trim();
    var time = elTime.value;

    if (!name) {
      alert('请先填药名');
      return;
    }
    if (!time) {
      alert('请选一个服药时间');
      return;
    }

    Store.addMed({ id: medId(name, time), name: name, dose: dose, time: time });
    elName.value = '';
    elDose.value = '';

    render();
    updateNotifyButton();
  }

  function render() {
    var meds = Store.getMeds();
    var today = Store.today();

    // ---- 今日待服清单（按时间排序，已吃的划掉）----
    var todayHtml = '';
    if (meds.length === 0) {
      todayHtml = '<p class="empty">还没有用药提醒，在下面添加。</p>';
    } else {
      meds.forEach(function (m) {
        var taken = Store.isMedTaken(today, m.id);
        todayHtml +=
          '<div class="med-item">'
          + '<button class="med-check' + (taken ? ' taken' : '') + '" data-id="' + m.id + '">✓</button>'
          + '<div class="med-info">'
          +   '<div class="med-name' + (taken ? ' done' : '') + '">' + escapeHtml(m.name) + '</div>'
          +   '<div class="med-meta">' + (m.dose ? escapeHtml(m.dose) + ' · ' : '') + m.time + '</div>'
          + '</div>'
          + '</div>';
      });
    }
    elToday.innerHTML = todayHtml;

    // ---- 全部提醒（带删除）----
    var allHtml = '';
    if (meds.length === 0) {
      allHtml = '<p class="empty">还没有提醒。</p>';
    } else {
      meds.forEach(function (m) {
        allHtml +=
          '<div class="med-item">'
          + '<div class="med-info">'
          +   '<div class="med-name">' + escapeHtml(m.name) + '</div>'
          +   '<div class="med-meta">' + (m.dose ? escapeHtml(m.dose) + ' · ' : '') + '每天 ' + m.time + '</div>'
          + '</div>'
          + '<button class="med-del" data-id="' + m.id + '">删除</button>'
          + '</div>';
      });
    }
    elList.innerHTML = allHtml;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* 输入药名时，从知识库联想补全（后端没启动则静默跳过） */
  function onNameInput() {
    var q = elName.value.trim();
    if (q.length < 1) { hideSuggest(); return; }
    clearTimeout(suggestTimer);
    suggestTimer = setTimeout(function () {
      Api.get('/api/search?q=' + encodeURIComponent(q) + '&label=Medication&limit=8')
        .then(function (data) { renderSuggest(data.results || []); })
        .catch(function () { hideSuggest(); });
    }, 300);
  }

  function renderSuggest(results) {
    if (!results || !results.length) { hideSuggest(); return; }
    elSuggest.innerHTML = results.map(function (r) {
      return '<button type="button" class="med-suggest-btn" data-name="' + escapeHtml(r.title) + '">'
           + escapeHtml(r.title) + '</button>';
    }).join('');
    elSuggest.classList.remove('hidden');
  }

  function hideSuggest() {
    elSuggest.classList.add('hidden');
  }

  function onSuggestClick(e) {
    var btn = e.target.closest('.med-suggest-btn');
    if (!btn) return;
    elName.value = btn.dataset.name;
    hideSuggest();
    elDose.focus();
  }

  /* 勾选 / 取消勾选今天的某条药 */
  function onTodayClick(e) {
    var check = e.target.closest('.med-check');
    if (!check) return;
    var id = check.dataset.id;
    var taken = Store.toggleMedTaken(Store.today(), id);
    check.classList.toggle('taken', taken);
    check.parentNode.querySelector('.med-name').classList.toggle('done', taken);
  }

  function onListClick(e) {
    var del = e.target.closest('.med-del');
    if (!del) return;
    if (confirm('删除这条提醒？')) {
      Store.removeMed(del.dataset.id);
      render();
    }
  }

  /* 询问浏览器是否允许弹通知 */
  function updateNotifyButton() {
    if (!('Notification' in window)) {
      elNotify.disabled = true;
      elNotify.textContent = '这个浏览器不支持弹窗提醒';
      return;
    }
    if (Notification.permission === 'granted') {
      elNotify.textContent = '弹窗提醒已开启 ✓';
      elNotify.disabled = true;
    } else if (Notification.permission === 'denied') {
      elNotify.textContent = '弹窗提醒被浏览器拒绝了';
      elNotify.disabled = true;
    } else {
      elNotify.textContent = '开启浏览器弹窗提醒';
      elNotify.disabled = false;
    }
  }

  function requestNotify() {
    Notification.requestPermission().then(function (p) {
      updateNotifyButton();
      if (p === 'granted') notify('已开启', '到吃药时间会在这里弹提醒（网页开着的时候）');
    });
  }

  function notify(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification('用药提醒 · ' + title, { body: body });
    } catch (e) {
      // 部分手机浏览器不支持带参数的写法，退回最简单的
      try { new Notification('用药提醒 · ' + title); } catch (e2) {}
    }
  }

  /* 每隔 30 秒对一下时间：到点了、还没吃，就弹提醒 */
  function checkDue() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    var now = new Date();
    var hh = String(now.getHours()).padStart(2, '0');
    var mm = String(now.getMinutes()).padStart(2, '0');
    var cur = hh + ':' + mm;
    var today = Store.today();

    Store.getMeds().forEach(function (m) {
      if (m.time === cur && !Store.isMedTaken(today, m.id)) {
        notify(m.name, (m.dose ? m.dose + ' ' : '') + '该吃药了');
      }
    });
  }

  function init() {
    elName = document.getElementById('medName');
    elDose = document.getElementById('medDose');
    elTime = document.getElementById('medTime');
    elToday = document.getElementById('medTodayList');
    elList = document.getElementById('medList');
    elNotify = document.getElementById('medNotify');
    elSuggest = document.getElementById('medSuggest');

    document.getElementById('medAdd').addEventListener('click', addMed);
    elToday.addEventListener('click', onTodayClick);
    elList.addEventListener('click', onListClick);
    elNotify.addEventListener('click', requestNotify);
    elName.addEventListener('input', onNameInput);
    elSuggest.addEventListener('click', onSuggestClick);

    updateNotifyButton();
    render();

    // 前台每 30 秒对一次表，看有没有到吃药时间
    setInterval(checkDue, 30000);
  }

  global.Meds = { init: init, render: render };
})(window);
