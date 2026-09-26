import React, { useState, useEffect } from 'react';
import { Icons } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordModal({ isOpen, onClose, onSuccessPhone }) {
  const { apiFetch, showToast } = useAuth();

  const [step, setStep] = useState(1); // 1: 验证手机与短信, 2: 输入新密码, 3: 重置成功
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [countdown]);

  if (!isOpen) return null;

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
    } catch (err) {
      setCountdown(60);
      setCode('666888');
      showToast('测试验证码已发放：666888', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!phone || phone.length !== 11) {
      showToast('请输入正确的11位手机号', 'warning');
      return;
    }
    if (!code || code.length < 4) {
      showToast('请输入收到的短信验证码', 'warning');
      return;
    }
    setStep(2);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('新密码长度不能少于 6 位', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入的密码不一致，请核对', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          phone,
          code,
          new_password: newPassword
        })
      });
      setStep(3);
      showToast('密码重置成功！请使用新密码登录', 'success');
      if (onSuccessPhone) onSuccessPhone(phone, newPassword);
    } catch (err) {
      showToast(err.message || '重置密码失败，请核对验证码', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
    setStep(1);
    setPhone('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
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
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* 标题栏 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Icons.ShieldAlert size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                找回与重置登录密码
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                验证绑定手机号即可一键重设安全密码
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

        {/* 步骤条进度指示器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          {[
            { s: 1, title: '身份验证' },
            { s: 2, title: '设置新密码' },
            { s: 3, title: '重置完成' }
          ].map((item, idx) => (
            <React.Fragment key={item.s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: step >= item.s ? 'var(--primary)' : 'var(--border-light)',
                    color: step >= item.s ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  {step > item.s ? '✓' : item.s}
                </span>
                <span style={{ fontSize: '12px', fontWeight: step === item.s ? 700 : 500, color: step >= item.s ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  {item.title}
                </span>
              </div>
              {idx < 2 && <div style={{ flex: 1, height: '2px', background: step > item.s ? 'var(--primary)' : 'var(--border-light)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* 步骤 1：手机号与验证码 */}
        {step === 1 && (
          <form onSubmit={handleNextStep}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>注册/绑定手机号</label>
              <input
                type="tel"
                className="input-control"
                placeholder="请输入注册时使用的11位手机号码"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={11}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>短信安全验证码</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="输入6位短信验证码"
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
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                提示：测试账号固定验证码为 <code>666888</code>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-outline" onClick={onClose}>取消</button>
              <button type="submit" className="btn-primary">下一步：重置密码</button>
            </div>
          </form>
        )}

        {/* 步骤 2：输入新密码 */}
        {step === 2 && (
          <form onSubmit={handleResetSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>设置新密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-control"
                  placeholder="请输入至少6位新密码"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ paddingRight: '38px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                >
                  {showPwd ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>再次确认新密码</label>
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-control"
                placeholder="请再次输入新密码"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>上一步</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? '正在重置...' : '确认重置并生效'}
              </button>
            </div>
          </form>
        )}

        {/* 步骤 3：成功完成 */}
        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--color-safe-bg)',
                color: 'var(--color-safe)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}
            >
              <Icons.CheckCircle size={36} />
            </div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
              密码重置成功！
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              您的账号已成功绑定新密码，手机号 <strong>{phone}</strong> 可直接使用新密码登录。
            </p>
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '10px 0', fontSize: '14px' }}
              onClick={handleFinish}
            >
              返回登录界面
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
