/* ===================================================================
 * profile.js —— 个人健康档案
 *
 * 记录基础信息（年龄、性别、确诊年份、GOLD 分期、吸烟、身高体重）。
 * 这些信息会用在「健康梳理 / 就诊小结」里，也能让趋势判断更贴合本人。
 *
 * 性别 / GOLD 分期 / 吸烟情况用一排大按钮（.seg），
 * 符合"不给中老年用户用下拉框"的设计约定。
 * =================================================================== */

(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 文本/数字输入框：字段名 -> 元素 id
  var FIELDS = {
    name: 'profileName',
    age: 'profileAge',
    year: 'profileYear',
    height: 'profileHeight',
    weight: 'profileWeight'
  };

  // 按钮组：字段名 -> 容器 id
  var SEGS = [
    { key: 'sex',   id: 'profileSex' },
    { key: 'gold',  id: 'profileGold' },
    { key: 'smoke', id: 'profileSmoke' }
  ];

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

  function computeBMI(h, w) {
    if (!h || !w) return null;
    var m = Number(h) / 100;
    var bmi = Number(w) / (m * m);
    return Math.round(bmi * 10) / 10;
  }

  /* 把已存档案填回表单 */
  function load() {
    var p = Store.getProfile();
    Object.keys(FIELDS).forEach(function (k) {
      var el = document.getElementById(FIELDS[k]);
      if (el) el.value = p[k] == null ? '' : p[k];
    });
    SEGS.forEach(function (s) { setSeg(s.id, p[s.key]); });
    renderSummary();
  }

  function save() {
    var p = {
      name: document.getElementById('profileName').value.trim(),
      age: document.getElementById('profileAge').value.trim(),
      sex: segValue('profileSex'),
      year: document.getElementById('profileYear').value.trim(),
      gold: segValue('profileGold'),
      smoke: segValue('profileSmoke'),
      height: document.getElementById('profileHeight').value.trim(),
      weight: document.getElementById('profileWeight').value.trim()
    };
    p.bmi = computeBMI(p.height, p.weight);

    var msg = document.getElementById('profileMsg');
    if (!Store.saveProfile(p)) { msg.textContent = ''; return; }
    msg.textContent = '已保存 ✓';
    renderSummary();
  }

  /* 表单上方的一行简要信息 */
  function renderSummary() {
    var p = Store.getProfile();
    var box = document.getElementById('profileSummary');
    if (!box) return;

    var parts = [];
    if (p.name) parts.push(escapeHtml(p.name));
    if (p.age) parts.push(p.age + ' 岁');
    if (p.sex) parts.push(p.sex);
    if (p.gold) parts.push(p.gold === '未知' ? 'GOLD 分期未知' : 'GOLD ' + p.gold + ' 期');
    if (p.bmi) parts.push('BMI ' + p.bmi);

    box.innerHTML = parts.length
      ? '<div class="record"><div class="record-body">' + parts.join(' · ') + '</div></div>'
      : '<p class="empty">还没有档案，填好后这里会显示简要信息。</p>';
  }

  function bindSegs() {
    SEGS.forEach(function (s) {
      var seg = document.getElementById(s.id);
      seg.addEventListener('click', function (e) {
        var btn = e.target.closest('.seg-btn');
        if (!btn) return;
        Array.prototype.forEach.call(seg.children, function (b) {
          b.classList.toggle('active', b === btn);
        });
      });
    });
  }

  function init() {
    bindSegs();
    document.getElementById('profileSave').addEventListener('click', save);
    load();
  }

  global.Profile = { init: init, render: renderSummary };
})(window);
