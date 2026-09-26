/* ===================================================================
 * api.js —— 后端接口客户端
 *
 * 前端页面跑在 8000（预览脚本），后端跑在 5000。
 * 手机通过电脑 IP 访问时，用同一个 IP 自动拼出后端地址。
 * =================================================================== */

(function (global) {
  'use strict';

  var API_BASE = (function () {
    var proto = (window.location.protocol === 'file:') ? 'http:' : window.location.protocol;
    var host = window.location.hostname || 'localhost';
    return proto + '//' + host + ':5000';
  })();

  function get(path) {
    return fetch(API_BASE + path)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.ok === false) {
          throw new Error((data && data.error) || '请求失败');
        }
        return data;
      });
  }

  function post(path, body) {
    return fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || data.ok === false) {
          throw new Error((data && data.error) || '请求失败');
        }
        return data;
      });
  }

  global.Api = { base: API_BASE, get: get, post: post };
})(window);
