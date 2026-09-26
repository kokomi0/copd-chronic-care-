/* ===================================================================
 * cat.js —— CAT 评估量表（COPD Assessment Test）
 *
 * 8 道题，每题 0~5 分，总分 0~40 分，用来评估慢阻肺对生活的影响。
 * 建议每月测一次，总分升高说明影响在变大，值得和医生沟通。
 * =================================================================== */

(function (global) {
  'use strict';

  // 每题左右两端是两个相反的描述，左边记 0 分、右边记 5 分
  var QUESTIONS = [
    { left: '我从不咳嗽', right: '我一直咳嗽' },
    { left: '我一点痰也没有', right: '我有很多很多痰' },
    { left: '我一点也没有胸闷的感觉', right: '我有很重的胸闷感觉' },
    { left: '爬坡或上一层楼梯时，我没有气喘', right: '爬坡或上一层楼梯时，我非常喘不过气' },
    { left: '我在家里做任何事都没有困难', right: '我在家里做任何事都很困难' },
    { left: '尽管有肺病，我对离家外出很有信心', right: '由于肺病，我对离家外出一点信心也没有' },
    { left: '我睡眠非常好', right: '由于肺病，我睡眠非常不好' },
    { left: '我精力旺盛', right: '我一点精力都没有' }
  ];

  var answers = [null, null, null, null, null, null, null, null];
  var elScore, elMsg, elHistory, elCanvas;

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

  function interpret(sum) {
    if (sum <= 10) return '影响轻微';
    if (sum <= 20) return '影响中等';
    if (sum <= 30) return '影响严重';
    return '影响非常严重';
  }

  function band(sum) {
    if (sum <= 10) return 'ok';
    if (sum <= 20) return 'mid';
    if (sum <= 30) return 'warn';
    return 'danger';
  }

  function buildQuestions() {
    var box = document.getElementById('catQuestions');
    box.innerHTML = '';

    QUESTIONS.forEach(function (q, qi) {
      var card = document.createElement('div');
      card.className = 'card';

      var title = document.createElement('p');
      title.className = 'cat-q';
      title.innerHTML =
        '<span class="cat-n">' + (qi + 1) + '</span>'
        + escapeHtml(q.left)
        + ' <span class="cat-arrow">→</span> '
        + escapeHtml(q.right);
      card.appendChild(title);

      var row = document.createElement('div');
      row.className = 'cat-scale';

      for (var v = 0; v <= 5; v++) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cat-btn';
        btn.dataset.q = String(qi);
        btn.dataset.v = String(v);
        btn.textContent = String(v);
        btn.addEventListener('click', function () {
          answers[qi] = v;
          highlight(qi);
          updateScore();
          elMsg.textContent = '';
        });
        row.appendChild(btn);
      }
      card.appendChild(row);
      box.appendChild(card);
    });
  }

  function highlight(qi) {
    var btns = document.querySelectorAll('.cat-btn[data-q="' + qi + '"]');
    Array.prototype.forEach.call(btns, function (b) {
      b.classList.toggle('selected', Number(b.dataset.v) === answers[qi]);
    });
  }

  function updateScore() {
    var sum = 0, done = 0;
    answers.forEach(function (a) { if (a !== null) { sum += a; done++; } });
    elScore.className = 'cat-score cat-score-' + band(sum);
    if (done === 8) {
      elScore.textContent = '总分 ' + sum + ' 分 · ' + interpret(sum);
    } else {
      elScore.textContent = '已答 ' + done + '/8，当前 ' + sum + ' 分';
    }
  }

  function save() {
    if (answers.indexOf(null) >= 0) {
      elMsg.style.color = '#c92a2a';
      elMsg.textContent = '请把 8 道题都答完再保存';
      return;
    }
    var total = answers.reduce(function (a, b) { return a + b; }, 0);
    if (!Store.saveCat(todayStr(), { total: total, answers: answers.slice() })) {
      elMsg.textContent = '';
      return;
    }

    answers = [null, null, null, null, null, null, null, null];
    QUESTIONS.forEach(function (q, qi) { highlight(qi); });
    updateScore();

    elMsg.style.color = '#2b8a3e';
    elMsg.textContent = '已保存 ✓（' + total + ' 分 · ' + interpret(total) + '）';
    renderHistory();
  }

  function renderHistory() {
    var all = Store.getCats();
    var dates = Object.keys(all).sort();

    // 总分趋势（0-40 分）
    Chart.drawLine(elCanvas, {
      labels: dates.map(Store.shortDate),
      data: dates.map(function (d) { return all[d].total; }),
      min: 0, max: 40,
      color: '#0b7285',
      unit: '分'
    });

    // 历史列表（新的在上面）
    var html = '';
    for (var i = dates.length - 1; i >= 0; i--) {
      var d = dates[i];
      var c = all[d];
      html += '<div class="record">'
            +   '<div class="record-date">' + Store.shortDate(d) + '</div>'
            +   '<div class="record-body">CAT ' + c.total + ' 分 · ' + interpret(c.total) + '</div>'
            + '</div>';
    }
    elHistory.innerHTML = html || '<p class="empty">还没有测过 CAT，测一次看看肺病对生活的影响。</p>';
  }

  function init() {
    elScore = document.getElementById('catScore');
    elMsg = document.getElementById('catMsg');
    elHistory = document.getElementById('catHistory');
    elCanvas = document.getElementById('chartCat');

    buildQuestions();
    updateScore();
    renderHistory();

    document.getElementById('catSave').addEventListener('click', save);
  }

  global.Cat = { init: init, render: renderHistory };
})(window);
