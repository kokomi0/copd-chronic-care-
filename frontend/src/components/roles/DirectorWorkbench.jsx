import React from 'react';
import { Icons } from '../Icons';
import { Store } from '../../services/store';
import { DonutChart } from '../Charts';

export function DirectorDashboard() {
  return (
    <div className="director-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <div>
            <div className="metric-label">全院登记在管慢阻肺患者</div>
            <div className="metric-val" style={{ color: 'var(--primary)' }}>1,286 例</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>较年初增长 +34.2%</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Users size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">30天急性加重再入院率</div>
            <div className="metric-val" style={{ color: 'var(--color-safe)' }}>4.8%</div>
            <div style={{ fontSize: '11px', color: 'var(--color-safe)' }}>远优于国家基线 (9.5%)</div>
          </div>
          <div className="metric-icon-wrap"><Icons.ShieldAlert size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">规范临床路径质控达标率</div>
            <div className="metric-val" style={{ color: 'var(--primary)' }}>94.2%</div>
            <div style={{ fontSize: '11px', color: 'var(--primary)' }}>知识图谱辅助质控</div>
          </div>
          <div className="metric-icon-wrap"><Icons.Compass size={24} /></div>
        </div>

        <div className="metric-card">
          <div>
            <div className="metric-label">年均急性加重住院阻断</div>
            <div className="metric-val" style={{ color: 'var(--color-warning)' }}>142 次</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>节省医保支出约 180 万</div>
          </div>
          <div className="metric-icon-wrap"><Icons.BarChart2 size={24} /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>[M04] 全院 GOLD 2024 人群分组分布</div>
          <DonutChart
            data={[
              { value: 280, name: 'A组 (轻症少加重)' },
              { value: 620, name: 'B组 (重症状少加重)' },
              { value: 386, name: 'E组 (频繁加重高危)' }
            ]}
            style={{ width: '100%', height: '260px' }}
          />
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>[M03] 医护团队随访达标率与负荷榜</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {[
              { name: '李华山 (主任医师)', count: '280人', rate: '98.5%' },
              { name: '王春燕 (主管护师)', count: '320人', rate: '97.8%' },
              { name: '张文远 (主治医师)', count: '210人', rate: '95.2%' },
              { name: '赵美华 (主管护师)', count: '240人', rate: '94.6%' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: '8px' }}
              >
                <span style={{ fontWeight: 600 }}>{idx + 1}. {item.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>管辖 {item.count}</span>
                <span className="badge badge-safe">达标率 {item.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DirectorExportModal({ onClose }) {
  return (
    <div className="modal-body">
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>全院慢病质控与科研数据集导出</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {[
          { name: '全院慢阻肺全周期质控国家慢病平台达标报表.xlsx', size: '2.4 MB' },
          { name: '三亚市PCCM数字慢病专科医防融合运营分析白皮书.pdf', size: '5.8 MB' },
          { name: 'GOLD_E组科研队列多中心时序脱敏数据集.json', size: '1.2 MB' }
        ].map((file, idx) => (
          <div
            key={idx}
            className="card"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px' }}>{file.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>大小：{file.size} · 格式合规</div>
            </div>
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={() => Store.showToast(`已开始下载报表：${file.name}`, 'success')}
            >
              <Icons.Download size={14} /> 下载
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-outline" onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}
