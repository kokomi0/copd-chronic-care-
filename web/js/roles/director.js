// ==============================================================================
// 智肺呼吸 (RespiCare 360) - [院长端] 九大管理驾驶舱模块组件 (React)
// [M01] 全院慢病大屏 | [M02] 加重再入院指标 | [M03] 医护负荷排行
// [M04] GOLD A/B/E演变 | [M05] 临床路径质控 | [M06] 吸入宏观依从
// [M07] 疫苗覆盖大盘 | [M08] 安全合规拦截 | [M09] 多维报表导出
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;

  function DirectorDashboard() {
    const pieRef = useRef(null);

    useEffect(() => {
      if (pieRef.current) {
        AppCharts.renderDonutChart(pieRef.current, [
          { value: 280, name: 'A组 (轻症少加重)' },
          { value: 620, name: 'B组 (重症状少加重)' },
          { value: 386, name: 'E组 (频繁加重高危)' }
        ]);
      }
    }, []);

    return h('div', { className: 'director-dashboard' }, [
      // 4格全院管理 KPI
      h('div', { key: 'dir-metrics', className: 'metrics-grid' }, [
        h('div', { key: 'dm1', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '全院登记在管慢阻肺患者'),
            h('div', { className: 'metric-val', style: { color: 'var(--primary)' } }, '1,286 例'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, '较年初增长 +34.2%')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Users, { size: 24 }))
        ]),
        h('div', { key: 'dm2', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '30天急性加重再入院率'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, '4.8%'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, '远优于国家基线 (9.5%)')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.ShieldAlert, { size: 24 }))
        ]),
        h('div', { key: 'dm3', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '规范临床路径质控达标率'),
            h('div', { className: 'metric-val', style: { color: 'var(--primary)' } }, '94.2%'),
            h('div', { style: { fontSize: '11px', color: 'var(--primary)' } }, '知识图谱辅助质控')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Compass, { size: 24 }))
        ]),
        h('div', { key: 'dm4', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '年均急性加重住院阻断'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-warning)' } }, '142 次'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '节省医保支出约 180 万')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.BarChart2, { size: 24 }))
        ])
      ]),

      // 宏观分析图表区 (GOLD 演变与负荷排行)
      h('div', { key: 'charts-row', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' } }, [
        // 环形图
        h('div', { key: 'chart-col', className: 'card' }, [
          h('div', { style: { fontWeight: 700, fontSize: '15px', marginBottom: '12px' } }, '[M04] 全院 GOLD 2024 人群分组分布'),
          h('div', { ref: pieRef, style: { width: '100%', height: '260px' } })
        ]),
        // 医护排行
        h('div', { key: 'rank-col', className: 'card' }, [
          h('div', { style: { fontWeight: 700, fontSize: '15px', marginBottom: '12px' } }, '[M03] 医护团队随访达标率与负荷榜'),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' } }, [
            { name: '李华山 (主任医师)', count: '280人', rate: '98.5%', score: '99.2' },
            { name: '王春燕 (主管护师)', count: '320人', rate: '97.8%', score: '98.4' },
            { name: '张文远 (主治医师)', count: '210人', rate: '95.2%', score: '96.0' },
            { name: '赵美华 (主管护师)', count: '240人', rate: '94.6%', score: '95.1' }
          ].map((item, idx) => h('div', {
            key: idx,
            style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-app)', borderRadius: '8px' }
          }, [
            h('span', { style: { fontWeight: 600 } }, `${idx + 1}. ${item.name}`),
            h('span', { style: { color: 'var(--text-secondary)' } }, `管辖 ${item.count}`),
            h('span', { className: 'badge badge-safe' }, `达标率 ${item.rate}`)
          ])))
        ])
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [M09] 经营与科研报表多维导出 (模态框)
  // ----------------------------------------------------------------------------
  function DirectorExportModal({ onClose }) {
    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '全院慢病质控与科研数据集导出'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' } }, [
        { name: '全院慢阻肺全周期质控国家慢病平台达标报表.xlsx', size: '2.4 MB' },
        { name: '三亚市PCCM数字慢病专科医防融合运营分析白皮书.pdf', size: '5.8 MB' },
        { name: 'GOLD_E组科研队列多中心时序脱敏数据集.json', size: '1.2 MB' }
      ].map((file, idx) => h('div', {
        key: idx,
        className: 'card',
        style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
      }, [
        h('div', null, [
          h('div', { style: { fontWeight: 600, fontSize: '13px' } }, file.name),
          h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, `大小：${file.size} · 格式合规`)
        ]),
        h('button', {
          className: 'btn-primary',
          style: { padding: '6px 12px', fontSize: '12px' },
          onClick: () => Store.showToast(`已开始下载报表：${file.name}`, 'success')
        }, [h(Icons.Download, { size: 14 }), '下载'])
      ]))),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  global.DirectorComponents = {
    DirectorDashboard,
    DirectorExportModal
  };
})(window);
