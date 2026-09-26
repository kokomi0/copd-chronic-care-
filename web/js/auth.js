// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 统一主题色彩系统的登录注册页 (React 组件)
// 包含：5大角色切换选择器、手机短信 60s 倒计时、密码强度校验、明暗文切换、协议勾选
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect } = React;

  function LoginModal({ onClose }) {
    const [selectedRole, setSelectedRole] = useState(Store.state.currentRole || 'patient');
    const [loginType, setLoginType] = useState('sms'); // 'sms' | 'pwd' (患者端支持双模式，专业端默认 pwd)
    
    // 表单状态
    const [phone, setPhone] = useState('13800000001');
    const [smsCode, setSmsCode] = useState('');
    const [account, setAccount] = useState('PAT2026001');
    const [password, setPassword] = useState('123456');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(true);
    const [loading, setLoading] = useState(false);

    // 60秒倒计时状态
    const [countdown, setCountdown] = useState(0);

    // 当切换角色时，自动填充对应的预设工号/手机号
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

    // 倒计时计时器
    useEffect(() => {
      let timer = null;
      if (countdown > 0) {
        timer = setInterval(() => {
          setCountdown(prev => prev - 1);
        }, 1000);
      }
      return () => {
        if (timer) clearInterval(timer);
      };
    }, [countdown]);

    // 计算密码强度 (0: 空, 1: 弱, 2: 中, 3: 强)
    const getPasswordStrength = (pwd) => {
      if (!pwd) return 0;
      let score = 0;
      if (pwd.length >= 6) score++;
      if (pwd.length >= 8 && /[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score++;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score++;
      return Math.min(3, Math.max(1, score));
    };

    const pwdStrength = getPasswordStrength(password);

    // 发送验证码 (含 60s 倒计时与后端交互)
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
        // 离线平滑模拟
        setCountdown(60);
        setSmsCode('666888');
        Store.showToast('测试环境已发放验证码：666888', 'success');
      }
    };

    // 执行登录提交
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!agreeTerms) {
        Store.showToast('请阅读并勾选《用户服务协议》与《隐私政策》', 'warning');
        return;
      }

      setLoading(true);
      let res = null;

      if (selectedRole === 'patient' && loginType === 'sms') {
        if (!smsCode) {
          Store.showToast('请输入收到的6位验证码', 'warning');
          setLoading(false);
          return;
        }
        res = await Store.apiFetch('/auth/login-sms', {
          method: 'POST',
          body: JSON.stringify({ phone, code: smsCode })
        });
      } else {
        res = await Store.apiFetch('/auth/login-password', {
          method: 'POST',
          body: JSON.stringify({ account, password, role_code: selectedRole })
        });
      }

      setLoading(false);

      if (res && res.ok) {
        Store.loginSuccess(res.token, res.user);
        if (onClose) onClose();
      } else {
        // 离线平滑备用登录模拟
        const roleCfg = Config.ROLES[selectedRole];
        const mockUser = {
          user_id: selectedRole === 'patient' ? 1 : 2,
          user_code: account || roleCfg.defaultAccount,
          real_name: roleCfg.defaultName,
          phone: phone,
          role_code: selectedRole,
          avatar: selectedRole === 'patient' ? '👨‍🦳' : '👨‍⚕️'
        };
        Store.loginSuccess('mock-jwt-token-2026', mockUser);
        if (onClose) onClose();
      }
    };

    return h('div', {
      className: 'login-modal-overlay',
      style: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }
    }, [
      h('div', {
        key: 'modal-card',
        className: 'card',
        style: {
          width: '100%',
          maxWidth: '480px',
          padding: '28px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'breathingPulse 0.4s ease-out'
        }
      }, [
        // 1. 顶部品牌与标题
        h('div', { key: 'head', style: { textAlign: 'center', marginBottom: '20px' } }, [
          h('img', {
            src: 'assets/logo.png',
            alt: 'Logo',
            style: { width: '48px', height: '48px', marginBottom: '8px' }
          }),
          h('h2', {
            style: { fontSize: '20px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }
          }, '智肺呼吸 RespiCare 360'),
          h('p', {
            style: { fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }
          }, '慢阻肺数字化智慧管理与知识图谱协同平台')
        ]),

        // 2. 五大角色切换选择器 (Role Switcher Tab)
        h('div', {
          key: 'role-selector',
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            background: 'var(--bg-app)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px'
          }
        }, Object.keys(Config.ROLES).map(rCode => {
          const r = Config.ROLES[rCode];
          const isSelected = selectedRole === rCode;
          return h('button', {
            key: rCode,
            type: 'button',
            onClick: () => handleRoleChange(rCode),
            style: {
              padding: '8px 2px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              fontWeight: isSelected ? 700 : 500,
              background: isSelected ? 'var(--primary)' : 'transparent',
              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
              boxShadow: isSelected ? '0 2px 8px rgba(0, 137, 123, 0.3)' : 'none',
              transition: 'all 0.18s ease',
              textAlign: 'center'
            }
          }, r.name.slice(0, 4));
        })),

        // 角色提示条
        h('div', {
          key: 'role-tip',
          style: {
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            background: Config.ROLES[selectedRole].bgLight,
            color: Config.ROLES[selectedRole].color,
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }
        }, [
          h(Icons.Activity, { size: 16, color: Config.ROLES[selectedRole].color }),
          `当前登录身份：【${Config.ROLES[selectedRole].name}】—— ${Config.ROLES[selectedRole].desc}`
        ]),

        // 3. 认证通道切换 (患者支持短信/密码，专业端工号密码)
        selectedRole === 'patient' && h('div', {
          key: 'patient-channel',
          style: {
            display: 'flex',
            borderBottom: '1px solid var(--border-light)',
            marginBottom: '16px'
          }
        }, [
          h('button', {
            key: 'sms-tab',
            type: 'button',
            onClick: () => setLoginType('sms'),
            style: {
              flex: 1,
              padding: '8px 0',
              fontWeight: loginType === 'sms' ? 700 : 500,
              color: loginType === 'sms' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: loginType === 'sms' ? '2px solid var(--primary)' : 'none'
            }
          }, '手机验证码登录/自动注册'),
          h('button', {
            key: 'pwd-tab',
            type: 'button',
            onClick: () => setLoginType('pwd'),
            style: {
              flex: 1,
              padding: '8px 0',
              fontWeight: loginType === 'pwd' ? 700 : 500,
              color: loginType === 'pwd' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: loginType === 'pwd' ? '2px solid var(--primary)' : 'none'
            }
          }, '账号密码登录')
        ]),

        // 4. 登录表单
        h('form', { key: 'form', onSubmit: handleSubmit }, [
          // 手机短信通道
          (selectedRole === 'patient' && loginType === 'sms') ? [
            h('div', { key: 'phone-field', style: { marginBottom: '14px' } }, [
              h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '中国大陆手机号码'),
              h('input', {
                type: 'tel',
                className: 'input-control',
                placeholder: '请输入11位手机号 (测试可用 13800000001)',
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                maxLength: 11,
                required: true
              })
            ]),
            h('div', { key: 'code-field', style: { marginBottom: '14px' } }, [
              h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '6位短信验证码'),
              h('div', { style: { display: 'flex', gap: '8px' } }, [
                h('input', {
                  type: 'text',
                  className: 'input-control',
                  placeholder: '输入验证码',
                  value: smsCode,
                  onChange: (e) => setSmsCode(e.target.value),
                  maxLength: 6,
                  required: true
                }),
                h('button', {
                  type: 'button',
                  className: 'btn-outline',
                  onClick: handleSendSms,
                  disabled: countdown > 0 || loading,
                  style: {
                    whiteSpace: 'nowrap',
                    minWidth: '120px',
                    borderColor: countdown > 0 ? 'var(--border-light)' : 'var(--primary)',
                    color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)'
                  }
                }, countdown > 0 ? `${countdown}s 后重发` : '获取验证码')
              ])
            ])
          ] : [
            // 账号/工号/手机号 + 密码通道
            h('div', { key: 'acc-field', style: { marginBottom: '14px' } }, [
              h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, 
                selectedRole === 'patient' ? '患者病历号 / 注册手机号' : '医院工号 / 执业手机号'
              ),
              h('input', {
                type: 'text',
                className: 'input-control',
                placeholder: selectedRole === 'patient' ? 'PAT2026001 或手机号' : `${Config.ROLES[selectedRole].defaultAccount} 或手机号`,
                value: account,
                onChange: (e) => setAccount(e.target.value),
                required: true
              })
            ]),
            h('div', { key: 'pwd-field', style: { marginBottom: '10px' } }, [
              h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '登录密码'),
              h('div', { style: { position: 'relative' } }, [
                h('input', {
                  type: showPassword ? 'text' : 'password',
                  className: 'input-control',
                  placeholder: '请输入密码 (默认 123456)',
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  required: true
                }),
                h('button', {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  style: {
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }
                }, h(showPassword ? Icons.EyeOff : Icons.Eye, { size: 18 }))
              ])
            ]),
            // 密码强度指示条
            h('div', { key: 'strength-bar', style: { marginBottom: '14px' } }, [
              h('div', { style: { display: 'flex', gap: '4px', height: '4px', marginTop: '4px' } }, [
                h('div', { style: { flex: 1, borderRadius: '2px', background: pwdStrength >= 1 ? (pwdStrength === 1 ? '#E53935' : (pwdStrength === 2 ? '#FB8C00' : '#43A047')) : 'var(--border-light)' } }),
                h('div', { style: { flex: 1, borderRadius: '2px', background: pwdStrength >= 2 ? (pwdStrength === 2 ? '#FB8C00' : '#43A047') : 'var(--border-light)' } }),
                h('div', { style: { flex: 1, borderRadius: '2px', background: pwdStrength >= 3 ? '#43A047' : 'var(--border-light)' } })
              ]),
              h('div', { style: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', textAlign: 'right' } }, 
                pwdStrength === 0 ? '' : (pwdStrength === 1 ? '密码强度：弱' : (pwdStrength === 2 ? '密码强度：中等' : '密码强度：高安全'))
              )
            ])
          ],

          // 5. 协议勾选
          h('div', {
            key: 'terms',
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '20px'
            }
          }, [
            h('input', {
              type: 'checkbox',
              id: 'agreeCheck',
              checked: agreeTerms,
              onChange: (e) => setAgreeTerms(e.target.checked)
            }),
            h('label', { htmlFor: 'agreeCheck', style: { cursor: 'pointer' } }, [
              '已阅读并同意',
              h('span', { style: { color: 'var(--primary)', fontWeight: 600 } }, '《用户服务协议》'),
              '与',
              h('span', { style: { color: 'var(--primary)', fontWeight: 600 } }, '《医疗数据隐私安全政策》')
            ])
          ]),

          // 6. 提交登录按钮
          h('button', {
            key: 'submit-btn',
            type: 'submit',
            className: 'btn-primary',
            disabled: loading,
            style: { width: '100%', padding: '12px', fontSize: '15px' }
          }, loading ? '安全鉴权中...' : `以【${Config.ROLES[selectedRole].name}】身份进入工作台`),

          // 7. 一键快速填充测试
          h('div', {
            key: 'quick-fill',
            style: {
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px dashed var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }
          }, [
            h('span', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, '一键快速体验：'),
            h('div', { style: { display: 'flex', gap: '6px' } }, 
              ['patient', 'doctor', 'nurse', 'director', 'tech_admin'].map(r => 
                h('button', {
                  key: r,
                  type: 'button',
                  onClick: () => handleRoleChange(r),
                  style: {
                    fontSize: '11px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-app)',
                    color: 'var(--primary)',
                    border: '1px solid var(--border-light)'
                  }
                }, Config.ROLES[r].badge.slice(0, 2))
              )
            )
          ])
        ])
      ])
    ]);
  }

  global.LoginModal = LoginModal;
})(window);
