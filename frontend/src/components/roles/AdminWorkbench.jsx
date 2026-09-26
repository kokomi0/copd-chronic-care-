import React from 'react';
import { Icons } from '../Icons';
import { Store } from '../../services/store';

export function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">Neo4j 5.x Bolt 驱动集群</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>ONLINE</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>APOC Core 5.20.0 · 连接池正常</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Database size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">Cypher 查询平均延时</div>
            <div className="metric-val" style={{ color: 'var(--primary)' }}>3.8 ms</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>QPS 128.4 · 零慢查询</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Cpu size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">MySQL Binlog CDC 双写延时</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>14 ms</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>待补偿队列 0 · 拓扑强一致</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Activity size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">HIPAA/等保三级合规日志</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>100% 审计</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>vNode 虚拟脱敏已生效</div>
          </div>
          <div className="metric-icon-wrap"><Icons.ShieldAlert size={24} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>[T01] Neo4j 图数据库本体与拓扑规模</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px' }}>
            <div style={{ padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' }}>Patient 节点：1,286</div>
            <div style={{ padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' }}>Observation 时序：38,400</div>
            <div style={{ padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' }}>Exacerbation 事件：412</div>
            <div style={{ padding: '8px', background: 'var(--bg-app)', borderRadius: '6px' }}>Vaccination 疫苗：1,980</div>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>[T09] 双库强一致性 CDC 同步调度</div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            主库 MySQL 8.0 写入用户凭证与处方；CDC 捕获日志异步写入 Neo4j 拓扑。内置健康探针每 60 秒自动比对节点总数，遇网络异常自动入重放队列。
          </p>
          <button
            className="btn-primary"
            onClick={() => Store.showToast('已手动触发双库一致性核对！校验结果：100% 匹配', 'success')}
          >
            <Icons.RefreshCw size={14} /> 执行一次手动一致性核对
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminVNodeModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>[T05] Neo4j APOC 虚拟脱敏节点策略 (apoc.create.vNode)</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        根据医疗数据出境与等保三级规范，绝不在前端暴露裸图谱连接。通过调用 APOC 过程生成仅含医学特征的动态虚拟节点：
      </p>
      <pre
        style={{
          background: '#0F172A',
          color: '#38BDF8',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          overflowX: 'auto',
          marginBottom: '16px'
        }}
      >
{`CALL apoc.create.vNode(['COPDTrend'], {
  anon_id: p.anon_code,
  gold_group: p.gold_group,
  cat_avg_30d: round(avg_cat, 1),
  spo2_baseline: round(avg_spo2, 1),
  risk_tier: 'MEDIUM_WARNING'
}) YIELD node AS trendNode
RETURN trendNode;`}
      </pre>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export function AdminAuditModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>[T06] 全链路访问安全审计流水</h3>
      <div style={{ overflowX: 'auto', maxHeight: '280px', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
              <th style={{ textAlign: 'left', padding: '6px' }}>时间</th>
              <th style={{ textAlign: 'left', padding: '6px' }}>操作人</th>
              <th style={{ textAlign: 'left', padding: '6px' }}>角色</th>
              <th style={{ textAlign: 'left', padding: '6px' }}>动作</th>
              <th style={{ textAlign: 'left', padding: '6px' }}>接口</th>
            </tr>
          </thead>
          <tbody>
            {[
              { t: '17:30:12', u: '张建国 (PAT2026001)', r: 'patient', a: 'LOGIN', uri: '/api/auth/login' },
              { t: '17:31:05', u: '李华山 (DOC8801)', r: 'doctor', a: 'VIEW_GRAPH', uri: '/api/doctor/patients' },
              { t: '17:32:44', u: '王春燕 (NUR6601)', r: 'nurse', a: 'NUDGE_SMS', uri: '/api/nurse/nudge-missed' },
              { t: '17:35:10', u: '陈远东 (DIR0001)', r: 'director', a: 'EXPORT_REP', uri: '/api/director/export-reports' }
            ].map((log, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '6px' }}>{log.t}</td>
                <td style={{ padding: '6px', fontWeight: 600 }}>{log.u}</td>
                <td style={{ padding: '6px' }}>{log.r}</td>
                <td style={{ padding: '6px' }}><span className="badge badge-primary">{log.a}</span></td>
                <td style={{ padding: '6px', color: 'var(--text-muted)' }}>{log.uri}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
