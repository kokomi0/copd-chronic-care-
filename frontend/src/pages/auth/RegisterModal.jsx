import React, { useState, useEffect } from 'react';
import { Icons } from '../../components/Icons';
import { Config } from '../../services/config';
import { useAuth } from '../../context/AuthContext';

export default function RegisterModal({ isOpen, onClose, initialRole = 'patient', onSuccess }) {
  const { apiFetch, login, showToast } = useAuth();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [realName, setRealName] = useState('');
  const [roleCode, setRoleCode] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialRole) setRoleCode(initialRole);
  }, [initialRole]);

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  if (!isOpen) return null;

  const getPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
    return Math.min(3, Math.max(1, score));
  };
  const pwdStrength = getPasswordStrength(password);

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11 || !phone.startsWith('1')) {
      showToast('请输入正确的11位中国大陆手机号码', 'warning');
      return;
    }
    if (countdown > 0) return;

    setLoading(true);
    try {
      const res = await apiFetch('/auth/send-sms', {
        method: 'POST',
        body: JSON.stringify({ phone })
      });
      setCountdown(res.countdown || 60);
      setCode(res.mock_code || '666888');
      showToast(`验证码已发送至手机：${res.mock_code || '666888'}`, 'success');
    } catch {
      setCountdown(60);
      setCode('666888');
      showToast('测试环境已发放验证码：666888', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('请阅读并勾选《医疗慢病服务协议》与《隐私政策》', 'warning');
      return;
    }
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的11位手机号码', 'warning');
      return;
    }
    if (!code) {
      showToast('请输入收到的短信验证码', 'warning');
      return;
    }
    if (!password || password.length < 6) {
      showToast('密码长度至少需要 6 位', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          code,
          password,
          role_code: roleCode,
          real_name: realName
        })
      });

      if (res && res.token) {
        login(res.user, res.token);
        onClose();
        if (onSuccess) onSuccess(res.user);
      }
    } catch (err) {
      showToast(err.message || '注册失败，请稍后重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🫁</span>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--primary)' }}>
                注册智肺呼吸账号
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                开启基于 GOLD 2024 指南的慢阻肺智慧管理
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              fontSize: '16px',
              background: 'var(--bg-app)'
            }}
          >
            ✕
          </button>
        </div>

        {/* 角色选择 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
            选择注册身份角色
          </label>
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {Object.entries(Config.ROLES).map(([rCode, r]) => (
              <button
                key={rCode}
                type="button"
                onClick={() => setRoleCode(rCode)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: roleCode === rCode ? r.color : 'var(--bg-app)',
                  color: roleCode === rCode ? '#fff' : 'var(--text-main)',
                  border: roleCode === rCode ? 'none' : '1px solid var(--border-light)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {r.badge}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>手机号码</label>
            <input
              type="tel"
              className="input-control"
              placeholder="请输入11位大陆手机号码"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              maxLength={11}
              required
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>短信验证码</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="输入6位验证码"
                value={code}
                onChange={e => setCode(e.target.value)}
                maxLength={6}
                required
              />
              <button
                type="button"
                className="btn-outline"
                onClick={handleSendCode}
                disabled={countdown > 0 || loading}
                style={{ whiteSpace: 'nowrap', minWidth: '106px' }}
              >
                {countdown > 0 ? `${countdown}s 后可重发` : '获取验证码'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>真实姓名 / 称呼 (可选)</label>
            <input
              type="text"
              className="input-control"
              placeholder="例如：张建国"
              value={realName}
              onChange={e => setRealName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>设置登录密码</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-control"
                placeholder="设置至少6位密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: '38px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
              </button>
            </div>

            {/* 密码强度条 */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '4px', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: pwdStrength >= 1 ? '#EF5350' : 'var(--border-light)' }} />
                <div style={{ flex: 1, background: pwdStrength >= 2 ? '#FFA726' : 'var(--border-light)' }} />
                <div style={{ flex: 1, background: pwdStrength >= 3 ? '#66BB6A' : 'var(--border-light)' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <input type="checkbox" id="reg-terms" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
            <label htmlFor="reg-terms">已阅读并同意《医疗健康服务协议》与《隐私政策》</label>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '11px 0', fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? '正在注册并登录...' : `立即注册并进入【${Config.ROLES[roleCode].name}】`}
          </button>
        </form>
      </div>
    </div>
  );
}
