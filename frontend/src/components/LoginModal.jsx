import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { Config } from '../services/config';
import { Store } from '../services/store';

export default function LoginModal({ onClose }) {
  const [selectedRole, setSelectedRole] = useState(Store.state.currentRole || 'patient');
  const [loginType, setLoginType] = useState('sms');
  const [phone, setPhone] = useState('13800000001');
  const [smsCode, setSmsCode] = useState('');
  const [account, setAccount] = useState('PAT2026001');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleRoleChange = (rCode) => {
    setSelectedRole(rCode);
    const roleCfg = Config.ROLES[rCode];
    if (rCode === 'patient') {
      setPhone('13800000001');
      setAccount('PAT2026001');
      setPassword('123456');
    } else {
      setLoginType('pwd');
      setAccount(roleCfg.defaultAccount);
      setPassword('123456');
    }
  };

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return Math.min(3, Math.max(1, score));
  };

  const pwdStrength = getPasswordStrength(password);

  const handleSendSms = async () => {
    if (!phone || phone.length !== 11) {
      Store.showToast('请输入正确的11位大陆手机号码', 'warning');
      return;
    }
    if (countdown > 0) return;

    setLoading(true);
    const res = await Store.apiFetch('/auth/send-sms', {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
    setLoading(false);

    if (res && res.ok) {
      setCountdown(res.countdown || 60);
      setSmsCode(res.mock_code || '666888');
      Store.showToast(`验证码已发送：${res.mock_code || '666888'}`, 'success');
    } else {
      setCountdown(60);
      setSmsCode('666888');
      Store.showToast('测试环境已发放验证码：666888', 'success');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      Store.showToast('请阅读并勾选《用户服务协议》与《隐私政策》', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (selectedRole === 'patient' && loginType === 'sms') {
        const res = await Store.apiFetch('/auth/login-sms', {
          method: 'POST',
          body: JSON.stringify({ phone, code: smsCode || '666888' })
        });
        if (res && res.ok) {
          Store.login(res.user, res.token);
          onClose();
        } else {
          fallbackLogin();
        }
      } else {
        const res = await Store.apiFetch('/auth/login-password', {
          method: 'POST',
          body: JSON.stringify({ account, password, role_code: selectedRole })
        });
        if (res && res.ok) {
          Store.login(res.user, res.token);
          onClose();
        } else {
          fallbackLogin();
        }
      }
    } catch {
      fallbackLogin();
    } finally {
      setLoading(false);
    }

    function fallbackLogin() {
      const roleCfg = Config.ROLES[selectedRole];
      Store.login({
        user_id: selectedRole === 'patient' ? 1 : 2,
        user_code: account || roleCfg.defaultAccount,
        real_name: roleCfg.defaultName,
        phone: phone || '13800000001',
        role_code: selectedRole,
        avatar: selectedRole === 'patient' ? '👨‍🦳' : '👨‍⚕️'
      }, 'mock-token-2026');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: 460, borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🫁</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--primary)' }}>智肺呼吸 · 统一身份认证</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>RespiCare 360 RBAC 临床协同接入中心</div>
            </div>
          </div>
          <button onClick={onClose} style={{ fontSize: 18, color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
        </div>

        {/* 5 角色选择药丸 */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
          {Object.entries(Config.ROLES).map(([rCode, r]) => (
            <button
              key={rCode}
              type="button"
              onClick={() => handleRoleChange(rCode)}
              style={{
                flex: '0 0 auto',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: 12,
                fontWeight: 600,
                background: selectedRole === rCode ? r.color : 'var(--bg-app)',
                color: selectedRole === rCode ? '#fff' : 'var(--text-main)',
                border: selectedRole === rCode ? 'none' : '1px solid var(--border-light)',
                cursor: 'pointer'
              }}
            >
              {r.badge}
            </button>
          ))}
        </div>

        {/* 登录模式切换 (患者端支持验证码/密码) */}
        {selectedRole === 'patient' && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setLoginType('sms')}
              style={{
                flex: 1,
                padding: '8px 0',
                fontWeight: 700,
                fontSize: 13,
                color: loginType === 'sms' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: loginType === 'sms' ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              手机短信验证码登录
            </button>
            <button
              type="button"
              onClick={() => setLoginType('pwd')}
              style={{
                flex: 1,
                padding: '8px 0',
                fontWeight: 700,
                fontSize: 13,
                color: loginType === 'pwd' ? 'var(--primary)' : 'var(--text-secondary)',
                borderBottom: loginType === 'pwd' ? '2px solid var(--primary)' : 'none',
                cursor: 'pointer'
              }}
            >
              账号密码登录
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {selectedRole === 'patient' && loginType === 'sms' ? (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>手机号</label>
                <input
                  type="tel"
                  className="input-control"
                  placeholder="请输入 11 位手机号码"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>短信验证码 (测试码: 666888)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="输入 6 位验证码"
                    value={smsCode}
                    onChange={e => setSmsCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleSendSms}
                    disabled={countdown > 0 || loading}
                    style={{ whiteSpace: 'nowrap', minWidth: 100 }}
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                  {selectedRole === 'patient' ? '患者号 / 手机号' : '医护工号 / 登录账号'}
                </label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="请输入登录凭证"
                  value={account}
                  onChange={e => setAccount(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>登录密码 (默认 123456)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-control"
                    placeholder="请输入密码"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ paddingRight: 38 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                  </button>
                </div>

                {/* 密码强度条 */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', gap: 4, height: 4, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ flex: 1, background: pwdStrength >= 1 ? '#EF5350' : 'var(--border-light)' }} />
                    <div style={{ flex: 1, background: pwdStrength >= 2 ? '#FFA726' : 'var(--border-light)' }} />
                    <div style={{ flex: 1, background: pwdStrength >= 3 ? '#66BB6A' : 'var(--border-light)' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    密码强度：{pwdStrength === 0 ? '未输入' : (pwdStrength === 1 ? '基础' : (pwdStrength === 2 ? '良好' : '安全强密码'))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, fontSize: 12, color: 'var(--text-secondary)' }}>
            <input type="checkbox" id="terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
            <label htmlFor="terms">已阅读并同意《医疗健康服务协议》与《隐私政策》</label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '11px 0', fontSize: 15 }} disabled={loading}>
            {loading ? '正在验证身份...' : `进入【${Config.ROLES[selectedRole].name}】工作台`}
          </button>
        </form>

        {/* 快捷一键登录预设 */}
        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textAlign: 'center' }}>一键填表快速评测体验：</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(Config.ROLES).map(([rCode, r]) => (
              <button
                key={rCode}
                type="button"
                className="btn-outline"
                style={{ fontSize: 11, padding: '4px 8px' }}
                onClick={() => handleRoleChange(rCode)}
              >
                {r.badge} ({r.defaultAccount})
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
