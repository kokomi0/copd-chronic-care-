/* ===================================================================
 * store.js —— 数据层
 *
 * 全部数据都存在这台手机/电脑的浏览器本地（localStorage），
 * 不上传服务器，断网也能用。
 *
 * 【重要】所有读写数据的操作都必须经过这个文件。
 * 以后如果要改成"云端账号同步"，只需要改这一个文件，
 * 其他页面的代码一行都不用动。
 * =================================================================== */

(function (global) {
  'use strict';

  // localStorage 里用到的键名，统一放这里，避免各处写错字符串
  var KEYS = {
    profile: 'copd.profile',    // 个人健康档案（基础信息）
    checkins: 'copd.checkins',  // 每日症状打卡
    meds: 'copd.meds',          // 用药提醒的设置
    medLogs: 'copd.medLogs',    // 每天实际服药的打勾记录
    training: 'copd.training',  // 每天的呼吸训练时长
    exacerbations: 'copd.exacerbations',  // 急性加重日记
    cats: 'copd.cats',                    // CAT 评估结果
    plans: 'copd.plans'                   // 疫苗 / 复诊等周期性计划
  };

  /* 读取并解析 JSON。失败时返回兜底值，保证页面不会白屏 */
  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('读取数据失败：' + key, e);
      return fallback;
    }
  }

  /* 写入。浏览器隐私模式或存储写满时会抛错，这里给用户明确提示 */
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('保存数据失败：' + key, e);
      alert('保存失败。可能是浏览器处于"无痕/隐私模式"，或本地存储已满。');
      return false;
    }
  }

  /* 把日期转成 "2026-08-23" 这种字符串，作为每天数据的键 */
  function dateKey(d) {
    var t = d || new Date();
    var m = String(t.getMonth() + 1);
    var day = String(t.getDate());
    if (m.length < 2) m = '0' + m;
    if (day.length < 2) day = '0' + day;
    return t.getFullYear() + '-' + m + '-' + day;
  }

  /* 返回最近 n 天的日期字符串数组，从最早排到今天 */
  function recentDays(n) {
    var out = [];
    var now = new Date();
    for (var i = n - 1; i >= 0; i--) {
      out.push(dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)));
    }
    return out;
  }

  /* 把 "2026-08-23" 显示成 "8月23日" */
  function shortDate(key) {
    var p = key.split('-');
    return parseInt(p[1], 10) + '月' + parseInt(p[2], 10) + '日';
  }

  global.Store = {
    dateKey: dateKey,
    today: function () { return dateKey(); },
    recentDays: recentDays,
    shortDate: shortDate,

    // ---------- 个人健康档案 ----------
    getProfile: function () { return read(KEYS.profile, {}); },

    saveProfile: function (p) {
      return write(KEYS.profile, p);
    },

    // ---------- 每日打卡 ----------
    getCheckins: function () { return read(KEYS.checkins, {}); },

    getCheckin: function (date) { return this.getCheckins()[date] || null; },

    saveCheckin: function (date, data) {
      var all = this.getCheckins();
      all[date] = data;
      return write(KEYS.checkins, all);
    },

    // ---------- 用药提醒 ----------
    getMeds: function () { return read(KEYS.meds, []); },

    addMed: function (med) {
      var list = this.getMeds();
      list.push(med);
      // 按服药时间从早到晚排序，今日清单看起来才顺
      list.sort(function (a, b) { return a.time < b.time ? -1 : 1; });
      return write(KEYS.meds, list);
    },

    removeMed: function (id) {
      var list = this.getMeds().filter(function (m) { return m.id !== id; });
      return write(KEYS.meds, list);
    },

    // ---------- 服药打勾 ----------
    getMedLogs: function () { return read(KEYS.medLogs, {}); },

    isMedTaken: function (date, id) {
      var day = this.getMedLogs()[date] || [];
      return day.indexOf(id) >= 0;
    },

    toggleMedTaken: function (date, id) {
      var logs = this.getMedLogs();
      var day = logs[date] || [];
      var i = day.indexOf(id);
      if (i >= 0) { day.splice(i, 1); } else { day.push(id); }
      logs[date] = day;
      write(KEYS.medLogs, logs);
      return day.indexOf(id) >= 0;
    },

    // ---------- 呼吸训练 ----------
    getTraining: function () { return read(KEYS.training, {}); },

    getTrainingOf: function (date) {
      return this.getTraining()[date] || { seconds: 0, sets: 0 };
    },

    addTraining: function (date, seconds, sets) {
      var all = this.getTraining();
      var cur = all[date] || { seconds: 0, sets: 0 };
      cur.seconds += seconds;
      cur.sets += sets;
      all[date] = cur;
      write(KEYS.training, all);
      return cur;
    },

    // ---------- 急性加重日记 ----------
    getExacerbations: function () { return read(KEYS.exacerbations, []); },

    addExacerbation: function (e) {
      var list = this.getExacerbations();
      list.push(e);
      // 按日期从早到晚排，时间线看起来才顺
      list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      return write(KEYS.exacerbations, list);
    },

    removeExacerbation: function (id) {
      var list = this.getExacerbations().filter(function (x) { return x.id !== id; });
      return write(KEYS.exacerbations, list);
    },

    // ---------- CAT 评估 ----------
    getCats: function () { return read(KEYS.cats, {}); },

    getCat: function (date) { return this.getCats()[date] || null; },

    saveCat: function (date, data) {
      var all = this.getCats();
      all[date] = data;
      return write(KEYS.cats, all);
    },

    // ---------- 疫苗 / 复诊计划 ----------
    getPlans: function () { return read(KEYS.plans, {}); },

    savePlan: function (key, lastDate) {
      var all = this.getPlans();
      all[key] = lastDate;
      return write(KEYS.plans, all);
    },

    // ---------- 备份 / 恢复（"我的"页面里导出、导入用）----------
    // 直接按原始字符串取/存，保证导出再导入后数据原样不变
    exportAll: function () {
      var out = {};
      Object.keys(KEYS).forEach(function (k) {
        out[k] = localStorage.getItem(KEYS[k]);
      });
      return out;
    },

    importAll: function (data) {
      Object.keys(KEYS).forEach(function (k) {
        if (data && data[k] !== undefined && data[k] !== null) {
          localStorage.setItem(KEYS[k], data[k]);
        }
      });
    },

    // ---------- 清空（"我的"页面里给用户的重置入口）----------
    clearAll: function () {
      Object.keys(KEYS).forEach(function (k) {
        localStorage.removeItem(KEYS[k]);
      });
    }
  };
})(window);
