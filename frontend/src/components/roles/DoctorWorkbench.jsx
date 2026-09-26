import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';
import { Store } from '../../services/store';
import { RadarChart } from '../Charts';

export function DoctorDashboard() {
  return (
    <div className="doctor-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">在管慢阻肺患者</div>
            <div className="metric-val">280 人</div>
            <div style={{ fontSize: '11px', color: 'var(--primary)' }}>GOLD E组占比 30.0%</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Users size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">高危急性加重预警</div>
            <div className="metric-val" style={{ color: 'var(--color-danger)' }}>2 例待处置</div>
            <div style={{ fontSize: '11px', color: 'var(--color-danger)' }}>血氧&lt;90% 伴气促骤升</div>
          </div>
          <div className="metric-icon-wrap" style={{ background: 'var(--color-danger-bg)', color: 'var(--color-danger)' }}>
            <Icons.ShieldAlert size={24} />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">吸入制剂依从达标率</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>93.4%</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>高于全国平均 (68%)</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Clock size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">待回复线上问诊</div>
            <div className="metric-val" style={{ color: 'var(--color-warning)' }}>1 条未读</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>平均响应时效 8 分钟</div>
          </div>
          <div className="metric-icon-wrap"><Icons.MessageSquare size={24} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PCCM 在管重点随访患者全景列表</h4>
          <button className="btn-outline" onClick={() => Store.openModule('D02')}>
            <Icons.AlertTriangle size={14} /> 打开 GOLD E 组预警雷达
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>患者编号 / 姓名</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>GOLD 分组</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>最新 CAT</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>SpO2</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>年加重次数</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>依从率</th>
                <th style={{ textAlign: 'right', padding: '10px' }}>临床处置</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>ANON-COPD-2026001 (张建国)</td>
                <td style={{ padding: '10px' }}><span className="badge badge-danger">GOLD 3级 E组</span></td>
                <td style={{ padding: '10px', fontWeight: 700 }}>15 分</td>
                <td style={{ padding: '10px', color: 'var(--color-safe)', fontWeight: 700 }}>96%</td>
                <td style={{ padding: '10px' }}>1 次</td>
                <td style={{ padding: '10px', color: 'var(--color-safe)' }}>93.4%</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  <button className="btn-outline" style={{ padding: '4px 8px', fontSize: '11px', marginRight: '6px' }} onClick={() => Store.openModule('D01')}>调阅图谱</button>
                  <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => Store.openModule('D04')}>复核处置</button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '10px', fontWeight: 600 }}>ANON-COPD-2026003 (刘福荣)</td>
                <td style={{ padding: '10px' }}><span className="badge badge-danger">GOLD 4级 E组</span></td>
                <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>24 分</td>
                <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>91% (低氧)</td>
                <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>3 次 (频发)</td>
                <td style={{ padding: '10px', color: 'var(--color-warning)' }}>72.5%</td>
                <td style={{ padding: '10px', textAlign: 'right' }}>
                  <button className="btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => Store.openModule('D04')}>急救干预</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function DoctorRadarModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>GOLD 2024 E组高危急性加重特征雷达</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>系统针对刘福荣 (PAT2026003) 综合计算得出的多维临床加重风险投影：</p>
      <RadarChart
        indicators={[
          { name: '近1年加重次数', max: 4 },
          { name: 'CAT波动幅度', max: 40 },
          { name: 'mMRC气促级别', max: 4 },
          { name: '血氧去饱和频次', max: 10 },
          { name: '吸入依从性低', max: 100 },
          { name: '合并症肺心病风险', max: 100 }
        ]}
        values={[3, 24, 3, 7, 28, 65]}
      />
      <div className="card" style={{ background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', fontSize: '13px', marginTop: '16px' }}>
        <strong style={{ color: 'var(--color-danger)' }}>🚨 临床路径处置建议：</strong>
        该患者夜间血氧多次低于 90%，近 1 年急性加重 3 次，符合 GOLD 极重度频发特征。建议升级为三联制剂强化，签署长期家庭氧疗建议，并启动呼吸康复远程监护。
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export function DoctorReviewModal({ onClose }) {
  const [advice, setAdvice] = useState('口服阿莫西林克拉维酸钾 0.375g tid 连服5天 + 泼尼松片 30mg 晨起顿服3天，配合布地奈德福莫特罗都保每次2吸每日2次，随访观察血氧。');
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    await Store.apiFetch('/doctor/review-exacerbation', {
      method: 'POST',
      body: JSON.stringify({ ex_id: 'EXAC_20260815', clinical_advice: advice })
    });
    setSubmitting(false);
    Store.showToast('急性加重临床干预方案已下达，已向患者端推送医嘱通知并同步入图谱！', 'success');
    onClose();
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>急性加重 (AECOPD) 临床复核与医嘱下达</h3>
      <div className="card" style={{ background: 'var(--bg-app)', marginBottom: '16px', fontSize: '13px', lineHeight: 1.6 }}>
        <div><strong>上报患者：</strong> 张建国 (ANON-COPD-2026001)</div>
        <div><strong>上报主诉：</strong> 受凉后咳嗽痰量明显增多，伴活动后气喘加剧</div>
        <div><strong>上报时体征：</strong> CAT 19分，SpO2 92%，既往加重史1次</div>
      </div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>医师干预方案与指导医嘱</label>
      <textarea
        className="input-control"
        rows={3}
        value={advice}
        onChange={e => setAdvice(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={handleConfirm} disabled={submitting}>
          {submitting ? '下达中...' : '审核通过并下达干预方案'}
        </button>
      </div>
    </div>
  );
}

export function DoctorAdjustMedModal({ onClose }) {
  const [regimen, setRegimen] = useState('升级为三联制剂：氟替美维吸入粉雾剂 (ICS+LAMA+LABA) 每日1次');

  const handleAdjust = async () => {
    await Store.apiFetch('/doctor/adjust-medication', {
      method: 'POST',
      body: JSON.stringify({ new_regimen: regimen })
    });
    Store.showToast('处方阶梯方案调整成功！已同步至 MySQL 与患者用药提醒卡', 'success');
    onClose();
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>吸入制剂用药方案阶梯调整</h3>
      <div className="card" style={{ marginBottom: '16px', fontSize: '13px' }}>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>当前方案：布地奈德福莫特罗 160/4.5μg bid + 噻托溴铵 18μg qd</div>
        <div style={{ color: 'var(--text-secondary)' }}>依从性评分：93.4 分 · 装置操作规范</div>
      </div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>调整后新处方方案 (GOLD指南阶梯推荐)</label>
      <input
        type="text"
        className="input-control"
        value={regimen}
        onChange={e => setRegimen(e.target.value)}
        style={{ marginBottom: '18px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={handleAdjust}>确认调整下达处方</button>
      </div>
    </div>
  );
}

export function DoctorGraphSearchModal({ onClose }) {
  const [keyword, setKeyword] = useState('相互作用');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await Store.apiFetch(`/doctor/graph-search?q=${encodeURIComponent(keyword)}`);
    if (res && res.results) setResults(res.results);
  };

  useEffect(() => { handleSearch(); }, []);

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>COPD 临床知识图谱检索推理引擎</h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          className="input-control"
          placeholder="输入症状、药物、配伍禁忌或并发症..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button className="btn-primary" onClick={handleSearch}>图谱检索</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' }}>
        {results.map((r, i) => (
          <div key={i} className="card" style={{ fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>{r.title}</div>
            <div style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.evidence}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export function DoctorVaccineAdviceModal({ onClose }) {
  const [advice, setAdvice] = useState('建议于2026年10月上旬前完成四价流感疫苗接种，以减少秋冬季呼吸道病毒感染诱发急性加重风险。');

  const handleIssue = async () => {
    await Store.apiFetch('/doctor/issue-vaccine-advice', {
      method: 'POST',
      body: JSON.stringify({ advice })
    });
    Store.showToast('疫苗接种临床建议已签发，已直达患者疫苗提醒卡！', 'success');
    onClose();
  };

  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>签发疫苗预防接种指导意见 (GOLD E组)</h3>
      <textarea
        className="input-control"
        rows={3}
        value={advice}
        onChange={e => setAdvice(e.target.value)}
        style={{ marginBottom: '16px' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button className="btn-outline" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={handleIssue}>签发医嘱</button>
      </div>
    </div>
  );
}

export function DoctorResearchModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>慢阻肺科研队列多中心脱敏数据集</h3>
      <div className="card" style={{ background: 'var(--bg-app)', marginBottom: '16px', fontSize: '13px', lineHeight: 1.8 }}>
        <div><strong>入组总病例数：</strong> 128 例 (海南三亚PCCM专科多中心)</div>
        <div><strong>GOLD 分布构成：</strong> A组 24例 (18.7%) | B组 58例 (45.3%) | E组 46例 (36.0%)</div>
        <div><strong>CAT 3个月改善均值：</strong> -4.2 分 (P &lt; 0.01)</div>
        <div><strong>FEV1 年衰退延缓：</strong> 延缓 24 mL/年 (规范吸入依从组)</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
