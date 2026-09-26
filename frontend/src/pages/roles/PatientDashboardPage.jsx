import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Config } from '../../services/config';
import { Icons } from '../../components/Icons';
import GraphNVL from '../../components/GraphNVL';
import {
  PatientDashboard,
  PatientCheckinModal,
  PatientExacerbationModal,
  PatientTrendsView,
  PatientMedicationsModal,
  PatientVaccinationModal,
  PatientBluetoothModal,
  PatientDoctorConsultModal,
  PatientExportModal
} from '../../components/roles/PatientWorkbench';

export default function PatientDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState(null);

  const modules = Config.MODULES.patient || [];

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // 顶部快捷导航与返回栏
  const renderSubHeader = (title, iconName, subtitle) => {
    const IconComp = Icons[iconName] || Icons.Activity;
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
          ← 返回呼吸健康总览
        </button>
      </div>
    );
  };

  // 根据当前激活的 tab 渲染对应子视图
  const renderTabContent = () => {
    switch (activeTab) {
      case 'checkin':
        return (
          <div>
            {renderSubHeader('每日 CAT / mMRC 症状打卡', 'CheckCircle', '标准 8 题 CAT 问卷与 0~4 级气促评估入图')}
            <div className="card" style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>
              <PatientCheckinModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'trends':
        return (
          <div>
            {renderSubHeader('身体变化趋势与加重热力', 'BarChart2', '近 30/90 天 CAT 评分、脉搏血氧时序与加重日历')}
            <div className="card" style={{ padding: '20px' }}>
              <PatientTrendsView onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'exacerbation':
        return (
          <div>
            {renderSubHeader('急性加重红色通道与自救', 'ShieldAlert', 'AECOPD 极速就医、血氧预警与主治医生干预')}
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px', borderLeft: '4px solid var(--color-danger)' }}>
              <PatientExacerbationModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'graph':
        return (
          <div>
            {renderSubHeader('慢阻肺呼吸康复全景知识图谱', 'Share2', '病理机制、吸入用药、缩唇腹式呼吸与预防疫苗链')}
            <div className="card" style={{ padding: '16px' }}>
              <GraphNVL defaultGroup="all" />
            </div>
          </div>
        );

      case 'medication':
        return (
          <div>
            {renderSubHeader('疫苗接种与吸入用药档案', 'Clock', '都保/准纳尔装置打卡日历、流感/肺炎疫苗提醒')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Clock size={18} color="var(--primary)" /> 吸入制剂用药打卡
                </h4>
                <PatientMedicationsModal onClose={() => setTab('overview')} />
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.FileText size={18} color="var(--primary)" /> 疫苗接种档案追踪
                </h4>
                <PatientVaccinationModal onClose={() => setTab('overview')} />
              </div>
            </div>
          </div>
        );

      case 'consult':
        return (
          <div>
            {renderSubHeader('在线复诊与随访医生绑定', 'MessageSquare', '绑定李华山主任医师，提供图文问诊与用药指导')}
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
              <PatientDoctorConsultModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div>
            {/* 患者今日生命体征与快捷通道 */}
            <PatientDashboard />

            {/* 金刚区工作台 Grid (支持一键切换到专属子视图) */}
            <div className="grid-title-bar">
              <div className="grid-title">
                <Icons.Activity size={18} color="var(--primary)" />
                【慢阻肺患者端】核心功能工作台 ({modules.length} 个专科模块)
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>点击卡片开启交互</span>
            </div>

            <div className="workbench-grid">
              {modules.map(m => {
                const IconComp = Icons[m.icon] || Icons.Activity;
                return (
                  <div
                    key={m.code}
                    className="module-card"
                    onClick={() => {
                      if (m.code === 'P02') setTab('checkin');
                      else if (m.code === 'P03') setTab('exacerbation');
                      else if (m.code === 'P04') setTab('trends');
                      else if (m.code === 'P05') setTab('graph');
                      else if (m.code === 'P06' || m.code === 'P07') setTab('medication');
                      else if (m.code === 'P09') setTab('consult');
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

      {/* 弹窗兜底 (针对 P08 蓝牙、P10 导出等辅助模块) */}
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
            {activeModal === 'P08' ? (
              <PatientBluetoothModal onClose={() => setActiveModal(null)} />
            ) : activeModal === 'P10' ? (
              <PatientExportModal onClose={() => setActiveModal(null)} />
            ) : (
              <div className="modal-body">
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>模块已就绪</h3>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <button className="btn-primary" onClick={() => setActiveModal(null)}>关闭</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
