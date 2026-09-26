import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Config } from '../../services/config';
import { Icons } from '../../components/Icons';
import GraphNVL from '../../components/GraphNVL';
import {
  AdminDashboard,
  AdminVNodeModal,
  AdminAuditModal
} from '../../components/roles/AdminWorkbench';

export default function AdminDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [activeModal, setActiveModal] = useState(null);

  const modules = Config.MODULES.tech_admin || [];

  const setTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const renderSubHeader = (title, iconName, subtitle) => {
    const IconComp = Icons[iconName] || Icons.Cpu;
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
          ← 返回技术拓扑总览
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'neo4j':
        return (
          <div>
            {renderSubHeader('Neo4j 图数据库拓扑与 APOC 存储过程', 'Database', 'Bolt 5.x 高并发连接池、Cypher 毫秒执行时延、图拓扑结构监控')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Neo4j 节点与关系分布统计</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                  <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Patient 实体节点</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', marginTop: '4px' }}>1,286</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Observation 观测时序</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-safe)', marginTop: '4px' }}>38,400</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Exacerbation 加重事件</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-danger)', marginTop: '4px' }}>412</div>
                  </div>
                  <div style={{ padding: '12px', background: 'var(--bg-app)', borderRadius: '8px' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Vaccination 疫苗节点</div>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-warning)', marginTop: '4px' }}>1,980</div>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: '16px' }}>
                <GraphNVL defaultGroup="all" />
              </div>
            </div>
          </div>
        );

      case 'rbac':
        return (
          <div>
            {renderSubHeader('RBAC 五大角色细粒度权限管控中心', 'Settings', '患者、专科医生、护士、院长、运维五端权限矩阵与动态授权')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                      <th style={{ textAlign: 'left', padding: '10px' }}>角色名称</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>角色代码</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>权限点覆盖</th>
                      <th style={{ textAlign: 'left', padding: '10px' }}>脱敏级别</th>
                      <th style={{ textAlign: 'right', padding: '10px' }}>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>慢阻肺患者</td>
                      <td style={{ padding: '10px' }}><code>patient</code></td>
                      <td style={{ padding: '10px' }}>症状打卡 / 红色急救 / 康复图谱 / 闹钟</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-primary">本端明文</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--color-safe)' }}>● 启用</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>专科医生</td>
                      <td style={{ padding: '10px' }}><code>doctor</code></td>
                      <td style={{ padding: '10px' }}>管辖患者 / GOLD E雷达 / 处方调整 / 质控推理</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-safe">临床全览</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--color-safe)' }}>● 启用</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>专科护士</td>
                      <td style={{ padding: '10px' }}><code>nurse</code></td>
                      <td style={{ padding: '10px' }}>病区监控 / 漏卡催办 / 应急初筛 / 宣教核销</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-safe">病区明文</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--color-safe)' }}>● 启用</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>管理院长</td>
                      <td style={{ padding: '10px' }}><code>director</code></td>
                      <td style={{ padding: '10px' }}>运营大屏 / 再入院监控 / 质控达标 / 报表导出</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-warning">统计宏观</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--color-safe)' }}>● 启用</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: 600 }}>技术运维</td>
                      <td style={{ padding: '10px' }}><code>tech_admin</code></td>
                      <td style={{ padding: '10px' }}>APOC拓扑 / CDC调度 / IoT流式 / vNode脱敏</td>
                      <td style={{ padding: '10px' }}><span className="badge badge-danger">HIPAA强制脱敏</span></td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--color-safe)' }}>● 启用</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'iot':
        return (
          <div>
            {renderSubHeader('医疗 IoT 设备接入与流式管道监控', 'Bluetooth', '便携脉搏血氧仪、便携肺功能仪毫秒级数据上报与连接探针')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>在线 IoT 医疗网关设备</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>412 台</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>● 连接探针心跳正常 (Ping 12ms)</div>
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-app)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>遥测指标流式吞吐量</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', margin: '6px 0' }}>85.4 条/秒</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>MQTT + WebSocket 实时入库</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'vnode':
        return (
          <div>
            {renderSubHeader('虚拟节点策略与医疗数据脱敏规则', 'ShieldAlert', 'apoc.create.vNode 动态虚拟脱敏节点策略与出境合规审计')}
            <div className="card" style={{ padding: '20px' }}>
              <AdminVNodeModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'audit':
        return (
          <div>
            {renderSubHeader('全链路安全合规与操作审计留痕', 'FileText', '等保三级医疗全生命周期操作日志溯源、接口鉴权与敏感数据导出审计')}
            <div className="card" style={{ padding: '20px' }}>
              <AdminAuditModal onClose={() => setTab('overview')} />
            </div>
          </div>
        );

      case 'release':
        return (
          <div>
            {renderSubHeader('系统发布多端热更新与二维码服务', 'RefreshCw', '手机自适应版、PC 工作台发布版本号、局域网移动端入口配置')}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div><strong>当前线上核心版本：</strong> {Config.VERSION} (React 18 + Vite 5 + Flask 3 + Neo4j 5)</div>
                <div><strong>移动端局域网二维码：</strong> 已绑定 <code>http://192.168.1.10:5173/</code></div>
                <div><strong>灰度发布策略：</strong> 移动端全量自适应开启，已集成抽屉导航与微信扫一扫自适应。</div>
              </div>
            </div>
          </div>
        );

      case 'overview':
      default:
        return (
          <div>
            <AdminDashboard />

            {/* 金刚区 Grid */}
            <div className="grid-title-bar">
              <div className="grid-title">
                <Icons.Cpu size={18} color="var(--primary)" />
                【技术运维端】系统架构与图数据库 APOC 监控 ({modules.length} 个技术模块)
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>点击卡片开启运维控制台</span>
            </div>

            <div className="workbench-grid">
              {modules.map(m => {
                const IconComp = Icons[m.icon] || Icons.Activity;
                return (
                  <div
                    key={m.code}
                    className="module-card"
                    onClick={() => {
                      if (m.code === 'T01' || m.code === 'T07') setTab('neo4j');
                      else if (m.code === 'T02') setTab('rbac');
                      else if (m.code === 'T04') setTab('iot');
                      else if (m.code === 'T05') setTab('vnode');
                      else if (m.code === 'T06') setTab('audit');
                      else if (m.code === 'T08') setTab('release');
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
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>技术组件已就绪</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>APOC 引擎与 CDC 数据流正常。</p>
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
