// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 全局身份认证与会话状态上下文 (AuthContext)
// ==============================================================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Config } from '../services/config';

const STORAGE_KEYS = {
  TOKEN: 'respicare_auth_token',
  USER: 'respicare_auth_user',
  THEME: 'respicare_theme',
  VIEWPORT: 'respicare_viewport'
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 冷启动安全检测：尝试从本地提取有效 Token 与用户会话
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.TOKEN) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEYS.THEME) || 'light');
  const [viewportMode, setViewportMode] = useState(() => localStorage.getItem(STORAGE_KEYS.VIEWPORT) || 'responsive');
  const [toasts, setToasts] = useState([]);

  // 计算是否持有效认证凭据
  const isAuthenticated = Boolean(token && user && user.role_code);
  const currentRole = user?.role_code || null;

  // 主题切换同步
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  // 视口切换同步
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEWPORT, viewportMode);
  }, [viewportMode]);

  // 全局 Toast 提示
  const showToast = (msg, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // 登录动作：写入 Token 与用户会话
  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN, jwtToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    showToast(`欢迎回来，${userData.real_name || '用户'}！`, 'success');
  };

  // 登出动作：彻底清除本地凭据，回退至未认证状态
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    showToast('您已成功退出登录', 'info');
  };

  // 主题与视口切换方法
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleViewport = () => setViewportMode(prev => (prev === 'mobile' ? 'responsive' : 'mobile'));

  // 统一 API 客户端（自动注入 Bearer Token，并在 401 时强制注销）
  const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${Config.API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        // Token 失效拦截
        logout();
        showToast('登录会话已过期，请重新登录', 'warning');
        throw new Error('会话已失效 (401)');
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.msg || `请求错误 (${res.status})`);
      }
      return data;
    } catch (err) {
      console.warn(`[Auth API] ${endpoint} request failed:`, err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: currentRole,
        isAuthenticated,
        theme,
        viewportMode,
        toasts,
        login,
        logout,
        toggleTheme,
        toggleViewport,
        showToast,
        apiFetch
      }}
    >
      {children}

      {/* 全局统一 Toast 浮层 */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none'
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className="card"
            style={{
              background:
                t.type === 'error'
                  ? 'var(--color-danger)'
                  : t.type === 'success'
                  ? 'var(--primary)'
                  : t.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--bg-card)',
              color: t.type === 'info' ? 'var(--text-main)' : '#fff',
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              fontSize: '13px',
              fontWeight: 600,
              pointerEvents: 'auto',
              border: 'none',
              animation: 'breathingPulse 0.3s ease-out'
            }}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
