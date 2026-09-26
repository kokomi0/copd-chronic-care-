/* ===================================================================
 * backup.js —— 数据备份
 *
 * 记录都存在浏览器本地，换手机 / 清理浏览器前先导出备份文件。
 * 导出是 JSON 文件，导入时会覆盖当前所有记录（有确认提示）。
 * =================================================================== */

(function (global) {
  'use strict';

  function todayStr() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function download(text, filename) {
    var blob = new Blob([text], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function exportData() {
    var text = JSON.stringify(Store.exportAll(), null, 2);
    download(text, '慢阻肺备份-' + todayStr() + '.json');
  }

  function refreshAll() {
    Checkin.load();
    Trend.render();
    Meds.render();
    Doctors.render();
    Profile.render();
    Shuli.render();
    Breath.render();
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (confirm('恢复备份会覆盖当前所有记录，确定继续吗？')) {
          Store.importAll(data);
          alert('恢复完成。');
          refreshAll();
        }
      } catch (e) {
        alert('这个文件不是有效的备份文件，无法恢复。');
      }
    };
    reader.readAsText(file);
  }

  function init() {
    document.getElementById('dataExport').addEventListener('click', exportData);
    document.getElementById('dataImport').addEventListener('click', function () {
      document.getElementById('dataImportFile').click();
    });
    document.getElementById('dataImportFile').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) importData(e.target.files[0]);
      e.target.value = '';
    });
  }

  global.Backup = { init: init };
})(window);
