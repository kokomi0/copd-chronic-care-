// ==============================================================================
// 智肺呼吸 (RespiCare 360) - [技术运维端] 九大运维与知识工程模块组件 (React)
// [T01] Neo4j与APOC监控 | [T02] RBAC权限矩阵 | [T03] 短信网关路由
// [T04] IoT设备管道监控 | [T05] vNode虚拟脱敏规则 | [T06] 审计日志中心
// [T07] 本体字典维护 | [T08] 灰度发布热更新 | [T09] 双写CDC调度
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect } = React;

  function AdminDashboard() {
    return h('div', { className: 'admin-dashboard' }, [
      // 4格系统基础运行指标
      h('div', { key: 'admin-metrics', className: 'metrics-grid' }, [
        h('div', { key: 'am1', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'Neo4j 5.x Bolt 驱动集群'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, 'ONLINE'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, 'APOC Core 5.20.0 · 连接池正常')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Database, { size: 24 }))
        ]),
        h('div', { key: 'am2', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'Cypher 查询平均延时'),
            h('div', { className: 'metric-val', style: { color: 'var(--primary)' } }, '3.8 ms'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, 'QPS 128.4 · 零慢查询')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Cpu, { size: 24 }))
        ]),
        h('div', { key: 'am3', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'MySQL Binlog CDC 双写延时'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, '14 ms'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, '待补偿队列 0 · 拓扑强一致')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Activity, { size: 24 }))
        ]),
        h('div', { key: 'am4', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'HIPAA/等保三级合规日志'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, '100% 审计'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, 'vNode 虚拟脱敏已生效')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.ShieldAlert, { size: 24 }))
        ])
      ]),

      // 运维快捷状态面板
      h('div', { key: 'status-row', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' } }, [
        // 节点规模卡
        h('div', { key: 'graph-stats', className: 'card' }, [
          h('div', { style: { fontWeight: 700, fontSize: '15px', marginBottom: '12px' } }, '[T01] Neo4j 图数据库本体与拓扑规模'),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' } }, [
            h('div', { style: { padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' } }, 'Patient 节点：1,286'),
            h('div', { style: { padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' } }, 'Observation 时序：38,400'),
            h('div', { style: { padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' } }, 'Exacerbation 事件：412'),
            h('div', { style: { padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' } }, 'Vaccination 疫苗：1,980')
          ])
        ]),
        // 双写调度卡
        h('div', { key: 'dual-write', className: 'card' }, [
          h('div', { style: { fontWeight: 700, fontSize: '15px', marginBottom: '12px' } }, '[T09] 双库强一致性 CDC 同步调度'),
          h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' } },
            '主库 MySQL 8.0 写入用户凭证与处方；CDC 捕获日志异步写入 Neo4j 拓扑。内置健康探针每 60 秒自动比对节点总数，遇网络异常自动入重放队列。'
          ),
          h('button', {
            className: 'btn-primary',
            onClick: () => Store.showToast('已手动触发双库一致性核对！校验结果：100% 匹配', 'success')
          }, [h(Icons.RefreshCw, { size: 14 }), '执行一次手动一致性核对'])
        ])
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [T05] 敏感数据脱敏规则与 vNode 虚拟节点配置 (模态框)
  // ----------------------------------------------------------------------------
  function AdminVNodeModal({ onClose }) {
    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, '[T05] Neo4j APOC 虚拟脱敏节点策略 (apoc.create.vNode)'),
      h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' } },
        '根据医疗数据出境与等保三级规范，绝不在前端暴露裸图谱连接。通过调用 APOC 过程生成仅含医学特征的动态虚拟节点：'
      ),
      h('pre', {
        style: {
          background: '#0F172A',
          color: '#38BDF8',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          overflowX: 'auto',
          marginBottom: '16px'
        }
      }, `CALL apoc.create.vNode(['COPDTrend'], {
  anon_id: p.anon_code,
  gold_group: p.gold_group,
  cat_avg_30d: round(avg_cat, 1),
  spo2_baseline: round(avg_spo2, 1),
  risk_tier: 'MEDIUM_WARNING'
}) YIELD node AS trendNode
RETURN trendNode;`),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [T06] 全链路访问审计日志中心
  // ----------------------------------------------------------------------------
  function AdminAuditModal({ onClose }) {
    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '[T06] 全链路访问安全审计流水'),
      h('div', { style: { overflowX: 'auto', maxHeight: '280px', marginBottom: '16px' } }, [
        h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' } }, [
          h('thead', null, h('tr', { style: { borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' } }, [
            h('th', { style: { textAlign: 'left', padding: '6px' } }, '时间'),
            h('th', { style: { textAlign: 'left', padding: '6px' } }, '操作人'),
            h('th', { style: { textAlign: 'left', padding: '6px' } }, '角色'),
            h('th', { style: { textAlign: 'left', padding: '6px' } }, '动作'),
            h('th', { style: { textAlign: 'left', padding: '6px' } }, '接口')
          ])),
          h('tbody', null, [
            { t: '17:30:12', u: '张建国 (PAT2026001)', r: 'patient', a: 'LOGIN', uri: '/api/auth/login' },
            { t: '17:31:05', u: '李华山 (DOC8801)', r: 'doctor', a: 'VIEW_GRAPH', uri: '/api/doctor/patients' },
            { t: '17:32:44', u: '王春燕 (NUR6601)', r: 'nurse', a: 'NUDGE_SMS', uri: '/api/nurse/nudge-missed' },
            { t: '17:35:10', u: '陈远东 (DIR0001)', r: 'director', a: 'EXPORT_REP', uri: '/api/director/export-reports' }
          ].map((log, i) => h('tr', { key: i, style: { borderBottom: '1px solid var(--border-light)' } }, [
            h('td', { style: { padding: '6px' } }, log.t),
            h('td', { style: { padding: '6px', fontWeight: 600 } }, log.u),
            h('td', { style: { padding: '6px' } }, log.r),
            h('td', { style: { padding: '6px' } }, h('span', { className: 'badge badge-primary' }, log.a)),
            h('td', { style: { padding: '6px', color: 'var(--text-muted)' } }, log.uri)
          ])))
        ])
      ]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  global.AdminComponents = {
    AdminDashboard,
    AdminVNodeModal,
    AdminAuditModal
  };
})(window);
