import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Config } from '../../services/config';
import { Icons } from '../../components/Icons';
import { DonutChart } from '../../components/Charts';
import {
  DirectorDashboard,
  DirectorExportModal
} from '../../components/roles/DirectorWorkbench';

export default function DirectorDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState(null);

  const modules = Config.MODULES.director || [];

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderSubHeader = (title, iconName, subtitle) => {
    const IconComp = Icons[iconName] || Icons.BarChart2;
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
          ← 返回运营驾驶舱总览
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'readmission':
        return (
          <div>
            {renderSubHeader('急性加重再入院与人群演变监控', 'ShieldAlert', '30天再入院率 4.8% (优于全国 9.5%) · GOLD A/B/E 组高危人群迁移轨迹')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>GOLD 2024 人群分组漏斗构成</h4>
                <DonutChart
                  data={[
                    { value: 280, name: 'A组 (轻症少加重)' },
                    { value: 620, name: 'B组 (重症状少加重)' },
                    { value: 386, name: 'E组 (频繁加重高危)' }
                  ]}
                  style={{ width: '100%', height: '260px' }}
                />
              </div>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>再入院阻断成效分析</h4>
                <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  <div>• <strong>全院累计阻断加重住院：</strong> <span style={{ color: 'var(--color-safe)', fontWeight: 700 }}>142 人次/年</span></div>
                  <div>• <strong>平均住院日缩短：</strong> 由 9.8 天降至 6.2 天</div>
                  <div>• <strong>医保基金支出节约测算：</strong> 约 180 万元人民币</div>
                  <div>• <strong>远程 SpO2 触发早期预警比率：</strong> 88.6% (提前 48 小时干预)</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div>
            {renderSubHeader('医护团队随访达标与工作负荷排行', 'Users', '专科医师与责任护士管辖人数、随访响应时效与依从性达标考核大盘')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: '李华山 (呼吸主任医师)', count: '280人', rate: '98.5%', time: '7.8分钟', grade: '特优' },
                  { name: '王春燕 (主管护师)', count: '320人', rate: '97.8%', time: '5.2分钟', grade: '特优' },
                  { name: '张文远 (呼吸主治医师)', count: '210人', rate: '95.2%', time: '11.5分钟', grade: '优秀' },
                  { name: '赵美华 (主管护师)', count: '240人', rate: '94.6%', time: '6.4分钟', grade: '优秀' },
                  { name: '钱志成 (副主任医师)', count: '180人', rate: '92.1%', time: '14.0分钟', grade: '良好' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{idx + 1}. {item.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>管辖慢友：{item.count} · 平均响应：{item.time}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-safe">达标率 {item.rate}</span>
                      <span className="badge badge-primary">{item.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'compliance':
        return (
          <div>
            {renderSubHeader('全院药械吸入剂使用依从度分析', 'Clock', '全院吸入粉雾剂、气雾剂打卡规范率，正确吸入手法考核达标率 94.2%')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>都保/准纳尔依从达标率</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-safe)', margin: '6px 0' }}>93.4%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>连续 30 天无断药记录</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>吸入装置规范漱口率</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>96.8%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>有效降低鹅口疮与声音嘶哑</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>三联强化制剂合理用药率</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-safe)', margin: '6px 0' }}>98.1%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>严格遵循 2024 GOLD 指南</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'vaccine':
        return (
          <div>
            {renderSubHeader('全院慢阻肺人群疫苗预防接种大盘', 'HeartPulse', '流感疫苗年度覆盖率 82.4% · 23价肺炎球菌疫苗累计覆盖 76.5%')}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>秋冬呼吸道病毒预防免疫宏观统计</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>四价流感裂解疫苗覆盖人数</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>1,059 / 1,286 例 (82.4%)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>较上年度提升 +21.8%</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>23价肺炎球菌多糖疫苗覆盖</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>984 / 1,286 例 (76.5%)</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>高危人群保护屏障形成</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'quality':
        return (
          <div>
            {renderSubHeader('基于知识图谱的临床路径规范性质控', 'Compass', '临床指南遵循率审计、严重禁忌配伍拦截与抗菌药物合理应用')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '13px', lineHeight: 1.8 }}>
                <p><strong>质控引擎工作报告：</strong> 系统自动接入知识图谱推理机，对全院 1,286 例 COPD 病历进行实时规则审计：</p>
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '10px' }}>
                  ✓ <strong>吸入三联制剂指南适应症遵循率：</strong> 97.4% (仅针对频繁加重或嗜酸粒细胞≥300的患者阶梯使用)
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px', marginBottom: '10px' }}>
                  ✓ <strong>严重药物相互作用拦截：</strong> 42 次 (成功阻断 β 受体阻滞剂禁忌联合使用)
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                  ✓ <strong>门诊抗生素滥用率：</strong> 较图谱部署前下降 36.5%
                </div>
              </div>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div>
            {renderSubHeader('综合慢病医疗决策与科研报表导出', 'Download', '国家慢病平台达标报表、三亚 PCCM 运营白皮书与脱敏队列数据集')}
            <div className="card" style={{ padding: '20px' }}>
              <DirectorExportModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div>
            <DirectorDashboard />

            {/* 金刚区 Grid */}
            <div className="grid-title-bar">
              <div className="grid-title">
                <Icons.BarChart2 size={18} color="var(--primary)" />
                【管理院长端】驾驶舱与质控大屏 ({modules.length} 个管理模块)
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>点击卡片开启质控大盘</span>
            </div>

            <div className="workbench-grid">
              {modules.map(m => {
                const IconComp = Icons[m.icon] || Icons.Activity;
                return (
                  <div
                    key={m.code}
                    className="module-card"
                    onClick={() => {
                      if (m.code === 'M02' || m.code === 'M04') setTab('readmission');
                      else if (m.code === 'M03') setTab('performance');
                      else if (m.code === 'M05') setTab('quality');
                      else if (m.code === 'M06') setTab('compliance');
                      else if (m.code === 'M07') setTab('vaccine');
                      else if (m.code === 'M09') setTab('reports');
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>管理模块运行中</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>慢病质控大盘联动正常。</p>
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
