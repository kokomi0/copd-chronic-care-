import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Config } from '../services/config';
import { Icons } from '../components/Icons';
import { ROLE_MENUS, MOBILE_BOTTOM_TABS } from '../services/navMenus';
import QRCodeModal from '../components/common/QRCodeModal';

export default function AppLayout() {
  const { user, role, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 移动端抽屉导航开关与扫码弹窗开关
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // 当前用户角色配置与菜单清单
  const activeRole = role || 'patient';
  const currentRoleCfg = Config.ROLES[activeRole] || Config.ROLES.patient;
  const roleMenus = ROLE_MENUS[activeRole] || ROLE_MENUS.patient;

  // 当前激活的子视图/Tab (默认 overview)
  const currentTab = searchParams.get('tab') || 'overview';

  // 菜单跳转
  const handleNavClick = (menuId) => {
    navigate(`/app/${activeRole}/dashboard?tab=${menuId}`);
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // 移动端底部 4 个高频快捷项 + 1 个抽屉更多按钮
  const bottomTabIds = MOBILE_BOTTOM_TABS[activeRole] || ['overview', 'checkin', 'trends', 'graph'];
  const bottomTabs = bottomTabIds.map(id => roleMenus.find(m => m.id === id) || { id, label: id, icon: 'Activity' });

  return (
    <div className="app-root">
      {/* ============================================================================== */}
      {/* 顶部 Header：移除任何角色切换器，仅保留认证信息与核心操作 */}
      {/* ============================================================================== */}
      <header className="app-header">
        <div className="brand-section">
          {/* 手机端汉堡菜单触发按钮 */}
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="打开侧边菜单"
            title="展开业务功能菜单"
          >
            <Icons.Menu size={22} />
          </button>

          <img src="/img/logo-main.png" className="brand-logo pulse-lung" alt="Logo" />
          <div>
            <div className="brand-title">
              {Config.APP_NAME}
              <span className="badge badge-primary role-badge-pill" style={{ marginLeft: '6px' }}>
                {currentRoleCfg.badge}
              </span>
            </div>
            <div className="brand-sub">{Config.APP_SUBTITLE}</div>
          </div>
        </div>

        {/* 顶部右侧：纯净只读认证信息 + 扫码体验 + 主题 + 登出 */}
        <div className="header-actions">
          {/* 📲 扫码在手机端体验按钮 */}
          <button
            className="btn-outline qr-trigger-btn"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--primary)',
              borderColor: 'var(--primary)',
              background: 'rgba(0, 137, 123, 0.06)'
            }}
            onClick={() => setQrModalOpen(true)}
            title="在手机微信或浏览器中扫码体验完整自适应移动端"
          >
            <Icons.QrCode size={16} />
            <span className="hide-on-xs" style={{ marginLeft: 6, fontWeight: 600 }}>扫码手机端进入</span>
          </button>

          {/* 深色/明亮模式切换 */}
          <button
            className="btn-outline icon-btn-round"
            style={{ padding: '7px' }}
            onClick={toggleTheme}
            title={theme === 'light' ? '切换深色主题' : '切换浅色主题'}
          >
            {theme === 'light' ? <Icons.Moon size={16} /> : <Icons.Sun size={16} />}
          </button>

          {/* 真实当前用户信息卡（只读徽章，严禁切换） */}
          <div className="user-profile-badge">
            <span className="user-avatar-circle">{user?.avatar || '👨‍⚕️'}</span>
            <div className="user-info-text">
              <span className="user-realname">{user?.real_name || currentRoleCfg.defaultName}</span>
              <span className="user-role-readonly">
                {currentRoleCfg.name} · <strong style={{ color: 'var(--primary)' }}>已鉴权</strong>
              </span>
            </div>
          </div>

          {/* 安全退出登录 */}
          <button
            className="btn-outline btn-logout"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              color: 'var(--color-danger)',
              borderColor: 'rgba(229, 57, 53, 0.3)'
            }}
            onClick={handleLogout}
            title="安全退出当前认证会话"
          >
            <Icons.LogOut size={14} />
            <span className="hide-on-xs" style={{ marginLeft: 4 }}>退出登录</span>
          </button>
        </div>
      </header>

      {/* ============================================================================== */}
      {/* 主体区 (PC/平板侧边栏 + 内容 Outlet) */}
      {/* ============================================================================== */}
      <div className="app-container">
        {/* PC/平板 专属侧边栏 (6~7 个核心业务菜单) */}
        <aside className="app-sidebar">
          {/* 角色标识卡片 */}
          <div className="sidebar-role-card">
            <div className="sidebar-role-tag">{currentRoleCfg.badge} 专区</div>
            <div className="sidebar-role-name">{currentRoleCfg.name}</div>
            <div className="sidebar-role-desc">{currentRoleCfg.desc}</div>
          </div>

          {/* 6~7 个专属业务功能菜单项 */}
          <ul className="sidebar-menu">
            {roleMenus.map(menu => {
              const TabIcon = Icons[menu.icon] || Icons.Activity;
              const isActive = currentTab === menu.id;
              return (
                <li
                  key={menu.id}
                  className={`menu-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNavClick(menu.id)}
                  title={`${menu.label} - ${menu.desc}`}
                >
                  <div className="menu-icon-wrap">
                    <TabIcon size={18} />
                  </div>
                  <div className="menu-text-wrap">
                    <span className="menu-label-text">{menu.label}</span>
                    {menu.tag && <span className="menu-sub-tag">{menu.tag}</span>}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* 侧边栏底部系统双库与合规状态 */}
          <div className="sidebar-footer">
            <div className="db-status-badge">
              <span className="status-dot-pulse" />
              <span>双库热备 · Neo4j / MySQL 连通</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>
              等保三级 & HIPAA 脱敏保护
            </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* ============================================================================== */}
      {/* 手机移动端底部快捷 4-Tab 导航 (外加 1 个“更多”触发抽屉) */}
      {/* ============================================================================== */}
      <nav className="mobile-tabbar">
        {bottomTabs.map(tab => {
          const TabIcon = Icons[tab.icon] || Icons.Activity;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleNavClick(tab.id)}
            >
              <TabIcon size={20} />
              <span>{tab.label.slice(0, 4)}</span>
            </button>
          );
        })}
        {/* 第 5 个快捷项：更多菜单 (唤起抽屉) */}
        <button
          className="tab-btn"
          onClick={() => setMobileDrawerOpen(true)}
          style={{ color: mobileDrawerOpen ? 'var(--primary)' : 'var(--text-secondary)' }}
        >
          <Icons.Menu size={20} />
          <span>全功能</span>
        </button>
      </nav>

      {/* ============================================================================== */}
      {/* 手机移动端侧滑抽屉导航 (Drawer) */}
      {/* ============================================================================== */}
      {mobileDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{user?.avatar || '👨‍⚕️'}</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>
                    {user?.real_name || currentRoleCfg.defaultName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                    {currentRoleCfg.name} ({currentRoleCfg.badge})
                  </div>
                </div>
              </div>
              <button className="btn-close-drawer" onClick={() => setMobileDrawerOpen(false)}>
                <Icons.X size={20} />
              </button>
            </div>

            <div className="drawer-menu-list">
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', paddingLeft: '8px', fontWeight: 600 }}>
                【{currentRoleCfg.name}】专属业务流程 ({roleMenus.length} 项)
              </div>
              {roleMenus.map(menu => {
                const TabIcon = Icons[menu.icon] || Icons.Activity;
                const isActive = currentTab === menu.id;
                return (
                  <div
                    key={menu.id}
                    className={`drawer-menu-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(menu.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="drawer-icon-wrap">
                        <TabIcon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{menu.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{menu.desc}</div>
                      </div>
                    </div>
                    {menu.tag && <span className="menu-sub-tag">{menu.tag}</span>}
                  </div>
                );
              })}
            </div>

            <div className="drawer-footer">
              <button
                className="btn-outline"
                style={{ width: '100%', marginBottom: '10px', fontSize: '13px' }}
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setQrModalOpen(true);
                }}
              >
                <Icons.QrCode size={16} /> 呼出体验二维码
              </button>
              <button
                className="btn-danger"
                style={{ width: '100%', fontSize: '13px' }}
                onClick={handleLogout}
              >
                <Icons.LogOut size={16} /> 退出当前登录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 📲 扫码在手机端体验 Modal 弹窗 */}
      {/* ============================================================================== */}
      {qrModalOpen && <QRCodeModal onClose={() => setQrModalOpen(false)} />}
    </div>
  );
}
