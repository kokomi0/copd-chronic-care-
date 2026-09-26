import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Config } from '../../services/config';
import { Icons } from '../../components/Icons';
import GraphNVL from '../../components/GraphNVL';
import { LineTrendChart, RadarChart } from '../../components/Charts';
import {
  DoctorDashboard,
  DoctorRadarModal,
  DoctorReviewModal,
  DoctorAdjustMedModal,
  DoctorGraphSearchModal,
  DoctorVaccineAdviceModal,
  DoctorResearchModal
} from '../../components/roles/DoctorWorkbench';

export default function DoctorDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState(null);

  const modules = Config.MODULES.doctor || [];

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderSubHeader = (title, iconName, subtitle) => {
    const IconComp = Icons[iconName] || Icons.Stethoscope;
    return (
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconComp size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>{title}</h3>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{subtitle}</div>
          </div>
        </div>
        <button className="btn-outline" onClick={() => setTab('overview')} style={{ fontSize: '13px', padding: '6px 14px' }}>
          ← 返回专科诊疗总览
        </button>
      </div>
    );
  };

  // 根据当前激活的 tab 渲染专科医生专属子视图
  const renderTabContent = () => {
    switch (activeTab) {
      case 'patients':
        return (
          <div>
            {renderSubHeader('COPD 患者专科分级档案库', 'Users', 'PCCM 管辖 280 例患者病历分型、依从性与随访打卡追踪')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="搜索患者姓名、手机号或编号 (如 张建国 / 13800000001)..."
                  className="input-control"
                  style={{ maxWidth: '340px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ fontSize: '12px' }}>全部患者 (280)</button>
                  <button className="btn-outline" style={{ fontSize: '12px', color: 'var(--color-danger)' }}>GOLD E 组 (84)</button>
                  <button className="btn-outline" style={{ fontSize: '12px' }}>依从性偏低 (18)</button>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '10px' }}>患者姓名</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>GOLD 分期</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>CAT 评分</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>SpO2 血氧</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>当前维持用药</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>吸入依从性</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>临床干预</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>张建国 (PAT2026001)</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-danger">GOLD 3级 E组</span></td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>15 分</td>
                      <td style={{ padding: '10px', color: 'var(--color-safe)', fontWeight: 700 }}>96%</td>
                      <td style={{ padding: '10px' }}>布地奈德福莫特罗 + 噻托溴铵</td>
                      <td style={{ padding: '10px', color: 'var(--color-safe)' }}>93.4% (优)</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setTab('radar')}>雷达研判</button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>刘福荣 (PAT2026003)</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-danger">GOLD 4级 E组</span></td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>24 分</td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>91% (低氧)</td>
                      <td style={{ padding: '10px' }}>单用沙丁胺醇 (未规范维持)</td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)' }}>58.2% (差)</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button className="btn-danger" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setTab('prescriptions')}>调整处方</button>
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>王桂花 (PAT2026005)</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-primary">GOLD 2级 B组</span></td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>11 分</td>
                      <td style={{ padding: '10px', color: 'var(--color-safe)', fontWeight: 700 }}>97%</td>
                      <td style={{ padding: '10px' }}>乌美溴铵维兰特罗吸入粉雾剂</td>
                      <td style={{ padding: '10px', color: 'var(--color-safe)' }}>95.0% (优)</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>
                        <button className="btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setTab('consult')}>图文随访</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'radar':
        return (
          <div>
            {renderSubHeader('GOLD E 组高危急性加重预警雷达', 'AlertTriangle', '多维时序特征感知、频繁加重风险研判与临床干预方案')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <DoctorRadarModal onClose={() => setTab('overview')} />
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <DoctorReviewModal onClose={() => setTab('overview')} />
              </div>
            </div>
          </div>
        );

      case 'trends':
        return (
          <div>
            {renderSubHeader('患者时序打卡研判中心', 'BarChart2', '多参数时序关联：CAT 评分轨迹、SpO2 波动与 FEV1 改善率')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700 }}>当前研判对象：张建国 (ANON-COPD-2026001) · 近 7 日时序轨迹</span>
                <span className="badge badge-safe">依从规范 稳态改善</span>
              </div>
              <LineTrendChart />
              <div className="card" style={{ background: 'var(--bg-app)', marginTop: '20px', fontSize: '13px', lineHeight: 1.6 }}>
                <strong>👨‍⚕️ 主任医师研判结论：</strong>
                患者吸入双联制剂后，CAT 评估得分由加重期的 19 分稳步降至 15 分，SpO2 维持在 95%~97% 区间，日间咳喘频率显著减少，暂无需启动口服糖皮质激素加药。
              </div>
            </div>
          </div>
        );

      case 'prescriptions':
        return (
          <div>
            {renderSubHeader('处方与吸入装置方案优化', 'Clock', 'GOLD 指南阶梯升级：吸入装置适应症评估与三联强化用药')}
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
              <DoctorAdjustMedModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'graph':
        return (
          <div>
            {renderSubHeader('临床图谱路径与循证推理', 'Compass', '病理机制、药物配伍禁忌、合并症靶点与循证临床路径')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <DoctorGraphSearchModal onClose={() => setTab('overview')} />
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <GraphNVL defaultGroup="all" />
              </div>
            </div>
          </div>
        );

      case 'consult':
        return (
          <div>
            {renderSubHeader('医患在线随访咨询中心', 'MessageSquare', '管辖患者线上问诊消息队列、复诊开药与指导建议')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>签发流感/肺炎疫苗接种指导建议</h4>
                <DoctorVaccineAdviceModal onClose={() => setTab('overview')} />
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <DoctorResearchModal onClose={() => setTab('overview')} />
              </div>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div>
            <DoctorDashboard />

            {/* 金刚区 Grid */}
            <div className="grid-title-bar">
              <div className="grid-title">
                <Icons.Stethoscope size={18} color="var(--primary)" />
                【呼吸专科医生端】核心临床模块 ({modules.length} 个专科模块)
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>点击卡片开启临床干预</span>
            </div>

            <div className="workbench-grid">
              {modules.map(m => {
                const IconComp = Icons[m.icon] || Icons.Activity;
                return (
                  <div
                    key={m.code}
                    className="module-card"
                    onClick={() => {
                      if (m.code === 'D01') setTab('patients');
                      else if (m.code === 'D02') setTab('radar');
                      else if (m.code === 'D03') setTab('trends');
                      else if (m.code === 'D04' || m.code === 'D05') setTab('prescriptions');
                      else if (m.code === 'D06') setTab('graph');
                      else if (m.code === 'D07' || m.code === 'D08' || m.code === 'D09') setTab('consult');
                      else setActiveModal(m.code);
                    }}
                  >
                    <div>
                      <div className="module-card-header">
                        <div className="module-icon-box"><IconComp size={20} /></div>
                        <div>
                          <div className="module-name">{m.name}</div>
                          <span className="module-code">{m.code}</span>
                        </div>
                      </div>
                      <div className="module-desc">{m.desc}</div>
                    </div>
                    <div className="module-action">
                      <span>进入操作</span>
                      <Icons.ChevronRight size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderTabContent()}

      {activeModal && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(6px)',
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-body">
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>模块已就绪</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>临床决策支持引擎响应正常。</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="btn-primary" onClick={() => setActiveModal(null)}>关闭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
