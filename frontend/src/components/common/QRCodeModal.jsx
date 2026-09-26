import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Icons } from '../Icons';
import { useAuth } from '../../context/AuthContext';

export default function QRCodeModal({ onClose }) {
  const { showToast } = useAuth();
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // 动态计算局域网访问地址
  const getLanUrl = () => {
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol;
    // 如果当前是通过局域网 IP 访问，直接使用当前 origin
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}/`;
    }
    // 否则默认推荐本机检测到的有效 Wi-Fi 局域网 IP
    return `${protocol}//192.168.1.10${port || ':5173'}/`;
  };

  const [customUrl, setCustomUrl] = useState(getLanUrl());

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        customUrl,
        {
          width: 210,
          margin: 1.5,
          color: {
            dark: '#004D40', // 智肺呼吸深青绿
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('[QRCode error]:', error);
        }
      );
    }
  }, [customUrl]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(customUrl);
      } else {
        const input = document.createElement('input');
        input.value = customUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast('已复制手机端体验链接到剪贴板！', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      showToast('复制失败，请手动长按复制地址框', 'warning');
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '24px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 77, 64, 0.25)',
          borderRadius: '18px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏与关闭 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icons.QrCode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                手机端扫码直达体验
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                全功能自适应移动端 · 呼吸青绿医疗交互
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* 二维码容器 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '18px 0 12px 0'
          }}
        >
          <div
            style={{
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(0, 137, 123, 0.12)',
              border: '2px solid rgba(0, 137, 123, 0.15)',
              display: 'inline-flex',
              position: 'relative'
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '8px' }} />
          </div>

          <div
            style={{
              marginTop: '10px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
            局域网端口已监听 0.0.0.0:5173
          </div>
        </div>

        {/* 局域网访问地址框与一键复制 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            手机端访问直达链接 (局域网 IP)：
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-control"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              style={{ fontSize: '13px', fontWeight: 500, fontFamily: 'monospace' }}
            />
            <button
              className={copied ? 'btn-primary' : 'btn-outline'}
              onClick={handleCopy}
              style={{ whiteSpace: 'nowrap', padding: '0 14px', fontSize: '13px' }}
            >
              {copied ? '✓ 已复制' : <><Icons.Copy size={14} /> 复制</>}
            </button>
          </div>
        </div>

        {/* 友好说明卡片 */}
        <div
          style={{
            background: 'var(--bg-app)',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '18px',
            border: '1px solid var(--border-light)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
            💡 手机端扫码与访问指引：
          </div>
          <div>1. <strong>同一 Wi-Fi 网络</strong>：请确保手机与当前电脑连接至同一 Wi-Fi 局域网。</div>
          <div>2. <strong>微信扫一扫 / 浏览器扫码</strong>：使用手机自带相机或微信“扫一扫”直接扫码打开。</div>
          <div>3. <strong>移动端优化</strong>：移动端自动启用抽屉式侧边栏与屏幕底部快捷导航栏。</div>
        </div>

        {/* 底部操作 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" style={{ width: '100%', padding: '10px' }} onClick={onClose}>
            我知道了，开始体验
          </button>
        </div>
      </div>
    </div>
  );
}
