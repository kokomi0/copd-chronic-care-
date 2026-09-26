import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { Store } from '../../services/store';

export function NurseDashboard() {
  return (
    <div className="nurse-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">管辖病区慢友总数</div>
            <div className="metric-val">36 人</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>呼吸数字化病区二区</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Users size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">今日已打卡 / 达标率</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>31 人 (86%)</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>打卡积极度良好</div>
          </div>
          <div className="metric-icon-wrap"><Icons.CheckCircle size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">今日未打卡待催办</div>
            <div className="metric-val" style={{ color: 'var(--color-warning)' }}>5 人</div>
            <div style={{ fontSize: '11px', color: 'var(--color-warning)' }}>存在脱落失访风险</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <Icons.Bell size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">体征异常复核待办</div>
            <div className="metric-val" style={{ color: 'var(--color-danger)' }}>2 人</div>
            <div style={{ fontSize: '11px', color: 'var(--color-danger)' }}>血氧波动 &lt; 92%</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <Icons.ShieldAlert size={24} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>今日 5 位慢友尚未打卡（刘福荣、赵金生等）</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>点击一键催办将自动通过短信网关下发健康打卡与用药核销提醒</div>
        </div>
        <button
          className="btn-primary"
          onClick={async () => {
            await Store.apiFetch('/nurse/nudge-missed', { method: 'POST', body: JSON.stringify({ patient_codes: ['PAT003', 'PAT004'] }) });
            Store.showToast('已成功向 5 位漏卡患者发送短信催办通知与健康关怀弹窗！', 'success');
          }}
        >
          <Icons.Bell size={16} /> 一键随访催办
        </button>
      </div>
    </div>
  );
}

export function NurseTriageModal({ onClose }) {
  const [spo2, setSpo2] = useState(91);
  const [rr, setRr] = useState(26);
  const [speech, setSpeech] = useState('说话断续不能成句');

  const handleTriage = async () => {
    await Store.apiFetch('/nurse/triage', {
      method: 'POST',
      body: JSON.stringify({ spo2, respiratory_rate: rr, speech_difficulty: speech })
    });
    Store.showToast('分诊评估已完成：分级为【二级 急症重危】，已启动PCCM抢救绿色通道！', 'error');
    onClose();
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>急性加重 (AECOPD) 护理应急接诊初筛</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>现场脉搏血氧 SpO2 (%)</label>
          <input type="number" className="input-control" value={spo2} onChange={e => setSpo2(Number(e.target.value))} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>呼吸频率 RR (次/分)</label>
          <input type="number" className="input-control" value={rr} onChange={e => setRr(Number(e.target.value))} />
        </div>
      </div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>语言连贯度与精神状态</label>
      <select className="input-control" value={speech} onChange={e => setSpeech(e.target.value)} style={{ marginBottom: '20px' }}>
        <option value="说话如常连贯">能够说完整长句 (轻中度)</option>
        <option value="说话断续不能成句">说话断续只能说短语单词 (重度高危)</option>
        <option value="意识模糊嗜睡">意识嗜睡甚至昏迷 (危重濒危)</option>
      </select>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-danger" onClick={handleTriage}>提交初筛并呼叫急救</button>
      </div>
    </div>
  );
}

export function NurseInhalerTrainingModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>吸入装置实操视频与图谱宣教指引</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>都保 (Turbuhaler) 规范操作 5 步法：</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            1. 保持直立旋下外盖；2. 旋转到底再反转听到“咔哒”声；3. 呼尽肺内余气；4. 紧包吸嘴用力深长吸气；5. 屏气5~10秒后清水含漱并吐出。
          </div>
        </div>
        <div className="card">
          <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>常见宣教易错点提醒：</div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            切忌对着吸嘴呼气！吸气前必须将肺内气体呼尽；吸药后务必用清水彻底漱口3次并吐出，防止局部真菌感染。
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export function NurseRehabModal({ onClose }) {
  const [seconds, setSeconds] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let t = null;
    if (active) {
      t = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => { if (t) clearInterval(t); };
  }, [active]);

  const isExhale = Math.floor(seconds % 6) >= 2;

  return (
    <div className="modal-body" style={{ textAlign: 'center' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>缩唇呼吸训练节拍器 (吸呼比 1:2)</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>鼻吸气2秒，嘴缩成口哨状缓慢呼气4秒，可有效防止细支气管陷闭。</p>
      <div
        style={{
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          margin: '0 auto 20px auto',
          background: isExhale ? 'rgba(0, 137, 123, 0.15)' : 'rgba(2, 136, 209, 0.15)',
          border: `4px solid ${isExhale ? 'var(--primary)' : 'var(--color-info)'}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.5s ease'
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 800, color: isExhale ? 'var(--primary)' : 'var(--color-info)' }}>
          {isExhale ? '缓慢呼气...' : '深吸气...'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>已训练 {seconds} 秒</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          className={active ? 'btn-outline' : 'btn-primary'}
          onClick={() => setActive(!active)}
        >
          {active ? '暂停训练' : '开始呼吸节拍训练'}
        </button>
        <button className="btn-outline" onClick={onClose}>完成退出</button>
      </div>
    </div>
  );
}
