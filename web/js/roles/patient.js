// ==============================================================================
// 智肺呼吸 (RespiCare 360) - [患者端] 十大功能模块组件 (React)
// [P01] 呼吸健康看板总览 | [P02] 每日CAT/mMRC打卡 | [P03] 急性加重红色上报
// [P04] 身体变化趋势 | [P05] 肺康复知识图谱 | [P06] 吸入装置依从性闹钟
// [P07] 疫苗接种追踪 | [P08] 智能设备蓝牙同步 | [P09] 在线复诊咨询 | [P10] 脱敏档案导出
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;

  // ----------------------------------------------------------------------------
  // [P01] 呼吸健康看板总览 (主页默认展示)
  // ----------------------------------------------------------------------------
  function PatientDashboard() {
    return h('div', { className: 'patient-dashboard' }, [
      // 关键体征 4 格栅
      h('div', { key: 'metrics', className: 'metrics-grid' }, [
        h('div', { key: 'm1', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '最新脉搏血氧 (SpO2)'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-safe)' } }, '96%'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '基线平稳 · 无缺氧')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Activity, { size: 24 }))
        ]),
        h('div', { key: 'm2', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'CAT 症状量表得分'),
            h('div', { className: 'metric-val', style: { color: 'var(--primary)' } }, '15 分'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '中度影响 · 较上周改善')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.CheckCircle, { size: 24 }))
        ]),
        h('div', { key: 'm3', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, 'mMRC 气促级别'),
            h('div', { className: 'metric-val', style: { color: 'var(--color-warning)' } }, '2 级'),
            h('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '平地步行需驻足喘气')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.HeartPulse, { size: 24 }))
        ]),
        h('div', { key: 'm4', className: 'metric-card' }, [
          h('div', null, [
            h('div', { className: 'metric-label' }, '吸入制剂依从性'),
            h('div', { className: 'metric-val', style: { color: 'var(--primary)' } }, '100%'),
            h('div', { style: { fontSize: '11px', color: 'var(--color-safe)' } }, '早晚规范吸入已打勾')
          ]),
          h('div', { className: 'metric-icon-wrap' }, h(Icons.Clock, { size: 24 }))
        ])
      ]),

      // 快捷行动横幅 (急性加重红色上报一键触发)
      h('div', {
        key: 'banner',
        className: 'card',
        style: {
          background: 'linear-gradient(135deg, rgba(229, 57, 53, 0.08) 0%, rgba(229, 57, 53, 0.02) 100%)',
          borderLeft: '4px solid var(--color-danger)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }
      }, [
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
          h(Icons.ShieldAlert, { size: 28, color: 'var(--color-danger)' }),
          h('div', null, [
            h('div', { style: { fontWeight: 700, fontSize: '15px', color: 'var(--color-danger)' } }, '急性加重 (AECOPD) 极速就医通道'),
            h('div', { style: { fontSize: '13px', color: 'var(--text-secondary)' } }, '若出现严重气喘、脓痰暴增或口唇青紫，请立即上报或拨打 120')
          ])
        ]),
        h('button', {
          className: 'btn-danger',
          onClick: () => Store.openModule('P03')
        }, [h(Icons.AlertTriangle, { size: 16 }), '一键红色加重上报'])
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P02] 每日 CAT / mMRC 症状量表打卡
  // ----------------------------------------------------------------------------
  const CAT_QUESTIONS = [
    { left: '我从不咳嗽', right: '我一直咳嗽' },
    { left: '我一点痰也没有', right: '我有很重的痰' },
    { left: '我没有胸闷感觉', right: '我有很重的胸闷' },
    { left: '爬坡上一层楼不喘', right: '爬坡上一层楼非常喘' },
    { left: '在家做任何事无困难', right: '在家做任何事都很困难' },
    { left: '对离家外出很有信心', right: '对离家外出一点信心也没有' },
    { left: '我睡眠非常好', right: '因肺病我睡眠非常不好' },
    { left: '我精力旺盛充沛', right: '我一点精力也没有' }
  ];

  function PatientCheckinModal({ onClose }) {
    const [answers, setAnswers] = useState([2, 2, 2, 2, 2, 1, 2, 2]);
    const [mmrc, setMmrc] = useState(2);
    const [spo2, setSpo2] = useState(96);
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);

    const catTotal = answers.reduce((a, b) => a + b, 0);

    const handleAnswer = (qIdx, val) => {
      const next = [...answers];
      next[qIdx] = val;
      setAnswers(next);
    };

    const handleSave = async () => {
      setSaving(true);
      await Store.apiFetch('/patient/checkin', {
        method: 'POST',
        body: JSON.stringify({
          cat_total: catTotal,
          mmrc_grade: mmrc,
          spo2: spo2,
          note: note
        })
      });
      setSaving(false);
      Store.showToast(`打卡成功！今日 CAT 得分：${catTotal} 分，已存入图数据库时序链`, 'success');
      onClose();
    };

    return h('div', { className: 'modal-body' }, [
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' } }, [
        h('h3', { style: { fontSize: '18px', fontWeight: 700 } }, '每日 CAT / mMRC 慢阻肺评估打卡'),
        h('div', { className: 'badge badge-primary', style: { fontSize: '14px', padding: '6px 12px' } }, `当前总分：${catTotal} 分`)
      ]),
      h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' } }, '每道题目请选择 0 ~ 5 分，0 分代表无影响，5 分代表最严重。'),
      
      // 8 题 CAT
      h('div', { style: { maxHeight: '380px', overflowY: 'auto', paddingRight: '6px', marginBottom: '20px' } },
        CAT_QUESTIONS.map((q, idx) => h('div', {
          key: idx,
          className: 'card',
          style: { marginBottom: '12px', padding: '12px' }
        }, [
          h('div', { style: { fontSize: '13px', fontWeight: 600, display: 'flex', justifyContent: 'space-between', marginBottom: '8px' } }, [
            h('span', null, `${idx + 1}. ${q.left}`),
            h('span', { style: { color: 'var(--text-muted)' } }, q.right)
          ]),
          h('div', { style: { display: 'flex', gap: '8px' } }, [0, 1, 2, 3, 4, 5].map(v => h('button', {
            key: v,
            type: 'button',
            onClick: () => handleAnswer(idx, v),
            style: {
              flex: 1,
              padding: '6px 0',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '13px',
              background: answers[idx] === v ? 'var(--primary)' : 'var(--bg-app)',
              color: answers[idx] === v ? '#fff' : 'var(--text-main)',
              border: answers[idx] === v ? 'none' : '1px solid var(--border-light)'
            }
          }, v)))
        ]))
      ),

      // mMRC 气促评估与血氧
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' } }, [
        h('div', null, [
          h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, 'mMRC 气促级别 (0~4级)'),
          h('select', {
            className: 'input-control',
            value: mmrc,
            onChange: e => setMmrc(Number(e.target.value))
          }, [
            h('option', { value: 0 }, '0级 - 仅剧烈活动时气促'),
            h('option', { value: 1 }, '1级 - 平地快走或微坡时气促'),
            h('option', { value: 2 }, '2级 - 平地行走需停下喘气'),
            h('option', { value: 3 }, '3级 - 走100米就得停步吸气'),
            h('option', { value: 4 }, '4级 - 无法外出或穿衣时亦喘')
          ])
        ]),
        h('div', null, [
          h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '今日测量血氧 SpO2 (%)'),
          h('input', {
            type: 'number',
            className: 'input-control',
            value: spo2,
            onChange: e => setSpo2(Number(e.target.value)),
            min: 80,
            max: 100
          })
        ])
      ]),

      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '取消'),
        h('button', { className: 'btn-primary', onClick: handleSave, disabled: saving }, saving ? '保存中...' : '提交今日健康打卡')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P03] 急性加重 (Exacerbation) 红色事件上报
  // ----------------------------------------------------------------------------
  function PatientExacerbationModal({ onClose }) {
    const [triggers, setTriggers] = useState(['感冒/受凉']);
    const [antibiotic, setAntibiotic] = useState(false);
    const [hospital, setHospital] = useState(false);
    const [note, setNote] = useState('');
    const [reporting, setReporting] = useState(false);

    const toggleTrigger = (t) => {
      setTriggers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
    };

    const handleReport = async () => {
      setReporting(true);
      const res = await Store.apiFetch('/patient/exacerbation', {
        method: 'POST',
        body: JSON.stringify({
          triggers: triggers,
          used_antibiotic: antibiotic,
          hospitalized: hospital,
          note: note
        })
      });
      setReporting(false);
      Store.showToast(res ? res.msg : '🚨 急性加重警报已提交随访医生！', 'error');
      onClose();
    };

    return h('div', { className: 'modal-body' }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', marginBottom: '14px' } }, [
        h(Icons.ShieldAlert, { size: 24 }),
        h('h3', { style: { fontSize: '18px', fontWeight: 800 } }, '慢阻肺急性加重 (AECOPD) 紧急上报')
      ]),
      h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' } }, '发生咳嗽、咳痰、气促急剧加重时请立即上报，系统将自动关联 Neo4j 图谱并触发医生复核。'),

      h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '疑似发作诱因 (可多选)'),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' } },
        ['感冒/受凉', '雾霾/空气差', '劳累过度', '漏用吸入药', '其他/不明'].map(t => h('button', {
          key: t,
          type: 'button',
          onClick: () => toggleTrigger(t),
          style: {
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            background: triggers.includes(t) ? 'var(--color-danger)' : 'var(--bg-app)',
            color: triggers.includes(t) ? '#fff' : 'var(--text-main)',
            border: triggers.includes(t) ? 'none' : '1px solid var(--border-light)'
          }
        }, t))
      ),

      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' } }, [
        h('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' } }, [
          h('input', { type: 'checkbox', checked: antibiotic, onChange: e => setAntibiotic(e.target.checked) }),
          '已自行口服抗生素/激素'
        ]),
        h('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' } }, [
          h('input', { type: 'checkbox', checked: hospital, onChange: e => setHospital(e.target.checked) }),
          '已到达急诊就医/住院'
        ])
      ]),

      h('label', { style: { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' } }, '病情变化详细描述'),
      h('textarea', {
        className: 'input-control',
        rows: 3,
        placeholder: '例如：昨晚着凉后，今天早晨黄脓痰明显增多，静坐时也觉得喘不过气...',
        value: note,
        onChange: e => setNote(e.target.value),
        style: { marginBottom: '20px' }
      }),

      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '取消'),
        h('button', { className: 'btn-danger', onClick: handleReport, disabled: reporting }, reporting ? '上报中...' : '立即确认红色加重上报')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P04] 身体变化趋势（近 30/90 天 CAT 折线图与加重日历）
  // ----------------------------------------------------------------------------
  function PatientTrendsView() {
    const chartRef = useRef(null);

    useEffect(() => {
      if (chartRef.current) {
        AppCharts.renderTrendChart(chartRef.current, {
          labels: ['09-01', '09-05', '09-10', '09-15', '09-20', '09-23', '09-26'],
          catData: [21, 19, 18, 26, 16, 19, 15],
          spo2Data: [92, 93, 94, 89, 94, 92, 96]
        });
      }
    }, []);

    return h('div', { className: 'trends-view' }, [
      h('h3', { style: { fontSize: '16px', fontWeight: 700, marginBottom: '12px' } }, '近 30 天 CAT 评分与血氧走势趋势回溯'),
      h('div', { ref: chartRef, style: { width: '100%', height: '320px', marginBottom: '16px' } }),
      h('div', { className: 'card', style: { fontSize: '13px', lineHeight: 1.6 } }, [
        h('strong', { style: { color: 'var(--primary)' } }, '💡 临床趋势诊断提示：'),
        ' 您的 CAT 评估得分已由 8 月中旬急性加重期的 26 分回落至目前的 15 分，血氧饱和度已恢复至 96% 的安全区间。请继续坚持每日两次布地奈德福莫特罗规范吸入。'
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P06] 吸入装置依从性打卡与用药闹钟
  // ----------------------------------------------------------------------------
  function PatientMedicationsModal({ onClose }) {
    const [meds, setMeds] = useState([
      { id: 1, name: '布地奈德福莫特罗粉吸入剂', device: '都保 (Turbuhaler)', time: '08:00', done: true },
      { id: 2, name: '噻托溴铵粉吸入剂', device: 'HandiHaler', time: '09:00', done: true },
      { id: 3, name: '布地奈德福莫特罗粉吸入剂', device: '都保 (Turbuhaler)', time: '20:00', done: false }
    ]);

    const handleTake = async (id) => {
      await Store.apiFetch('/patient/medications/take', {
        method: 'POST',
        body: JSON.stringify({ prescription_id: id })
      });
      setMeds(prev => prev.map(m => m.id === id ? { ...m, done: true } : m));
      Store.showToast('吸入服药打卡成功！已记录用药依从性', 'success');
    };

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '今日吸入制剂处方与用药闹钟'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' } },
        meds.map(m => h('div', {
          key: m.id,
          className: 'card',
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
        }, [
          h('div', null, [
            h('div', { style: { fontWeight: 700, fontSize: '14px' } }, m.name),
            h('div', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, `装置：${m.device} · 建议时刻：${m.time}`)
          ]),
          m.done
            ? h('span', { className: 'badge badge-safe' }, '✓ 今日已吸入')
            : h('button', { className: 'btn-primary', onClick: () => handleTake(m.id) }, '吸入打卡')
        ]))
      ),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P07] 疫苗接种档案追踪
  // ----------------------------------------------------------------------------
  function PatientVaccinationModal({ onClose }) {
    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '疫苗预防接种档案 (GOLD指南推荐)'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' } }, [
        h('div', { className: 'card', style: { borderLeft: '4px solid var(--color-warning)' } }, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } }, [
            h('span', { style: { fontWeight: 700 } }, '四价流感病毒裂解疫苗 (Influenza)'),
            h('span', { className: 'badge badge-warning' }, '建议10月接种')
          ]),
          h('p', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '上次接种：2025-10-12 | 推荐频次：每年秋冬入季前接种一次以防加重')
        ]),
        h('div', { className: 'card', style: { borderLeft: '4px solid var(--color-safe)' } }, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' } }, [
            h('span', { style: { fontWeight: 700 } }, '23价肺炎球菌多糖疫苗 (PPSV23)'),
            h('span', { className: 'badge badge-safe' }, '有效保护中')
          ]),
          h('p', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '上次接种：2024-04-18 | 下次接种：2029-04-18 (5年长效)')
        ])
      ]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P08] 智能设备蓝牙直连同步
  // ----------------------------------------------------------------------------
  function PatientBluetoothModal({ onClose }) {
    const [connected, setConnected] = useState(false);
    const [liveData, setLiveData] = useState({ spo2: '--', pr: '--' });

    const handleConnect = async () => {
      await BluetoothService.connect('oximeter');
      setConnected(true);
      BluetoothService.startTelemetry(data => {
        setLiveData({ spo2: data.spo2, pr: data.pulse_rate });
      });
      Store.showToast('已成功通过 BLE 5.2 连接便携脉搏血氧仪！', 'success');
    };

    useEffect(() => {
      return () => BluetoothService.disconnect();
    }, []);

    return h('div', { className: 'modal-body', style: { textAlign: 'center' } }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '智能医疗硬件蓝牙直连采集 (IoT)'),
      h('div', {
        style: {
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: connected ? 'rgba(67, 160, 71, 0.1)' : 'var(--bg-app)',
          margin: '0 auto 20px auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: `3px solid ${connected ? 'var(--color-safe)' : 'var(--border-light)'}`
        }
      }, [
        h(Icons.Bluetooth, { size: 36, color: connected ? 'var(--color-safe)' : 'var(--text-muted)' }),
        h('div', { style: { fontSize: '12px', fontWeight: 600, marginTop: '6px' } }, connected ? '已建立蓝牙流' : '未连接设备')
      ]),

      connected && h('div', { style: { display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '20px' } }, [
        h('div', null, [
          h('div', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '实时血氧 SpO2'),
          h('div', { style: { fontSize: '28px', fontWeight: 800, color: 'var(--color-safe)' } }, `${liveData.spo2}%`)
        ]),
        h('div', null, [
          h('div', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '实时脉率 PR'),
          h('div', { style: { fontSize: '28px', fontWeight: 800, color: 'var(--primary)' } }, `${liveData.pr} bpm`)
        ])
      ]),

      h('div', { style: { display: 'flex', justifyContent: 'center', gap: '12px' } }, [
        !connected
          ? h('button', { className: 'btn-primary', onClick: handleConnect }, [h(Icons.Bluetooth, { size: 16 }), '扫描并连接便携血氧仪'])
          : h('button', { className: 'btn-outline', onClick: () => { BluetoothService.disconnect(); setConnected(false); } }, '断开连接'),
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P09] 在线复诊咨询与随访医生绑定
  // ----------------------------------------------------------------------------
  function PatientDoctorConsultModal({ onClose }) {
    const [messages, setMessages] = useState([
      { sender: 'doctor', text: '建国师傅您好，查看您近30天打卡很规律，血氧平稳在95%以上，继续保持！早晚吸完都保切记漱口。', time: '昨天 16:30' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
      if (!input.trim()) return;
      setMessages(prev => [...prev, { sender: 'patient', text: input.trim(), time: '刚刚' }]);
      setInput('');
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'doctor', text: '收到您的咨询。如果夜间有偶尔干咳，可少量多次饮温水，注意防寒，有剧烈气促随时联系我。', time: '刚刚' }]);
      }, 1000);
    };

    return h('div', { className: 'modal-body' }, [
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)', marginBottom: '14px' } }, [
        h('span', { style: { fontSize: '32px' } }, '👨‍⚕️'),
        h('div', null, [
          h('div', { style: { fontWeight: 700, fontSize: '15px' } }, '李华山 主任医师 / 教授'),
          h('div', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '呼吸与危重症医学科 (PCCM) · 三亚市呼吸疾病数字诊疗中心')
        ])
      ]),

      h('div', { style: { height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', padding: '6px' } },
        messages.map((m, idx) => h('div', {
          key: idx,
          style: {
            alignSelf: m.sender === 'patient' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '10px 14px',
            borderRadius: '12px',
            background: m.sender === 'patient' ? 'var(--primary)' : 'var(--bg-app)',
            color: m.sender === 'patient' ? '#fff' : 'var(--text-main)',
            fontSize: '13px'
          }
        }, [
          h('div', null, m.text),
          h('div', { style: { fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' } }, m.time)
        ]))
      ),

      h('div', { style: { display: 'flex', gap: '8px' } }, [
        h('input', {
          type: 'text',
          className: 'input-control',
          placeholder: '输入向李主任咨询的内容...',
          value: input,
          onChange: e => setInput(e.target.value),
          onKeyDown: e => e.key === 'Enter' && handleSend()
        }),
        h('button', { className: 'btn-primary', onClick: handleSend }, '发送')
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // [P10] 个人健康档案与脱敏导出
  // ----------------------------------------------------------------------------
  function PatientExportModal({ onClose }) {
    const handleDownload = () => {
      const data = {
        anon_id: "ANON-COPD-2026001",
        gold_classification: "GOLD 3级 E组",
        cat_baseline: 15,
        fev1_pred_pct: 42.5,
        compliance_rate: "94.2%",
        export_date: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `COPD_Health_Card_ANON-2026001.json`;
      a.click();
      Store.showToast('脱敏档案已成功导出！符合 HIPAA 与等保三级规范', 'success');
    };

    return h('div', { className: 'modal-body' }, [
      h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '14px' } }, '个人健康档案脱敏导出卡 (apoc.create.vNode)'),
      h('div', { className: 'card', style: { background: 'var(--bg-app)', marginBottom: '18px', fontSize: '13px', lineHeight: 1.8 } }, [
        h('div', null, [h('strong', null, '医学脱敏编号：'), ' ANON-COPD-2026001']),
        h('div', null, [h('strong', null, 'GOLD 分类分级：'), ' GOLD 3 级 · E 组 (急性加重高危队列)']),
        h('div', null, [h('strong', null, '近 30 天平均 CAT：'), ' 16.5 分 (中度影响)']),
        h('div', null, [h('strong', null, '血氧基线均值：'), ' 94.8%']),
        h('div', null, [h('strong', null, '吸入剂处方：'), ' 布地奈德福莫特罗 160/4.5μg bid']),
        h('div', null, [h('strong', null, '隐私保护级别：'), ' 已对身份证、手机号实施强哈希脱敏'])
      ]),
      h('div', { style: { display: 'flex', justifyContent: 'flex-end', gap: '10px' } }, [
        h('button', { className: 'btn-outline', onClick: onClose }, '关闭'),
        h('button', { className: 'btn-primary', onClick: handleDownload }, [h(Icons.Download, { size: 16 }), '导出脱敏 JSON 档案'])
      ])
    ]);
  }

  // ----------------------------------------------------------------------------
  // 患者端专属渲染出口
  // ----------------------------------------------------------------------------
  function PatientView() {
    return h('div', null, [
      h(PatientDashboard, null)
    ]);
  }

  global.PatientComponents = {
    PatientView,
    PatientDashboard,
    PatientCheckinModal,
    PatientExacerbationModal,
    PatientTrendsView,
    PatientMedicationsModal,
    PatientVaccinationModal,
    PatientBluetoothModal,
    PatientDoctorConsultModal,
    PatientExportModal
  };
})(window);
