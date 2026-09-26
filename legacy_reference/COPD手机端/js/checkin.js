/* ===================================================================
 * checkin.js —— 每日症状打卡
 *
 * 气促的 5 个等级用的是国际通用的 mMRC 呼吸困难量表描述，
 * 医生看得懂，患者也能对号入座。
 * =================================================================== */

(function (global) {
  'use strict';

  var SYMPTOMS = [
    {
      key: 'cough',
      title: '咳嗽',
      levels: [
        '基本不咳',
        '偶尔咳几声',
        '每天都咳，但不太影响生活',
        '咳得比较厉害，影响做事',
        '一直咳，晚上会被咳醒'
      ]
    },
    {
      key: 'sputum',
      title: '咳痰',
      levels: [
        '没有痰',
        '少量，容易咳出来',
        '中等量',
        '痰比较多，不容易咳出来',
        '痰很多，觉得堵得慌'
      ]
    },
    {
      key: 'dyspnea',
      title: '气促（喘不上气）',
      levels: [
        '只有剧烈活动才会喘',
        '快走或上坡的时候会喘',
        '走平路比同龄人慢，或者要停下歇口气',
        '平路走约 100 米就得停下来喘',
        '穿衣、洗漱这些小事就喘，出不了门'
      ]
    }
  ];

  // 当前选中的等级，null 表示还没选
  var current = { cough: null, sputum: null, dyspnea: null };

  var elGroups, elSpo2, elHr, elWeight, elNote, elMsg, elDate, elBadge;

  /* 生成三组症状按钮 */
  function buildGroups() {
    elGroups.innerHTML = '';

    SYMPTOMS.forEach(function (sym) {
      var card = document.createElement('div');
      card.className = 'card';

      var h = document.createElement('h2');
      h.className = 'symptom-title';
      h.textContent = sym.title;
      card.appendChild(h);

      var list = document.createElement('div');
      list.className = 'level-list';

      sym.levels.forEach(function (text, lv) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'level-btn';
        btn.dataset.key = sym.key;
        btn.dataset.level = String(lv);

        var num = document.createElement('span');
        num.className = 'lv';
        num.textContent = String(lv);

        var label = document.createElement('span');
        label.textContent = text;

        btn.appendChild(num);
        btn.appendChild(label);

        btn.addEventListener('click', function () {
          current[sym.key] = lv;
          highlight(sym.key);
          elMsg.textContent = '';
        });

        list.appendChild(btn);
      });

      card.appendChild(list);
      elGroups.appendChild(card);
    });
  }

  /* 把某一组里选中的那个按钮高亮 */
  function highlight(key) {
    var btns = elGroups.querySelectorAll('.level-btn[data-key="' + key + '"]');
    Array.prototype.forEach.call(btns, function (b) {
      var on = current[key] !== null && Number(b.dataset.level) === current[key];
      b.classList.toggle('selected', on);
    });
  }

  /* 打开页面时，把今天已经存过的记录填回表单 */
  function load() {
    var today = Store.today();
    var d = new Date();
    var week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
    elDate.textContent = (d.getMonth() + 1) + '月' + d.getDate() + '日 星期' + week;

    var saved = Store.getCheckin(today);
    if (saved) {
      current.cough = saved.cough;
      current.sputum = saved.sputum;
      current.dyspnea = saved.dyspnea;
      elSpo2.value = (saved.spo2 === null || saved.spo2 === undefined) ? '' : saved.spo2;
      elHr.value = (saved.hr === null || saved.hr === undefined) ? '' : saved.hr;
      elWeight.value = (saved.weight === null || saved.weight === undefined) ? '' : saved.weight;
      elNote.value = saved.note || '';
      elBadge.classList.remove('hidden');
    } else {
      current = { cough: null, sputum: null, dyspnea: null };
      elSpo2.value = '';
      elHr.value = '';
      elWeight.value = '';
      elNote.value = '';
      elBadge.classList.add('hidden');
    }

    Object.keys(current).forEach(highlight);
    elMsg.textContent = '';
  }

  function save() {
    // 三项都必须选，否则趋势图会缺数据
    var missing = SYMPTOMS.filter(function (s) { return current[s.key] === null; });
    if (missing.length > 0) {
      elMsg.style.color = '#c92a2a';
      elMsg.textContent = '请先选择「' + missing[0].title + '」的程度';
      return;
    }

    // 血氧可以不填；填了就必须是合理数值
    var spo2 = null;
    var raw = elSpo2.value.trim();
    if (raw !== '') {
      spo2 = Number(raw);
      if (isNaN(spo2) || spo2 < 50 || spo2 > 100) {
        elMsg.style.color = '#c92a2a';
        elMsg.textContent = '血氧请填 50 到 100 之间的数字，没有血氧仪就留空';
        return;
      }
    }

    // 心率、体重同样可选填，填了要合理
    var hr = null;
    var hrRaw = elHr.value.trim();
    if (hrRaw !== '') {
      hr = Number(hrRaw);
      if (isNaN(hr) || hr < 40 || hr > 200) {
        elMsg.style.color = '#c92a2a';
        elMsg.textContent = '心率请填 40 到 200 之间的数字，不知道就留空';
        return;
      }
    }

    var weight = null;
    var wRaw = elWeight.value.trim();
    if (wRaw !== '') {
      weight = Number(wRaw);
      if (isNaN(weight) || weight < 30 || weight > 200) {
        elMsg.style.color = '#c92a2a';
        elMsg.textContent = '体重请填 30 到 200 之间的数字，没有秤就留空';
        return;
      }
    }

    var ok = Store.saveCheckin(Store.today(), {
      cough: current.cough,
      sputum: current.sputum,
      dyspnea: current.dyspnea,
      spo2: spo2,
      hr: hr,
      weight: weight,
      note: elNote.value.trim()
    });

    if (!ok) return;

    elBadge.classList.remove('hidden');
    elMsg.style.color = '#2b8a3e';
    elMsg.textContent = '已保存 ✓  可以去「趋势」页看变化';

    // 通知趋势页刷新
    document.dispatchEvent(new CustomEvent('copd:datachanged'));
  }

  function init() {
    elGroups = document.getElementById('symptomGroups');
    elSpo2 = document.getElementById('checkinSpo2');
    elHr = document.getElementById('checkinHr');
    elWeight = document.getElementById('checkinWeight');
    elNote = document.getElementById('checkinNote');
    elMsg = document.getElementById('checkinMsg');
    elDate = document.getElementById('checkinDate');
    elBadge = document.getElementById('checkinBadge');

    buildGroups();
    load();

    document.getElementById('checkinSave').addEventListener('click', save);
  }

  global.Checkin = { init: init, load: load, SYMPTOMS: SYMPTOMS };
})(window);
