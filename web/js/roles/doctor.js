// ==============================================================================
// 智肺呼吸 (RespiCare 360) - [医生端] 九大临床模块组件 (React)
// [D01] 患者图谱工作台 | [D02] GOLD E组高危预警雷达 | [D03] 患者时序回溯
// [D04] 急性加重临床复核 | [D05] 吸入剂阶梯调整 | [D06] 临床知识图谱检索
// [D07] 在线图文问诊 | [D08] 疫苗指导签发 | [D09] 科研队列脱敏统计
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;

  function DoctorDashboard() {
    return h('div', { className: 'doctor-dashboard' }, [
      // 医生端 4 关键指标
      h('div', { key: 'doc-metrics', className: 'metrics-grid' }, [
        h('div', { key: 'dm1', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '在管慢阻肺患者'),
            h('div', { className: 'metric-val' }, '280 人'),
            h('div', { style: { fontSize: '11px', color: 'var(--primary)' } }, 'GOLD E组占比 30.0%')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Users, { size: 24 }))
        ]),
        h('div', { key: 'dm2', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '高危急性加重预警'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-danger)' } }, '2 例待处置'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-danger)' } }, '血氧<90% 伴气促骤升')
          ]),
          h('div', { className: 'metric-icon-wrap', style: { background: 'var(--color-danger-bg)', color: 'var(--color-danger)' } }, h(Icons.ShieldAlert, { size: 24 }))
        ]),
        h('div', { key: 'dm3', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '吸入制剂依从达标率'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, '93.4%'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, '高于全国平均 (68%)')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Clock, { size: 24 }))
        ]),
        h('div', { key: 'dm4', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '待回复线上问诊'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-warning)' } }, '1 条未读'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '平均响应时效 8 分钟')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.MessageSquare, { size: 24 }))
        ])
      ]),

      // 重点监管列表
      h('div', { key: 'patient-table', className: 'card', style: { marginBottom: '20px' } }, [
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } }, [
          h('h4', { style: { fontSize: '15px', fontWeight: 700 } }, 'PCCM 在管重点随访患者全景列表'),
          h('button', { className: 'btn-outline', onClick: () => Store.openModule('D02') }, [h(Icons.AlertTriangle, { size: 14 }), '打开 GOLD E 组预警雷达'])
        ]),
        h('div', { style: { overflowX: 'auto' } }, [
          h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' } }, [
            h('thead', null, h('tr', { style: { borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' } }, [
              h('th', { style: { textAlign: 'left', padding: '10px' } }, '患者编号 / 姓名'),
              h('th', { style: { textAlign: 'left', padding: '10px' } }, 'GOLD 分组'),
              h('th', { style: { textAlign: 'left', padding: '10px' } }, '最新 CAT'),
              h('th', { style: { textAlign: 'left', padding: '10px' } }, 'SpO2'),
              h('th', { style: { textAlign: 'left', padding: '10px' } }, '年加重次数'),
              h('th', { style: { textAlign: 'left', padding: '10px' } }, '依从率'),
              h('th', { style: { textAlign: 'right', padding: '10px' } }, '临床处置')
            ])),
            h('tbody', null, [
              h('tr', { key: 'p1', style: { borderBottom: '1px solid var(--border-light)' } }, [
                h('td', { style: { padding: '10px', fontWeight: 600 } }, 'ANON-COPD-2026001 (张建国)'),
                h('td', { style: { padding: '10px' } }, h('span', { className: 'badge badge-danger' }, 'GOLD 3级 E组')),
                h('td', { style: { padding: '10px', fontWeight: 700 } }, '15 分'),
                h('td', { style: { padding: '10px', color: 'var(--color-safe)', fontWeight: 700 } }, '96%'),
                h('td', { style: { padding: '10px' } }, '1 次'),
                h('td', { style: { padding: '10px', color: 'var(--color-safe)' } }, '93.4%'),
                h('td', { style: { padding: '10px', textAlign: 'right' } }, [
                  h('button', { className: 'btn-outline', style: { padding: '4px 8px', fontSize: '11px', marginRight: '6px' }, onClick: () => Store.openModule('D01') }, '调阅图谱'),
                  h('button', { className: 'btn-primary', style: { padding: '4px 8px', fontSize: '11px' }, onClick: () => Store.openModule('D04') }, '复核处置')
                ])
              ]),
              h('tr', { key: 'p2', style: { borderBottom: '1px solid var(--border-light)' } }, [
                h('td', { style: { padding: '10px', fontWeight: 600 } }, 'ANON-COPD-2026003 (刘福荣)'),
                h('td', { style: { padding: '10px' } }, h('span', { className: 'badge badge-danger' }, 'GOLD 4级 E组')),
                h('td', { style: { padding: '10px', color: 'var(--color-danger)', fontWeight: 700 } }, '24 分'),
                h('td', { style: { padding: '10px', color: 'var(--color-danger)', fontWeight: 700 } }, '91% (低氧)'),
                h('td', { style: { padding: '10px', color: 'var(--color-danger)', fontWeight: 700 } }, '3 次 (频发)'),
                h('td', { style: { padding: '10px', color: 'var(--color-warning)' } }, '72.5%'),
                h('td', { style: { padding: '10px', textAlign: 'right' } }, [
                  h('button', { className: 'btn-danger', style: { padding: '4px 8px', fontSize: '11px' }, onClick: () => Store.openModule('D04') }, '急救干预')
                ])
              ])
            ])
          ])
        ])
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D02] GOLD E 组高危急性加重预警雷达 (模态框)
  // ----------------------------------------------------------------------------
  function DoctorRadarModal({ onClose }) {
    const radarRef = useRef(null);

    useEffect(() => {
      if (radarRef.current) {
        AppCharts.renderRadarChart(radarRef.current, [
          { name: '近1年加重次数', max: 4 },
          { name: 'CAT波动幅度', max: 40 },
          { name: 'mMRC气促级别', max: 4 },
          { name: '血氧去饱和频次', max: 10 },
          { name: '吸入依从性低', max: 100 },
          { name: '合并症肺心病风险', max: 100 }
        ], [3, 24, 3, 7, 28, 65]);
      }
    }, []);

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '8px' } }, 'GOLD 2024 E组高危急性加重特征雷达'),
      h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' } }, '系统针对刘福荣 (PAT2026003) 综合计算得出的多维临床加重风险投影：'),
      h('div', { ref: radarRef, style: { width: '100%', height: '320px', marginBottom: '16px' } }),
      h('div', { className: 'card', style: { background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger)', fontSize: '13px' } }, [
        h('strong', { style: { color: 'var(--color-danger)' } }, '🚨 临床路径处置建议：'),
        ' 该患者夜间血氧多次低于 90%，近 1 年急性加重 3 次，符合 GOLD 极重度频发特征。建议升级为三联制剂强化，签署长期家庭氧疗建议，并启动呼吸康复远程监护。'
      ]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D04] 急性加重临床复核与干预处置
  // ----------------------------------------------------------------------------
  function DoctorReviewModal({ onClose }) {
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

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, '急性加重 (AECOPD) 临床复核与医嘱下达'),
      h('div', { className: 'card', style: { background: 'var(--bg-app)', marginBottom: '16px', fontSize: '13px', lineHeight: 1.6 } }, [
        h('div', null, [h('strong', null, '上报患者：'), ' 张建国 (ANON-COPD-2026001)']),
        h('div', null, [h('strong', null, '上报主诉：'), ' 受凉后咳嗽痰量明显增多，伴活动后气喘加剧']),
        h('div', null, [h('strong', null, '上报时体征：'), ' CAT 19分，SpO2 92%，既往加重史1次'])
      ]),
      h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '医师干预方案与指导医嘱'),
      h('textarea', {
        className: 'input-control',
        rows: 3,
        value: advice,
        onChange: e => setAdvice(e.target.value),
        style: { marginBottom: '16px' }
      }),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '取消'),
        h('button', { className: 'btn-primary', onClick: handleConfirm, disabled: submitting }, submitting ? '下达中...' : '审核通过并下达干预方案')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D05] 吸入剂用药依从性评估与方案调整
  // ----------------------------------------------------------------------------
  function DoctorAdjustMedModal({ onClose }) {
    const [regimen, setRegimen] = useState('升级为三联制剂：氟替美维吸入粉雾剂 (ICS+LAMA+LABA) 每日1次');
    const handleAdjust = async () => {
      await Store.apiFetch('/doctor/adjust-medication', {
        method: 'POST',
        body: JSON.stringify({ new_regimen: regimen })
      });
      Store.showToast('处方阶梯方案调整成功！已同步至 MySQL 与患者用药提醒卡', 'success');
      onClose();
    };

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '吸入制剂用药方案阶梯调整'),
      h('div', { className: 'card', style: { marginBottom: '16px', fontSize: '13px' } }, [
        h('div', { style: { fontWeight: 600, marginBottom: '6px' } }, '当前方案：布地奈德福莫特罗 160/4.5μg bid + 噻托溴铵 18μg qd'),
        h('div', { style: { color: 'var(--text-secondary)' } }, '依从性评分：93.4 分 · 装置操作规范')
      ]),
      h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '调整后新处方方案 (GOLD指南阶梯推荐)'),
      h('input', {
        type: 'text',
        className: 'input-control',
        value: regimen,
        onChange: e => setRegimen(e.target.value),
        style: { marginBottom: '18px' }
      }),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '取消'),
        h('button', { className: 'btn-primary', onClick: handleAdjust }, '确认调整下达处方')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D06] 临床知识图谱检索
  // ----------------------------------------------------------------------------
  function DoctorGraphSearchModal({ onClose }) {
    const [keyword, setKeyword] = useState('相互作用');
    const [results, setResults] = useState([]);

    const handleSearch = async () => {
      const res = await Store.apiFetch(`/doctor/graph-search?q=${encodeURIComponent(keyword)}`);
      if (res && res.results) setResults(res.results);
    };

    useEffect(() => { handleSearch(); }, []);

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, 'COPD 临床知识图谱检索推理引擎'),
      h('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } }, [
        h('input', {
          type: 'text',
          className: 'input-control',
          placeholder: '输入症状、药物、配伍禁忌或并发症...',
          value: keyword,
          onChange: e => setKeyword(e.target.value)
        }),
        h('button', { className: 'btn-primary', onClick: handleSearch }, '图谱检索')
      ]),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', marginBottom: '16px' } },
        results.map((r, i) => h('div', { key: i, className: 'card', style: { fontSize: '13px' } }, [
          h('div', { style: { fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' } }, r.title),
          h('div', { style: { color: 'var(--text-secondary)', lineHeight: 1.5 } }, r.evidence)
        ]))
      ),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D08] 疫苗指导建议签发
  // ----------------------------------------------------------------------------
  function DoctorVaccineAdviceModal({ onClose }) {
    const [advice, setAdvice] = useState('建议于2026年10月上旬前完成四价流感疫苗接种，以减少秋冬季呼吸道病毒感染诱发急性加重风险。');
    const handleIssue = async () => {
      await Store.apiFetch('/doctor/issue-vaccine-advice', {
        method: 'POST',
        body: JSON.stringify({ advice })
      });
      Store.showToast('疫苗接种临床建议已签发，已直达患者疫苗提醒卡！', 'success');
      onClose();
    };

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, '签发疫苗预防接种指导意见 (GOLD E组)'),
      h('textarea', {
        className: 'input-control',
        rows: 3,
        value: advice,
        onChange: e => setAdvice(e.target.value),
        style: { marginBottom: '16px' }
      }),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '取消'),
        h('button', { className: 'btn-primary', onClick: handleIssue }, '签发医嘱')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [D09] 科研队列脱敏数据统计
  // ----------------------------------------------------------------------------
  function DoctorResearchModal({ onClose }) {
    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, '慢阻肺科研队列多中心脱敏数据集'),
      h('div', { className: 'card', style: { background: 'var(--bg-app)', marginBottom: '16px', fontSize: '13px', lineHeight: 1.8 } }, [
        h('div', null, [h('strong', null, '入组总病例数：'), ' 128 例 (海南三亚PCCM专科多中心)']),
        h('div', null, [h('strong', null, 'GOLD 分布构成：'), ' A组 24例 (18.7%) | B组 58例 (45.3%) | E组 46例 (36.0%)']),
        h('div', null, [h('strong', null, 'CAT 3个月改善均值：'), ' -4.2 分 (P < 0.01)']),
        h('div', null, [h('strong', null, 'FEV1 年衰退延缓：'), ' 延缓 24 mL/年 (规范吸入依从组)'])
      ]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  global.DoctorComponents = {
    DoctorDashboard,
    DoctorRadarModal,
    DoctorReviewModal,
    DoctorAdjustMedModal,
    DoctorGraphSearchModal,
    DoctorVaccineAdviceModal,
    DoctorResearchModal
  };
})(window);
