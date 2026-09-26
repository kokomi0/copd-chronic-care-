/* ===================================================================
 * chart.js —— 折线图
 *
 * 用浏览器自带的 Canvas 手写，不引入任何第三方图表库。
 * 好处：不用 npm、不下载依赖包、不占硬盘，双击网页就能跑。
 * =================================================================== */

(function (global) {
  'use strict';

  /**
   * 在 canvas 上画一条折线图
   * @param {HTMLCanvasElement} canvas 画布元素
   * @param {Object} opt
   *   opt.labels {string[]} 横轴标签，例如 ["8月1日", "8月2日"]
   *   opt.data   {Array<number|null>} 纵轴数值，没记录的那天传 null（断开不连线）
   *   opt.min    {number} 纵轴最小值
   *   opt.max    {number} 纵轴最大值
   *   opt.color  {string} 线条颜色
   *   opt.unit   {string} 数值单位，画在刻度后面
   */
  function drawLine(canvas, opt) {
    if (!canvas) return;

    // ---- 高清屏适配：不做这步，图在手机上会糊 ----
    var dpr = global.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (w === 0 || h === 0) return; // 页面还没显示出来，跳过

    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    var padL = 42, padR = 14, padT = 14, padB = 28;
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;

    var data = opt.data || [];
    var hasAny = data.some(function (v) { return v !== null && v !== undefined; });

    // ---- 没有任何数据时，给一句提示，不要留一片空白让人以为坏了 ----
    if (!hasAny) {
      ctx.fillStyle = '#9aa5ad';
      ctx.font = '15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('还没有记录，先去"打卡"页记一次', w / 2, h / 2);
      return;
    }

    var min = opt.min;
    var max = opt.max;
    var span = max - min || 1;

    // 数值 -> 画布坐标
    function xAt(i) {
      if (data.length === 1) return padL + plotW / 2;
      return padL + (plotW * i) / (data.length - 1);
    }
    function yAt(v) {
      return padT + plotH * (1 - (v - min) / span);
    }

    // ---- 横向网格线 + 纵轴刻度 ----
    var STEPS = 4;
    ctx.strokeStyle = '#e6ecef';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8a959c';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (var s = 0; s <= STEPS; s++) {
      var val = min + (span * s) / STEPS;
      var y = yAt(val);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w - padR, y);
      ctx.stroke();
      ctx.fillText(Math.round(val) + (opt.unit || ''), padL - 6, y);
    }

    // ---- 折线（遇到 null 断开，表示那天没记录）----
    ctx.strokeStyle = opt.color;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    var drawing = false;
    ctx.beginPath();
    for (var i = 0; i < data.length; i++) {
      var v = data[i];
      if (v === null || v === undefined) {
        drawing = false;         // 断开，下一个点重新起笔
        continue;
      }
      if (!drawing) {
        ctx.moveTo(xAt(i), yAt(v));
        drawing = true;
      } else {
        ctx.lineTo(xAt(i), yAt(v));
      }
    }
    ctx.stroke();

    // ---- 数据点 ----
    ctx.fillStyle = opt.color;
    for (var j = 0; j < data.length; j++) {
      var dv = data[j];
      if (dv === null || dv === undefined) continue;
      ctx.beginPath();
      ctx.arc(xAt(j), yAt(dv), 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ---- 横轴标签：只画首/中/尾三个，天数多了会挤成一团 ----
    var labels = opt.labels || [];
    ctx.fillStyle = '#8a959c';
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'top';

    var marks = labels.length <= 1
      ? [0]
      : [0, Math.floor((labels.length - 1) / 2), labels.length - 1];

    marks.forEach(function (idx, n) {
      if (!labels[idx]) return;
      ctx.textAlign = n === 0 ? 'left' : (n === marks.length - 1 ? 'right' : 'center');
      ctx.fillText(labels[idx], xAt(idx), h - padB + 8);
    });
  }

  global.Chart = { drawLine: drawLine };
})(window);
