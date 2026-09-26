/* ===================================================================
 * doctors.js —— 推荐医生页
 *
 * 就医指引（doctors-data.js 里的 GUIDE）保持本地静态；
 * 医生名单改为从后端 /api/doctors 拉取（Neo4j 图谱里的真实数据），
 * 后端没启动时自动回退到 doctors-data.js 里的示例占位数据。
 * =================================================================== */

(function (global) {
  'use strict';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderGuide() {
    var guideBox = document.getElementById('doctorGuide');
    var guideHtml = DoctorsData.GUIDE.map(function (g) {
      return '<div class="guide-item' + (g.urgent ? ' urgent' : '') + '">'
           + '<span class="dot">' + (g.urgent ? '🚨' : '•') + '</span>'
           + '<span>' + escapeHtml(g.text) + '</span>'
           + '</div>';
    }).join('');
    guideBox.innerHTML = guideHtml;
  }

  function doctorCard(d, isSample) {
    var sampleTag = isSample ? '<span class="sample-tag">示例数据</span>' : '';
    return '<div class="doctor-card">'
         +   '<div class="doctor-name">' + escapeHtml(d.name) + sampleTag + '</div>'
         +   '<div class="doctor-meta">' + escapeHtml(d.hospital) + '</div>'
         +   '<div class="doctor-meta">' + escapeHtml(d.department || d.dept) + ' · ' + escapeHtml(d.title) + '</div>'
         +   (d.specialty ? '<div class="doctor-meta">擅长：' + escapeHtml(d.specialty) + '</div>' : '')
         +   (d.consultationHours ? '<div class="doctor-meta">门诊：' + escapeHtml(d.consultationHours) + '</div>' : '')
         +   (d.note ? '<div class="doctor-meta">' + escapeHtml(d.note) + '</div>' : '')
         + '</div>';
  }

  function renderDoctorList(list, isSample) {
    var listBox = document.getElementById('doctorList');
    if (!list || !list.length) {
      listBox.innerHTML = '<p class="empty">医生名单暂未录入。</p>';
      return;
    }
    var html = list.map(function (d) { return doctorCard(d, isSample); }).join('');
    if (isSample) {
      html += '<p class="warn-note">当前为<strong>示例占位数据</strong>（后端未连接）。启动后端后会自动换成知识图谱里的真实医生。</p>';
    }
    listBox.innerHTML = html;
  }

  function loadDoctors() {
    var listBox = document.getElementById('doctorList');
    listBox.innerHTML = '<p class="empty">正在加载医生信息…</p>';

    Api.get('/api/doctors').then(function (data) {
      var doctors = (data.doctors || []).map(function (x) { return x.doctor; });
      renderDoctorList(doctors, false);
    }).catch(function () {
      renderDoctorList(DoctorsData.DOCTORS, true);
    });
  }

  function render() {
    renderGuide();
    loadDoctors();
  }

  global.Doctors = { render: render };
})(window);
