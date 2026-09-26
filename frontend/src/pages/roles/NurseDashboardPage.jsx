import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Config } from '../../services/config';
import { Icons } from '../../components/Icons';
import {
  NurseDashboard,
  NurseTriageModal,
  NurseInhalerTrainingModal,
  NurseRehabModal
} from '../../components/roles/NurseWorkbench';

export default function NurseDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState(null);

  const modules = Config.MODULES.nurse || [];

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderSubHeader = (title, iconName, subtitle) => {
    const IconComp = Icons[iconName] || Icons.HeartPulse;
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
          ← 返回病区护理总览
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'monitor':
        return (
          <div>
            {renderSubHeader('打卡监控与随访催办中心', 'Bell', '实时筛查今日漏卡患者、异常血氧警示与批量防脱落催办')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>病区患者打卡状态监控表 (呼吸数字化二区)</span>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>今日已打卡 31/36 人 (86%) · 5 例未打卡待催办</div>
                </div>
                <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => alert('已成功发送短信批量催办！')}>
                  <Icons.Bell size={14} /> 一键批量短信/电话催办
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '10px' }}>床号/编号</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>患者姓名</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>今日打卡</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>最新体征</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>连续漏卡天数</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>0201 (PAT2026001)</td>
                      <td style={{ padding: '10px' }}>张建国</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-safe">已打卡 (08:24)</span></td>
                      <td style={{ padding: '10px' }}>SpO2 96% | CAT 15分</td>
                      <td style={{ padding: '10px' }}>0 天 (规律)</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}><button className="btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }}>健康回访</button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>0203 (PAT2026003)</td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>刘福荣</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-danger">未打卡</span></td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)' }}>昨晚 SpO2 91% (低氧)</td>
                      <td style={{ padding: '10px', color: 'var(--color-danger)', fontWeight: 700 }}>2 天 (脱落高危)</td>
                      <td style={{ padding: '10px', textAlign: 'right'}}><button className="btn-danger" style={{ padding: '4px 8px', fontSize: '11px' }}>定向催办</button></td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>0205 (PAT2026004)</td>
                      <td style={{ padding: '10px' }}>赵金生</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-warning">未打卡</span></td>
                      <td style={{ padding: '10px' }}>前日 CAT 18分</td>
                      <td style={{ padding: '10px' }}>1 天</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}><button className="btn-outline" style={{ padding: '4px 8px', fontSize: '11px' }}>发送短信</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'triage':
        return (
          <div>
            {renderSubHeader('急性加重 (AECOPD) 护理应急接诊初筛', 'ShieldAlert', '急症初筛评估：血氧 SpO2、呼吸频率 RR、语言连贯度与意识状态')}
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
              <NurseTriageModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'education':
        return (
          <div>
            {renderSubHeader('吸入装置标准手法图谱宣教与考核', 'FileText', '都保/准纳尔/易纳器标准 6 步法教学视频、实操考核卡与图谱指引')}
            <div className="card" style={{ maxWidth: '720px', margin: '0 auto', padding: '24px' }}>
              <NurseInhalerTrainingModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'vaccine':
        return (
          <div>
            {renderSubHeader('流感与肺炎疫苗预防接种执行', 'CheckCircle', '疫苗门诊预约名单核验、批号登记、不良反应随访')}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>本周病区疫苗预防接种执行队列 (24 人待接种)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: '张建国 (71岁)', type: '四价流感病毒裂解疫苗 (成人型)', date: '今日 14:30', status: '待核销接种' },
                  { name: '刘福荣 (68岁)', type: '23价肺炎球菌多糖疫苗', date: '明日 09:30', status: '待核销接种' },
                  { name: '王秀兰 (65岁)', type: '四价流感疫苗', date: '已于9-25完成', status: '已登记留观无异常' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name} · <span style={{ color: 'var(--primary)' }}>{item.type}</span></div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>预约时段：{item.date}</div>
                    </div>
                    <button className={item.status.includes('已') ? 'btn-outline' : 'btn-primary'} style={{ fontSize: '12px', padding: '4px 12px' }}>
                      {item.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'rehab':
        return (
          <div>
            {renderSubHeader('呼吸康复训练节拍器与排痰督导', 'Activity', '缩唇呼吸 (吸2秒呼4秒)、腹式呼吸节拍器与有效咳嗽指导')}
            <div className="card" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px' }}>
              <NurseRehabModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'handover':
        return (
          <div>
            {renderSubHeader('护理巡查查房与白夜班交接记录', 'MessageSquare', '重点关注低氧、频发加重危重患者体征变化与特殊处置医嘱留痕')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>今日白班/夜班交接重点患者记录簿</div>
              <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '10px', fontSize: '13px', lineHeight: 1.7, marginBottom: '16px' }}>
                <div><strong>📅 日期班次：</strong> 2026年9月26日 白班 (交班人：王春燕 主管护师)</div>
                <div><strong>🚨 特殊危急患者：</strong> 0203床刘福荣夜间血氧一度跌至 90%，已督促规范吸入并通知值班医生李华山复核，目前暂平稳，夜班需每 2 小时巡查脉搏血氧仪指标。</div>
                <div><strong>💉 宣教执行：</strong> 0201床张建国已完成吸入剂含漱手法复查，评分 98 分，达标。</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button className="btn-primary" style={{ fontSize: '13px' }} onClick={() => alert('交接班日志已归档签名！')}>
                  签署交接班记录 (王春燕)
                </button>
              </div>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div>
            <NurseDashboard />

            {/* 金刚区 Grid */}
            <div className="grid-title-bar">
              <div className="grid-title">
                <Icons.HeartPulse size={18} color="var(--primary)" />
                【专科护士端】核心护理功能 ({modules.length} 个专科模块)
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>点击卡片开启护理业务</span>
            </div>

            <div className="workbench-grid">
              {modules.map(m => {
                const IconComp = Icons[m.icon] || Icons.Activity;
                return (
                  <div
                    key={m.code}
                    className="module-card"
                    onClick={() => {
                      if (m.code === 'N01' || m.code === 'N02') setTab('monitor');
                      else if (m.code === 'N03') setTab('triage');
                      else if (m.code === 'N04') setTab('education');
                      else if (m.code === 'N05') setTab('vaccine');
                      else if (m.code === 'N07') setTab('rehab');
                      else if (m.code === 'N08') setTab('handover');
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>护理模块运行中</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>病区护理协作引擎联动正常。</p>
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
