/* ===================================================================
 * breath.js —— 呼吸训练
 *
 * 缩唇呼吸、腹式呼吸两种方式，带引导动画和计时。
 * 训练结果存到 Store（training），在「健康梳理」里汇总。
 *
 * 动画用的是 style.css 里已经写好的 .breath-circle：
 *   吸气时圆变大、呼气时圆缩小、屏气时变橙色。
 * =================================================================== */

(function (global) {
  'use strict';

  var MODES = {
    pursed: {
      label: '缩唇呼吸',
      // 每个阶段：key 阶段名 / text 圆上大字 / word 引导语 / sec 秒数
      phases: [
        { key: 'inhale', text: '吸', word: '用鼻子慢慢吸气', sec: 2 },
        { key: 'exhale', text: '呼', word: '像吹口哨一样，缩起嘴唇慢慢呼气', sec: 4 }
      ],
      note: '要点：吸气用鼻子；呼气时嘴唇缩成吹口哨的样子，呼得比吸得慢。'
    },
    diaphragm: {
      label: '腹式呼吸',
      phases: [
        { key: 'inhale', text: '吸', word: '鼻子吸气，肚子鼓起来', sec: 2 },
        { key: 'hold',   text: '屏', word: '轻轻屏住呼吸', sec: 1 },
        { key: 'exhale', text: '呼', word: '慢慢呼气，肚子收回去', sec: 4 }
      ],
      note: '要点：吸气时肚子鼓起，呼气时肚子收回，胸部尽量别动。'
    }
  };

  var mode = 'pursed';
  var running = false;
  var timer = null;
  var phaseIndex = 0;     // 当前是第几个阶段
  var phaseDeadline = 0;  // 当前阶段结束的时间戳
  var cycles = 0;         // 已完成完整呼吸次数
  var startAt = 0;        // 本次训练开始时间戳

  var elPhase, elWord, elCircle, elSets, elStart, elStop, elToday;

  function phases() { return MODES[mode].phases; }

  /* 进入某个阶段：更新文案 + 让圆随呼吸缩放 */
  function enterPhase(i) {
    var list = phases();
    var p = list[i % list.length];
    phaseIndex = i;
    phaseDeadline = Date.now() + p.sec * 1000;

    elPhase.textContent = p.text;
    elWord.textContent = p.word;

    var c = elCircle;
    c.textContent = p.text;
    c.classList.toggle('hold', p.key === 'hold');

    // 吸气/屏气时圆是满的，呼气时缩回小圆
    var target = (p.key === 'exhale') ? 0.55 : 1;
    c.style.transition = 'transform ' + p.sec + 's ease, background .3s ease';
    setTimeout(function () { c.style.transform = 'scale(' + target + ')'; }, 30);

    // 呼完一次，算完成一次呼吸
    if (p.key === 'exhale') cycles += 1;

    updateSets();
  }

  /* 每 200ms 对一次表：圆中间显示剩余秒数，阶段到了就切下一个 */
  function tick() {
    if (!running) return;
    var left = Math.max(0, Math.ceil((phaseDeadline - Date.now()) / 1000));
    elCircle.textContent = left;
    if (Date.now() >= phaseDeadline) {
      var p = phases()[phaseIndex % phases().length];
      elCircle.textContent = p.text;
      enterPhase(phaseIndex + 1);
    }
  }

  function updateSets() {
    elSets.textContent = running ? '已完成 ' + cycles + ' 次呼吸' : '';
  }

  /* 今日累计训练 */
  function renderToday() {
    var t = Store.getTrainingOf(Store.today());
    if (t.seconds <= 0 && t.sets <= 0) {
      elToday.innerHTML = '<p class="empty">今天还没有训练，点上面的「开始训练」练一次吧。</p>';
      return;
    }
    var min = Math.floor(t.seconds / 60);
    var sec = t.seconds % 60;
    elToday.innerHTML =
      '<div class="record">'
      + '<div class="record-date">今日累计</div>'
      + '<div class="record-body">' + min + ' 分 ' + sec + ' 秒 · ' + t.sets + ' 次呼吸</div>'
      + '</div>';
  }

  function start() {
    if (running) return;
    running = true;
    cycles = 0;
    startAt = Date.now();
    elStart.classList.add('hidden');
    elStop.classList.remove('hidden');
    enterPhase(0);
    timer = setInterval(tick, 200);
  }

  /* save 为 true 时才记录结果（用户主动停止/结束）；切模式时 save 传 false */
  function stop(save) {
    if (!running) return;
    running = false;
    clearInterval(timer);
    timer = null;

    var c = elCircle;
    c.style.transition = 'transform .3s ease';
    c.style.transform = 'scale(.55)';
    c.classList.remove('hold');
    c.textContent = '吸';
    elPhase.textContent = '已结束';
    elWord.textContent = '';

    elStart.classList.remove('hidden');
    elStop.classList.add('hidden');
    elSets.textContent = '';

    // 至少完成几次呼吸才记一笔，避免误触
    if (save && cycles > 0) {
      var secs = Math.round((Date.now() - startAt) / 1000);
      Store.addTraining(Store.today(), secs, cycles);
    }
    renderToday();
  }

  function setMode(m) {
    if (running) stop(false);
    mode = m;
    elPhase.textContent = '准备';
    elWord.textContent = MODES[m].note;
    updateSets();
    renderGuide();
  }

  function renderGuide() {
    var box = document.getElementById('breathGuide');
    if (!box) return;
    box.innerHTML =
      '<div class="guide-item"><span class="dot">•</span><span>' + MODES[mode].note + '</span></div>';
  }

  function init() {
    elPhase = document.getElementById('breathPhase');
    elWord = document.getElementById('breathWord');
    elCircle = document.getElementById('breathCircle');
    elSets = document.getElementById('breathSets');
    elStart = document.getElementById('breathStart');
    elStop = document.getElementById('breathStop');
    elToday = document.getElementById('breathToday');

    var seg = document.getElementById('breathMode');
    seg.addEventListener('click', function (e) {
      var btn = e.target.closest('.seg-btn');
      if (!btn) return;
      Array.prototype.forEach.call(seg.children, function (b) {
        b.classList.toggle('active', b === btn);
      });
      setMode(btn.dataset.mode);
    });

    elStart.addEventListener('click', start);
    elStop.addEventListener('click', function () { stop(true); });

    elWord.textContent = MODES[mode].note;
    renderGuide();
    renderToday();
  }

  global.Breath = { init: init, render: renderToday };
})(window);
