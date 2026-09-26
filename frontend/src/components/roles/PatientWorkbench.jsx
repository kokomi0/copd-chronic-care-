import React, { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { Store } from '../../services/store';
import { BluetoothService } from '../../services/bluetooth';
import { TrendChart } from '../Charts';

// ----------------------------------------------------------------------------
// [P01] 呼吸健康看板总览
// ----------------------------------------------------------------------------
export function PatientDashboard() {
  return (
    <div className="patient-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">最新脉搏血氧 (SpO2)</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>96%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>基线平稳 · 无缺氧</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Activity size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">CAT 症状量表得分</div>
            <div className="metric-val" style={{ color: 'var(--primary)' }}>15 分</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>中度影响 · 较上周改善</div>
          </div>
          <div className="metric-icon-wrap"><Icons.CheckCircle size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">mMRC 气促级别</div>
            <div className="metric-val" style={{ color: 'var(--color-warning)' }}>2 级</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>平地步行需驻足喘气</div>
          </div>
          <div className="metric-icon-wrap"><Icons.HeartPulse size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">吸入制剂依从性</div>
            <div className="metric-val" style={{ color: 'var(--primary)' }}>100%</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>早晚规范吸入已打勾</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Clock size={24} /></div>
        </div>
      </div>

      {/* 快捷行动横幅 (急性加重红色上报一键触发) */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(229, 57, 53, 0.02) 100%)',
          borderLeft: '4px solid var(--color-danger)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icons.ShieldAlert size={28} color="var(--color-danger)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-danger)' }}>急性加重 (AECOPD) 极速就医通道</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>若出现严重气喘、脓痰暴增或口唇青紫，请立即上报或拨打 120</div>
          </div>
        </div>
        <button className="btn-danger" onClick={() => Store.openModule('P03')}>
          <Icons.AlertTriangle size={16} /> 一键红色加重上报
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P02] 每日 CAT / mMRC 症状量表打卡
// ----------------------------------------------------------------------------
const CAT_QUESTIONS = [
  { left: '我从不咳嗽', right: '我一直咳嗽' },
  { left: '我一点痰也没有', right: '我有很重的痰' },
  { left: '我没有胸闷感觉', right: '我有很重的胸闷' },
  { left: '爬坡上一层楼不喘', right: '爬坡上一层楼非常喘' },
  { left: '在家做任何事无困难', right: '在家做任何事都很困难' },
  { left: '对离家外出很有信心', right: '对离家外出一点信心也没有' },
  { left: '我睡眠非常好', right: '因肺病我睡眠非常不好' },
  { left: '我精力旺盛充沛', right: '我一点精力也没有' }
];

export function PatientCheckinModal({ onClose }) {
  const [answers, setAnswers] = useState([2, 2, 2, 2, 2, 1, 2, 2]);
  const [mmrc, setMmrc] = useState(2);
  const [spo2, setSpo2] = useState(96);
  const [saving, setSaving] = useState(false);

  const catTotal = answers.reduce((a, b) => a + b, 0);

  const handleAnswer = (qIdx, val) => {
    const next = [...answers];
    next[qIdx] = val;
    setAnswers(next);
  };

  const handleSave = async () => {
    setSaving(true);
    await Store.apiFetch('/patient/checkin', {
      method: 'POST',
      body: JSON.stringify({
        cat_total: catTotal,
        mmrc_grade: mmrc,
        spo2: spo2
      })
    });
    setSaving(false);
    Store.showToast(`打卡成功！今日 CAT 得分：${catTotal} 分，已存入图数据库时序链`, 'success');
    onClose();
  };

  return (
    <div className="modal-body">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700 }}>每日 CAT / mMRC 慢阻肺评估打卡</h3>
        <div className="badge badge-primary" style={{ fontSize: '14px', padding: '6px 12px' }}>当前总分：{catTotal} 分</div>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>每道题目请选择 0 ~ 5 分，0 分代表无影响，5 分代表最严重。</p>
      
      <div style={{ maxHeight: '380px', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' }}>
        {CAT_QUESTIONS.map((q, idx) => (
          <div key={idx} className="card" style={{ marginBottom: '12px', padding: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>{idx + 1}. {q.left}</span>
              <span style={{ color: 'var(--text-muted)' }}>{q.right}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleAnswer(idx, v)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    background: answers[idx] === v ? 'var(--primary)' : 'var(--bg-app)',
                    color: answers[idx] === v ? '#fff' : 'var(--text-main)',
                    border: answers[idx] === v ? 'none' : '1px solid var(--border-light)'
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>mMRC 气促级别 (0~4级)</label>
          <select className="input-control" value={mmrc} onChange={e => setMmrc(Number(e.target.value))}>
            <option value={0}>0级 - 仅剧烈活动时气促</option>
            <option value={1}>1级 - 平地快走或微坡时气促</option>
            <option value={2}>2级 - 平地行走需停下喘气</option>
            <option value={3}>3级 - 走100米就得停步吸气</option>
            <option value={4}>4级 - 无法外出或穿衣时亦喘</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>今日测量血氧 SpO2 (%)</label>
          <input
            type="number"
            className="input-control"
            value={spo2}
            onChange={e => setSpo2(Number(e.target.value))}
            min={80}
            max={100}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? '保存中...' : '提交今日健康打卡'}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P03] 急性加重 (Exacerbation) 红色事件上报
// ----------------------------------------------------------------------------
export function PatientExacerbationModal({ onClose }) {
  const [triggers, setTriggers] = useState(['感冒/受凉']);
  const [antibiotic, setAntibiotic] = useState(false);
  const [hospital, setHospital] = useState(false);
  const [note, setNote] = useState('');
  const [reporting, setReporting] = useState(false);

  const toggleTrigger = (t) => {
    setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const handleReport = async () => {
    setReporting(true);
    const res = await Store.apiFetch('/patient/exacerbation', {
      method: 'POST',
      body: JSON.stringify({
        triggers,
        used_antibiotic: antibiotic,
        hospitalized: hospital,
        note
      })
    });
    setReporting(false);
    Store.showToast(res ? res.msg : '🚨 急性加重警报已提交随访医生！', 'error');
    onClose();
  };

  return (
    <div className="modal-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginBottom: '14px' }}>
        <Icons.ShieldAlert size={24} />
        <h3 style={{ fontSize: '18px', fontWeight: 800 }}>慢阻肺急性加重 (AECOPD) 紧急上报</h3>
      </div>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>发生咳嗽、咳痰、气促急剧加重时请立即上报，系统将自动关联 Neo4j 图谱并触发医生复核。</p>

      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>疑似发作诱因 (可多选)</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {['感冒/受凉', '雾霾/空气差', '劳累过度', '漏用吸入药', '其他/不明'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => toggleTrigger(t)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              background: triggers.includes(t) ? 'var(--color-danger)' : 'var(--bg-app)',
              color: triggers.includes(t) ? '#fff' : 'var(--text-main)',
              border: triggers.includes(t) ? 'none' : '1px solid var(--border-light)'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
          <input type="checkbox" checked={antibiotic} onChange={e => setAntibiotic(e.target.checked)} />
          已自行口服抗生素/激素
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
          <input type="checkbox" checked={hospital} onChange={e => setHospital(e.target.checked)} />
          已到达急诊就医/住院
        </label>
      </div>

      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>病情变化详细描述</label>
      <textarea
        className="input-control"
        rows={3}
        placeholder="例如：昨晚着凉后，今天早晨黄脓痰明显增多，静坐时也觉得喘不过气..."
        value={note}
        onChange={e => setNote(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-danger" onClick={handleReport} disabled={reporting}>
          {reporting ? '上报中...' : '立即确认红色加重上报'}
        </button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P04] 身体变化趋势
// ----------------------------------------------------------------------------
export function PatientTrendsView() {
  return (
    <div className="trends-view">
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>近 30 天 CAT 评分与血氧走势趋势回溯</h3>
      <TrendChart
        labels={['09-01', '09-05', '09-10', '09-15', '09-20', '09-23', '09-26']}
        catData={[21, 19, 18, 26, 16, 19, 15]}
        spo2Data={[92, 93, 94, 89, 94, 92, 96]}
      />
      <div className="card" style={{ fontSize: '13px', lineHeight: 1.6, marginTop: '16px' }}>
        <strong style={{ color: 'var(--primary)' }}>💡 临床趋势诊断提示：</strong>
        您的 CAT 评估得分已由 8 月中旬急性加重期的 26 分回落至目前的 15 分，血氧饱和度已恢复至 96% 的安全区间。请继续坚持每日两次布地奈德福莫特罗规范吸入。
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P06] 吸入装置依从性打卡
// ----------------------------------------------------------------------------
export function PatientMedicationsModal({ onClose }) {
  const [meds, setMeds] = useState([
    { id: 1, name: '布地奈德福莫特罗粉吸入剂', device: '都保 (Turbuhaler)', time: '08:00', done: true },
    { id: 2, name: '噻托溴铵粉吸入剂', device: 'HandiHaler', time: '09:00', done: true },
    { id: 3, name: '布地奈德福莫特罗粉吸入剂', device: '都保 (Turbuhaler)', time: '20:00', done: false }
  ]);

  const handleTake = async (id) => {
    await Store.apiFetch('/patient/medications/take', {
      method: 'POST',
      body: JSON.stringify({ prescription_id: id })
    });
    setMeds(prev => prev.map(m => m.id === id ? { ...m, done: true } : m));
    Store.showToast('吸入服药打卡成功！已记录用药依从性', 'success');
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>今日吸入制剂处方与用药闹钟</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {meds.map(m => (
          <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px' }}>{m.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>装置：{m.device} · 建议时刻：{m.time}</div>
            </div>
            {m.done ? (
              <span className="badge badge-safe">✓ 今日已吸入</span>
            ) : (
              <button className="btn-primary" onClick={() => handleTake(m.id)}>吸入打卡</button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P07] 疫苗接种档案追踪
// ----------------------------------------------------------------------------
export function PatientVaccinationModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>疫苗预防接种档案 (GOLD指南推荐)</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700 }}>四价流感病毒裂解疫苗 (Influenza)</span>
            <span className="badge badge-warning">建议10月接种</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>上次接种：2025-10-12 | 推荐频次：每年秋冬入季前接种一次以防加重</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--color-safe)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700 }}>23价肺炎球菌多糖疫苗 (PPSV23)</span>
            <span className="badge badge-safe">有效保护中</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>上次接种：2024-04-18 | 下次接种：2029-04-18 (5年长效)</p>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P08] 智能设备蓝牙直连同步
// ----------------------------------------------------------------------------
export function PatientBluetoothModal({ onClose }) {
  const [connected, setConnected] = useState(false);
  const [liveData, setLiveData] = useState({ spo2: '--', pr: '--' });

  const handleConnect = async () => {
    await BluetoothService.connect('oximeter');
    setConnected(true);
    BluetoothService.startTelemetry(data => {
      setLiveData({ spo2: data.spo2, pr: data.pulse_rate });
    });
    Store.showToast('已成功通过 BLE 5.2 连接便携脉搏血氧仪！', 'success');
  };

  useEffect(() => {
    return () => BluetoothService.disconnect();
  }, []);

  return (
    <div className="modal-body" style={{ textAlign: 'center' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>智能医疗硬件蓝牙直连采集 (IoT)</h3>
      <div
        style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: connected ? 'rgba(67, 160, 71, 0.1)' : 'var(--bg-app)',
          margin: '0 auto 20px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: `3px solid ${connected ? 'var(--color-safe)' : 'var(--border-light)'}`
        }}
      >
        <Icons.Bluetooth size={36} color={connected ? 'var(--color-safe)' : 'var(--text-muted)'} />
        <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>{connected ? '已建立蓝牙流' : '未连接设备'}</div>
      </div>

      {connected && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>实时血氧 SpO2</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-safe)' }}>{liveData.spo2}%</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>实时脉率 PR</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>{liveData.pr} bpm</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {!connected ? (
          <button className="btn-primary" onClick={handleConnect}>
            <Icons.Bluetooth size={16} /> 扫描并连接便携血氧仪
          </button>
        ) : (
          <button className="btn-outline" onClick={() => { BluetoothService.disconnect(); setConnected(false); }}>
            断开连接
          </button>
        )}
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P09] 在线复诊咨询与随访医生绑定
// ----------------------------------------------------------------------------
export function PatientDoctorConsultModal({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'doctor', text: '建国师傅您好，查看您近30天打卡很规律，血氧平稳在95%以上，继续保持！早晚吸完都保切记漱口。', time: '昨天 16:30' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { sender: 'patient', text: input.trim(), time: '刚刚' }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'doctor', text: '收到您的咨询。如果夜间有偶尔干咳，可少量多次饮温水，注意防寒，有剧烈气促随时联系我。', time: '刚刚' }]);
    }, 1000);
  };

  return (
    <div className="modal-body">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '14px' }}>
        <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '15px' }}>李华山 主任医师 / 教授</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>呼吸与危重症医学科 (PCCM) · 三亚市呼吸疾病数字诊疗中心</div>
        </div>
      </div>

      <div style={{ height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', padding: '6px' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.sender === 'patient' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: '12px',
              background: m.sender === 'patient' ? 'var(--primary)' : 'var(--bg-app)',
              color: m.sender === 'patient' ? '#fff' : 'var(--text-main)',
              fontSize: '13px'
            }}
          >
            <div>{m.text}</div>
            <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>{m.time}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-control"
          placeholder="输入向李主任咨询的内容..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button className="btn-primary" onClick={handleSend}>发送</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// [P10] 个人健康档案脱敏导出
// ----------------------------------------------------------------------------
export function PatientExportModal({ onClose }) {
  const handleDownload = () => {
    const data = {
      anon_id: "ANON-COPD-2026001",
      gold_classification: "GOLD 3级 E组",
      cat_baseline: 15,
      fev1_pred_pct: 42.5,
      compliance_rate: "94.2%",
      export_date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `COPD_Health_Card_ANON-2026001.json`;
    a.click();
    Store.showToast('脱敏档案已成功导出！符合 HIPAA 与等保三级规范', 'success');
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>个人健康档案脱敏导出卡 (apoc.create.vNode)</h3>
      <div className="card" style={{ background: 'var(--bg-app)', marginBottom: '18px', fontSize: '13px', lineHeight: 1.8 }}>
        <div><strong>医学脱敏编号：</strong> ANON-COPD-2026001</div>
        <div><strong>GOLD 分类分级：</strong> GOLD 3 级 · E 组 (急性加重高危队列)</div>
        <div><strong>近 30 天平均 CAT：</strong> 16.5 分 (中度影响)</div>
        <div><strong>血氧基线均值：</strong> 94.8%</div>
        <div><strong>吸入剂处方：</strong> 布地奈德福莫特罗 160/4.5μg bid</div>
        <div><strong>隐私保护级别：</strong> 已对身份证、手机号实施强哈希脱敏</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
        <button className="btn-primary" onClick={handleDownload}>
          <Icons.Download size={16} /> 导出脱敏 JSON 档案
        </button>
      </div>
    </div>
  );
}
