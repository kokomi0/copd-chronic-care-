import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Config } from '../../services/config';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, role, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const roleCfg = Config.ROLES[role] || Config.ROLES.patient;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto', fontSize: '14px', lineHeight: 1.8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
        <span style={{ fontSize: '46px' }}>{user?.avatar || '👨‍⚕️'}</span>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>{user?.real_name || '当前用户'}</div>
          <div style={{ color: 'var(--text-secondary)' }}>
            协同角色：【{roleCfg.name}】 · 账号凭据：{user?.user_code || roleCfg.defaultAccount}
          </div>
          {user?.phone && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              绑定手机：{user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
            </div>
          )}
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '14px 0' }} />
      <div><strong>业务定点单位：</strong> 三亚市呼吸疾病数字诊疗协同中心 · PCCM专科基地</div>
      <div><strong>等保与合规性：</strong> 国家等保三级认证 · 符合 HIPAA 医疗去标识化标准</div>
      <div><strong>图数据库中间件：</strong> Neo4j 5.x Bolt 驱动 + APOC 虚拟脱敏 (apoc.create.vNode)</div>
      <div><strong>关系库持久引擎：</strong> MySQL 8.0 (ACID 强一致性业务保障)</div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button className="btn-outline" onClick={toggleTheme}>
          切换为{theme === 'light' ? '深色夜间' : '明亮白天'}主题
        </button>
        <button
          className="btn-danger"
          onClick={handleLogout}
        >
          安全退出登录
        </button>
      </div>
    </div>
  );
}
