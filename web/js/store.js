// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 全局状态管理与双库数据交互桥接层 (Store)
// ==============================================================================
(function (global) {
  'use strict';

  const STORAGE_KEYS = {
    TOKEN: 'respicare_token',
    USER: 'respicare_user',
    THEME: 'respicare_theme',
    VIEWPORT: 'respicare_viewport',
    ACTIVE_ROLE: 'respicare_active_role'
  };

  const listeners = [];

  function notify() {
    listeners.forEach(fn => fn());
  }

  const Store = {
    state: {
      isLoggedIn: true,
      currentRole: localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || 'patient',
      activeTab: 'home', // 'home' | 'workbench' | 'graph' | 'profile'
      activeModule: null, // 当前展开的子模块弹窗或视图 (如 'P02')
      theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'light',
      viewportMode: localStorage.getItem(STORAGE_KEYS.VIEWPORT) || 'responsive', // 'responsive' | 'pc' | 'mobile'
      user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null') || {
        user_id: 1,
        user_code: "PAT2026001",
        real_name: "张建国",
        phone: "13800000001",
        role_code: "patient",
        avatar: "👨‍🦳"
      },
      token: localStorage.getItem(STORAGE_KEYS.TOKEN) || "mock-jwt-token-2026",
      toasts: []
    },

    subscribe(fn) {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    // --------------------------------------------------------------------------
    // 主题与视口切换
    // --------------------------------------------------------------------------
    setTheme(theme) {
      this.state.theme = theme;
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      document.documentElement.setAttribute('data-theme', theme);
      notify();
    },

    toggleTheme() {
      this.setTheme(this.state.theme === 'light' ? 'dark' : 'light');
    },

    setViewportMode(mode) {
      this.state.viewportMode = mode;
      localStorage.setItem(STORAGE_KEYS.VIEWPORT, mode);
      notify();
    },

    setActiveTab(tab) {
      this.state.activeTab = tab;
      this.state.activeModule = null;
      notify();
    },

    openModule(moduleCode) {
      this.state.activeModule = moduleCode;
      notify();
    },

    closeModule() {
      this.state.activeModule = null;
      notify();
    },

    // --------------------------------------------------------------------------
    // 角色切换 (五大角色一键自由切换)
    // --------------------------------------------------------------------------
    switchRole(roleCode) {
      if (!Config.ROLES[roleCode]) return;
      this.state.currentRole = roleCode;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleCode);

      // 同步更新模拟用户身份
      const r = Config.ROLES[roleCode];
      this.state.user = {
        user_id: roleCode === 'patient' ? 1 : 2,
        user_code: r.defaultAccount,
        real_name: r.defaultName,
        phone: roleCode === 'patient' ? '13800000001' : '13900000002',
        role_code: roleCode,
        avatar: roleCode === 'patient' ? '👨‍🦳' : (roleCode === 'doctor' ? '👨‍⚕️' : (roleCode === 'nurse' ? '👩‍⚕️' : (roleCode === 'director' ? '👔' : '💻')))
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.state.user));

      this.state.activeModule = null;
      this.showToast(`已成功切换至【${r.name}】工作台`, 'success');
      notify();
    },

    // --------------------------------------------------------------------------
    // 登录与退出
    // --------------------------------------------------------------------------
    loginSuccess(token, user) {
      this.state.token = token;
      this.state.user = user;
      this.state.currentRole = user.role_code;
      this.state.isLoggedIn = true;
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, user.role_code);
      this.showToast(`欢迎回来，${user.real_name}！`, 'success');
      notify();
    },

    logout() {
      this.state.isLoggedIn = false;
      this.state.token = null;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      notify();
    },

    // --------------------------------------------------------------------------
    // 提示 Toast 消息系统
    // --------------------------------------------------------------------------
    showToast(message, type = 'info') {
      const id = Date.now() + Math.random();
      const toast = { id, message, type };
      this.state.toasts.push(toast);
      notify();
      setTimeout(() => {
        this.state.toasts = this.state.toasts.filter(t => t.id !== id);
        notify();
      }, 3500);
    },

    // --------------------------------------------------------------------------
    // API 双库协同通信桥接层 (优先连接 Flask 后端，超时回退平滑 Mock)
    // --------------------------------------------------------------------------
    async apiFetch(endpoint, options = {}) {
      const url = `${Config.API_BASE}${endpoint}`;
      const headers = {
        'Content-Type': 'application/json',
        ...(this.state.token ? { 'Authorization': `Bearer ${this.state.token}` } : {}),
        ...(options.headers || {})
      };

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { ...options, headers, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        // 后端未开启时的离线高可用回退
      }
      return null;
    }
  };

  // 初始化设置主题
  document.documentElement.setAttribute('data-theme', Store.state.theme);

  global.Store = Store;
})(window);
