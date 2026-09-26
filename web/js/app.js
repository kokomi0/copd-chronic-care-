// ==============================================================================
// 智肺呼吸 (RespiCare 360) - React 顶层应用路由与自适应视图总控 (App)
// ==============================================================================
(function (global) {
  'use strict';
  const h = React.createElement;
  const { useState, useEffect, useRef } = React;

  function App() {
    const [state, setState] = useState(Store.state);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const graphCanvasRef = useRef(null);
    const [selectedGraphNode, setSelectedGraphNode] = useState(null);

    // 订阅全局状态变更
    useEffect(() => {
      const unsub = Store.subscribe(() => {
        setState({ ...Store.state });
      });
      return unsub;
    }, []);

    // 切换至“知识图谱”Tab时初始化 NVL 拓扑交互引擎
    useEffect(() => {
      if (state.activeTab === 'graph' && graphCanvasRef.current) {
        const viewer = new NVLGraphViewer(graphCanvasRef.current, {
          onNodeClick: (node) => setSelectedGraphNode(node)
        });

        // 获取图数据
        Store.apiFetch('/graph/topology').then(res => {
          if (res && res.nodes) {
            viewer.setData(res.nodes, res.edges);
          } else {
            // 离线备用数据
            viewer.setData([
              { id: 'c1', label: 'Disease', title: '慢性阻塞性肺疾病 (COPD)', category: '疾病' },
              { id: 's1', label: 'Symptom', title: '活动后劳力性气促', category: '核心症状' },
              { id: 's2', label: 'Symptom', title: '慢性咳嗽与脓痰', category: '核心症状' },
              { id: 'm1', label: 'Medication', title: '布地奈德福莫特罗 (ICS+LABA)', category: '吸入维持' },
              { id: 'm2', label: 'Medication', title: '噻托溴铵 (LAMA)', category: '吸入维持' },
              { id: 'm3', label: 'Medication', title: '氟替美维 (ICS+LAMA+LABA三联)', category: 'E组强化' },
              { id: 'r1', label: 'Rehabilitation', title: '缩唇腹式呼吸操 (Daily)', category: '肺康复' },
              { id: 'v1', label: 'Vaccination', title: '四价流感疫苗 (Annual)', category: '预防疫苗' },
              { id: 'cp1', label: 'Complication', title: '慢性肺源性心脏病', category: '并发症' },
              { id: 'p1', label: 'Patient', title: 'ANON-COPD-2026001 (GOLD E)', category: '患者全景' }
            ], [
              { source: 'c1', target: 's1', type: 'HAS_SYMPTOM' },
              { source: 'c1', target: 's2', type: 'HAS_SYMPTOM' },
              { source: 'c1', target: 'm1', type: 'TREATED_BY' },
              { source: 'c1', target: 'm2', type: 'TREATED_BY' },
              { source: 'c1', target: 'm3', type: 'TREATED_BY' },
              { source: 'c1', target: 'r1', type: 'REHABILITATION_PATH' },
              { source: 'c1', target: 'v1', type: 'PREVENTED_BY' },
              { source: 'c1', target: 'cp1', type: 'LEADS_TO' },
              { source: 'p1', target: 'c1', type: 'DIAGNOSED_WITH' },
              { source: 'p1', target: 'm1', type: 'TAKES_MEDICATION' },
              { source: 'p1', target: 'v1', type: 'VACCINATED_WITH' }
            ]);
          }
        });
      }
    }, [state.activeTab]);

    // 当前角色的 9+ 子模块清单
    const currentModules = Config.MODULES[state.currentRole] || [];

    // 渲染各角色工作台卡片区 (金刚区 Grid)
    const renderWorkbenchGrid = () => {
      return h('div', null, [
        h('div', { className: 'grid-title-bar' }, [
          h('div', { className: 'grid-title' }, [
            h(Icons.Activity, { size: 18, color: 'var(--primary)' }),
            `【${Config.ROLES[state.currentRole].name}】核心功能工作台 (${currentModules.length} 个专科模块)`
          ]),
          h('span', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '点击卡片直接开启交互业务')
        ]),
        h('div', { className: 'workbench-grid' },
          currentModules.map(m => h('div', {
            key: m.code,
            className: 'module-card',
            onClick: () => Store.openModule(m.code)
          }, [
            h('div', null, [
              h('div', { className: 'module-card-header' }, [
                h('div', { className: 'module-icon-box' }, h(Icons[m.icon] || Icons.Activity, { size: 20 })),
                h('div', null, [
                  h('div', { className: 'module-name' }, m.name),
                  h('span', { className: 'module-code' }, m.code)
                ])
              ]),
              h('div', { className: 'module-desc' }, m.desc)
            ]),
            h('div', { className: 'module-action' }, [
              '进入操作',
              h(Icons.Activity, { size: 12 })
            ])
          ]))
        )
      ]);
    };

    // 渲染主工作台内容区
    const renderContent = () => {
      if (state.activeTab === 'home') {
        return h('div', null, [
          state.currentRole === 'patient' && h(PatientComponents.PatientDashboard, null),
          state.currentRole === 'doctor' && h(DoctorComponents.DoctorDashboard, null),
          state.currentRole === 'nurse' && h(NurseComponents.NurseDashboard, null),
          state.currentRole === 'director' && h(DirectorComponents.DirectorDashboard, null),
          state.currentRole === 'tech_admin' && h(AdminComponents.AdminDashboard, null),
          renderWorkbenchGrid()
        ]);
      }

      if (state.activeTab === 'workbench') {
        return h('div', null, [renderWorkbenchGrid()]);
      }

      if (state.activeTab === 'graph') {
        return h('div', { className: 'graph-explorer-view' }, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' } }, [
            h('div', null, [
              h('h3', { style: { fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' } }, 'COPD 慢阻肺临床知识图谱全景探索 (NVL 引擎)'),
              h('p', { style: { fontSize: '12px', color: 'var(--text-secondary)' } }, '已连接 Neo4j 5.x 图数据库，双击节点拖拽交互，滚轮缩放画布')
            ]),
            h('button', {
              className: 'btn-outline',
              onClick: () => Store.showToast('已重置力导向图谱视口', 'info')
            }, [h(Icons.RefreshCw, { size: 14 }), '重置拓扑'])
          ]),
          h('div', {
            style: {
              position: 'relative',
              width: '100%',
              height: '520px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              overflow: 'hidden'
            }
          }, [
            h('canvas', { ref: graphCanvasRef, style: { display: 'block', width: '100%', height: '100%' } }),
            selectedGraphNode && h('div', {
              className: 'card',
              style: {
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '260px',
                boxShadow: 'var(--shadow-lg)',
                fontSize: '13px'
              }
            }, [
              h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' } }, [
                h('span', { className: 'badge badge-primary' }, selectedGraphNode.label),
                h('button', { onClick: () => setSelectedGraphNode(null), style: { color: 'var(--text-muted)' } }, '✕')
              ]),
              h('div', { style: { fontWeight: 700, fontSize: '15px', marginBottom: '6px' } }, selectedGraphNode.title),
              h('div', { style: { color: 'var(--text-secondary)', lineHeight: 1.5 } },
                `类别：${selectedGraphNode.category || '本体节点'} · 图谱ID：${selectedGraphNode.id}`
              )
            ])
          ])
        ]);
      }

      if (state.activeTab === 'profile') {
        return h('div', { className: 'card', style: { maxWidth: '640px', margin: '0 auto', fontSize: '14px', lineHeight: 1.8 } }, [
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' } }, [
            h('span', { style: { fontSize: '42px' } }, state.user.avatar || '👨‍⚕️'),
            h('div', null, [
              h('div', { style: { fontSize: '18px', fontWeight: 800 } }, state.user.real_name),
              h('div', { style: { color: 'var(--text-secondary)' } }, `角色身份：【${Config.ROLES[state.currentRole].name}】 · 账号：${state.user.user_code}`)
            ])
          ]),
          h('hr', { style: { border: 'none', borderTop: '1px solid var(--border-light)', margin: '14px 0' } }),
          h('div', null, [h('strong', null, '服务医疗机构：'), ' 三亚市呼吸疾病数字诊疗协同中心']),
          h('div', null, [h('strong', null, '安全合规体系：'), ' 国家等保三级认证 · HIPAA 医疗脱敏标准']),
          h('div', null, [h('strong', null, '双库协同状态：'), ' MySQL 8.0 (ACID) + Neo4j 5.x APOC 强一致']),
          h('div', { style: { marginTop: '20px', display: 'flex', gap: '10px' } }, [
            h('button', { className: 'btn-outline', onClick: () => setShowLoginModal(true) }, '切换账号登录'),
            h('button', { className: 'btn-outline', onClick: () => Store.toggleTheme() }, `切换为${state.theme === 'light' ? '深色' : '明亮'}主题`)
          ])
        ]);
      }

      return null;
    };

    // 渲染通用弹窗路由
    const renderActiveModuleModal = () => {
      const code = state.activeModule;
      if (!code) return null;

      let modalContent = null;
      // 患者端弹窗
      if (code === 'P02') modalContent = h(PatientComponents.PatientCheckinModal, { onClose: () => Store.closeModule() });
      else if (code === 'P03') modalContent = h(PatientComponents.PatientExacerbationModal, { onClose: () => Store.closeModule() });
      else if (code === 'P04') modalContent = h(PatientComponents.PatientTrendsView, { onClose: () => Store.closeModule() });
      else if (code === 'P06') modalContent = h(PatientComponents.PatientMedicationsModal, { onClose: () => Store.closeModule() });
      else if (code === 'P07') modalContent = h(PatientComponents.PatientVaccinationModal, { onClose: () => Store.closeModule() });
      else if (code === 'P08') modalContent = h(PatientComponents.PatientBluetoothModal, { onClose: () => Store.closeModule() });
      else if (code === 'P09') modalContent = h(PatientComponents.PatientDoctorConsultModal, { onClose: () => Store.closeModule() });
      else if (code === 'P10') modalContent = h(PatientComponents.PatientExportModal, { onClose: () => Store.closeModule() });

      // 医生端弹窗
      else if (code === 'D02') modalContent = h(DoctorComponents.DoctorRadarModal, { onClose: () => Store.closeModule() });
      else if (code === 'D04') modalContent = h(DoctorComponents.DoctorReviewModal, { onClose: () => Store.closeModule() });
      else if (code === 'D05') modalContent = h(DoctorComponents.DoctorAdjustMedModal, { onClose: () => Store.closeModule() });
      else if (code === 'D06') modalContent = h(DoctorComponents.DoctorGraphSearchModal, { onClose: () => Store.closeModule() });
      else if (code === 'D08') modalContent = h(DoctorComponents.DoctorVaccineAdviceModal, { onClose: () => Store.closeModule() });
      else if (code === 'D09') modalContent = h(DoctorComponents.DoctorResearchModal, { onClose: () => Store.closeModule() });

      // 护士端弹窗
      else if (code === 'N03') modalContent = h(NurseComponents.NurseTriageModal, { onClose: () => Store.closeModule() });
      else if (code === 'N04') modalContent = h(NurseComponents.NurseInhalerTrainingModal, { onClose: () => Store.closeModule() });
      else if (code === 'N07') modalContent = h(NurseComponents.NurseRehabModal, { onClose: () => Store.closeModule() });

      // 院长端弹窗
      else if (code === 'M09') modalContent = h(DirectorComponents.DirectorExportModal, { onClose: () => Store.closeModule() });

      // 运维端弹窗
      else if (code === 'T05') modalContent = h(AdminComponents.AdminVNodeModal, { onClose: () => Store.closeModule() });
      else if (code === 'T06') modalContent = h(AdminComponents.AdminAuditModal, { onClose: () => Store.closeModule() });

      // 默认简单说明卡片
      if (!modalContent) {
        const mod = currentModules.find(m => m.code === code) || { name: code, desc: '该模块正在执行后台流式任务...' };
        modalContent = h('div', { className: 'modal-body' }, [
          h('h3', { style: { fontSize: '18px', fontWeight: 700, marginBottom: '12px' } }, `[${code}] ${mod.name}`),
          h('p', { style: { fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' } }, mod.desc),
          h('div', { className: 'card', style: { background: 'var(--bg-app)', marginBottom: '20px', fontSize: '13px' } }, '功能接口已连接完成，响应状态码 HTTP 200 OK。'),
          h('div', { style: { display: 'flex', justifyContent: 'flex-end' } }, [
            h('button', { className: 'btn-primary', onClick: () => Store.closeModule() }, '关闭')
          ])
        ]);
      }

      return h('div', {
        className: 'modal-overlay',
        style: {
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }
      }, [
        h('div', {
          className: 'card',
          style: { width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: 'var(--shadow-lg)' }
        }, modalContent)
      ]);
    };

    // 核心应用主干渲染
    const mainApp = h('div', { className: 'app-root' }, [
      // 1. 顶部 Header
      h('header', { className: 'app-header' }, [
        h('div', { className: 'brand-section' }, [
          h('img', { src: 'assets/logo.png', className: 'brand-logo pulse-lung', alt: 'Logo' }),
          h('div', null, [
            h('div', { className: 'brand-title' }, [
              Config.APP_NAME,
              h('span', { className: 'badge badge-primary', style: { marginLeft: '6px' } }, Config.ROLES[state.currentRole].badge)
            ]),
            h('div', { className: 'brand-sub' }, Config.APP_SUBTITLE)
          ])
        ]),

        h('div', { className: 'header-actions' }, [
          // 快速切换五大角色
          h('select', {
            className: 'input-control',
            style: { width: 'auto', padding: '6px 12px', fontSize: '13px', fontWeight: 600, borderColor: 'var(--primary)' },
            value: state.currentRole,
            onChange: (e) => Store.switchRole(e.target.value)
          }, Object.keys(Config.ROLES).map(r => h('option', { key: r, value: r }, `角色：${Config.ROLES[r].name}`))),

          // 视口模拟模式切换 (PC宽屏 / 手机仿真 / 自适应)
          h('button', {
            className: 'btn-outline',
            style: { padding: '6px 10px', fontSize: '12px' },
            onClick: () => Store.setViewportMode(state.viewportMode === 'mobile' ? 'responsive' : 'mobile'),
            title: '在电脑屏幕上直接模拟手机视口展示'
          }, [
            h(state.viewportMode === 'mobile' ? Icons.Monitor : Icons.Smartphone, { size: 16 }),
            state.viewportMode === 'mobile' ? '全景模式' : '手机视口'
          ]),

          // 深色/明亮模式
          h('button', {
            className: 'btn-outline',
            style: { padding: '6px 10px' },
            onClick: () => Store.toggleTheme()
          }, h(state.theme === 'light' ? Icons.Moon : Icons.Sun, { size: 16 })),

          // 登录切换
          h('button', {
            className: 'btn-primary',
            style: { padding: '6px 14px', fontSize: '12px' },
            onClick: () => setShowLoginModal(true)
          }, '切换账号')
        ])
      ]),

      // 2. 主体区 (PC 侧边栏 + 内容区)
      h('div', { className: 'app-container' }, [
        // PC 侧边栏
        h('aside', { className: 'app-sidebar' }, [
          h('ul', { className: 'sidebar-menu' }, [
            { id: 'home', label: '健康总览', icon: 'Activity' },
            { id: 'workbench', label: '专科工作台', icon: 'BarChart2' },
            { id: 'graph', label: '临床知识图谱', icon: 'Share2' },
            { id: 'profile', label: '个人与系统', icon: 'Settings' }
          ].map(tab => h('li', {
            key: tab.id,
            className: `menu-item ${state.activeTab === tab.id ? 'active' : ''}`,
            onClick: () => Store.setActiveTab(tab.id)
          }, [
            h(Icons[tab.icon], { size: 20 }),
            h('span', null, tab.label)
          ])))
        ]),

        // 主内容区
        h('main', { className: 'app-content' }, renderContent())
      ]),

      // 3. 手机端固定底部 4-Tab 导航
      h('nav', { className: 'mobile-tabbar' }, [
        { id: 'home', label: '总览', icon: 'Activity' },
        { id: 'workbench', label: '工作台', icon: 'BarChart2' },
        { id: 'graph', label: '图谱', icon: 'Share2' },
        { id: 'profile', label: '我的', icon: 'Settings' }
      ].map(tab => h('button', {
        key: tab.id,
        className: `tab-btn ${state.activeTab === tab.id ? 'active' : ''}`,
        onClick: () => Store.setActiveTab(tab.id)
      }, [
        h(Icons[tab.icon], { size: 20 }),
        h('span', null, tab.label)
      ]))),

      // 4. 通用弹窗组件
      renderActiveModuleModal(),

      // 5. 登录注册模态框
      showLoginModal && h(LoginModal, { onClose: () => setShowLoginModal(false) }),

      // 6. Toast 提示系统
      h('div', {
        style: {
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }
      }, state.toasts.map(t => h('div', {
        key: t.id,
        className: 'card',
        style: {
          background: t.type === 'error' ? 'var(--color-danger)' : (t.type === 'success' ? 'var(--primary)' : 'var(--bg-card)'),
          color: t.type === 'error' || t.type === 'success' ? '#fff' : 'var(--text-main)',
          padding: '10px 16px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
          fontSize: '13px',
          fontWeight: 600,
          animation: 'breathingPulse 0.3s ease-out'
        }
      }, t.message)))
    ]);

    // 如果处于手机仿真视口模式，则包裹在手机外观框架中
    if (state.viewportMode === 'mobile') {
      return h('div', { className: 'simulator-active' }, [
        h('div', { className: 'simulator-frame' }, [
          h('div', { className: 'simulator-notch' }),
          mainApp
        ])
      ]);
    }

    return mainApp;
  }

  // 挂载 React 根节点
  const rootElement = document.getElementById('root');
  if (rootElement && window.ReactDOM) {
    ReactDOM.render(h(App), rootElement);
  }
})(window);
