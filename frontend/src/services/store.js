// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 全局状态管理 (Store)
// ==============================================================================
import { Config } from './config';

const STORAGE_KEYS = {
  TOKEN: 'respicare_token',
  USER: 'respicare_user',
  THEME: 'respicare_theme',
  VIEWPORT: 'respicare_viewport',
  ACTIVE_ROLE: 'respicare_active_role'
};

const listeners = new Set();

function notify() {
  listeners.forEach(fn => fn());
}

export const Store = {
  state: {
    isLoggedIn: true,
    currentRole: localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || 'patient',
    activeTab: 'home', // 'home' | 'workbench' | 'graph' | 'profile'
    activeModule: null, // 'P01', 'P02', etc.
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
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

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

  switchRole(roleCode) {
    if (!Config.ROLES[roleCode]) return;
    this.state.currentRole = roleCode;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleCode);

    const r = Config.ROLES[roleCode];
    this.state.user = {
      user_id: roleCode === 'patient' ? 1 : 2,
      user_code: r.defaultAccount,
      real_name: r.defaultName,
      phone: roleCode === 'patient' ? '13800000001' : '13900000002',
      role_code: roleCode,
      avatar: roleCode === 'patient' ? "👨‍🦳" : "👨‍⚕️"
    };
    this.state.activeModule = null;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.state.user));
    this.showToast(`已切换至【${r.name}】专属工作台`, 'success');
    notify();
  },

  login(user, token) {
    this.state.isLoggedIn = true;
    this.state.user = user;
    this.state.token = token;
    this.state.currentRole = user.role_code || 'patient';
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, user.role_code || 'patient');
    this.showToast(`欢迎回来，${user.real_name || '用户'}！`, 'success');
    notify();
  },

  logout() {
    this.state.isLoggedIn = false;
    this.state.user = null;
    this.state.token = null;
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    this.showToast("已退出当前登录", "info");
    notify();
  },

  showToast(msg, type = 'info') {
    const id = Date.now() + Math.random();
    this.state.toasts.push({ id, msg, type });
    notify();
    setTimeout(() => {
      this.state.toasts = this.state.toasts.filter(t => t.id !== id);
      notify();
    }, 3200);
  },

  async apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${Config.API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.state.token ? { 'Authorization': `Bearer ${this.state.token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ msg: res.statusText }));
        throw new Error(errorData.msg || `请求错误 (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      console.warn(`[Store API] ${endpoint} fetch warning:`, err);
      return null;
    }
  }
};
