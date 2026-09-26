// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 五大角色专属 6~7 核心业务菜单配置
// ==============================================================================

export const ROLE_MENUS = {
  patient: [
    {
      id: 'overview',
      label: '呼吸健康工作台',
      icon: 'Activity',
      tag: '核心',
      desc: '今日指标、极速加重就医通道、今日待办'
    },
    {
      id: 'checkin',
      label: '每日量表打卡',
      icon: 'CheckCircle',
      tag: '必填',
      desc: 'CAT 评分 / mMRC 气促量表 / 症状记录'
    },
    {
      id: 'trends',
      label: '身体变化趋势',
      icon: 'BarChart2',
      tag: '时序',
      desc: '近 30/90 天 CAT 曲线、血氧波动、加重日历热力图'
    },
    {
      id: 'exacerbation',
      label: '急性加重上报与自救',
      icon: 'ShieldAlert',
      tag: '红色通道',
      desc: 'AECPOPD 红色通道、用药急救指引'
    },
    {
      id: 'graph',
      label: '呼吸康复知识图谱',
      icon: 'Share2',
      tag: '图谱',
      desc: 'NVL 节点链交互、病理机制与吸入用药图谱'
    },
    {
      id: 'medication',
      label: '疫苗与用药档案',
      icon: 'Clock',
      tag: '提醒',
      desc: '吸入剂依从性打卡、流感/肺炎疫苗提醒'
    },
    {
      id: 'consult',
      label: '医生复诊与随访',
      icon: 'MessageSquare',
      tag: '在线',
      desc: '绑定的主治医生图文沟通、复诊建议'
    }
  ],

  doctor: [
    {
      id: 'overview',
      label: '专科诊疗工作台',
      icon: 'Stethoscope',
      tag: '大盘',
      desc: '管辖患者大盘、今日待处理预警'
    },
    {
      id: 'patients',
      label: 'COPD 患者档案库',
      icon: 'Users',
      tag: '档案',
      desc: '病历检索、分级档案、依从性追踪'
    },
    {
      id: 'radar',
      label: '高危预警与急性加重',
      icon: 'AlertTriangle',
      tag: 'GOLD E',
      desc: 'GOLD E 组高危患者雷达、加重事件复核处置'
    },
    {
      id: 'trends',
      label: '时序打卡研判中心',
      icon: 'BarChart2',
      tag: '研判',
      desc: '患者 CAT/mMRC/血氧多维趋势对比回溯'
    },
    {
      id: 'prescriptions',
      label: '处方与吸入装置方案',
      icon: 'Clock',
      tag: '处方',
      desc: '用药调整、装置替换建议下发'
    },
    {
      id: 'graph',
      label: '临床图谱路径检索',
      icon: 'Compass',
      tag: '推理',
      desc: 'COPD 临床路径、合并症与禁忌推理'
    },
    {
      id: 'consult',
      label: '医患随访咨询中心',
      icon: 'MessageSquare',
      tag: '问诊',
      desc: '图文问诊、随访计划下发与评价'
    }
  ],

  nurse: [
    {
      id: 'overview',
      label: '病区护理工作台',
      icon: 'HeartPulse',
      tag: '病区',
      desc: '病区打卡进度、今日护理待办'
    },
    {
      id: 'monitor',
      label: '打卡监控与随访催办',
      icon: 'Bell',
      tag: '催办',
      desc: '漏卡患者预警、一键电话/短信催办'
    },
    {
      id: 'triage',
      label: '加重应急接诊初筛',
      icon: 'ShieldAlert',
      tag: '急症',
      desc: '急症上报初筛分诊、通知值班医生'
    },
    {
      id: 'education',
      label: '吸入技术宣教指导',
      icon: 'FileText',
      tag: '宣教',
      desc: '吸入装置标准手法视频与图谱宣教'
    },
    {
      id: 'vaccine',
      label: '疫苗接种预约执行',
      icon: 'CheckCircle',
      tag: '核销',
      desc: '疫苗登记、接种提醒通知下发'
    },
    {
      id: 'rehab',
      label: '呼吸排痰康复督导',
      icon: 'Activity',
      tag: '排痰操',
      desc: '缩唇腹式呼吸操、排痰打卡复核'
    },
    {
      id: 'handover',
      label: '护理查房与交接班',
      icon: 'MessageSquare',
      tag: '交接',
      desc: '每日巡查日志、特殊患者备忘录'
    }
  ],

  director: [
    {
      id: 'overview',
      label: '慢病管理运营驾驶舱',
      icon: 'BarChart2',
      tag: '全院',
      desc: '全院 COPD 患者总览、打卡活跃率大盘'
    },
    {
      id: 'readmission',
      label: '急性加重再入院监控',
      icon: 'ShieldAlert',
      tag: '指标',
      desc: 'A/B/E 组分布演变、30 天内再入院率统计'
    },
    {
      id: 'performance',
      label: '医护效能与随访达标',
      icon: 'Users',
      tag: '排行',
      desc: '科室随访率、依从性达标排行'
    },
    {
      id: 'compliance',
      label: '药械使用依从度分析',
      icon: 'Clock',
      tag: '合规',
      desc: '全院吸入制剂依从度与规范用药率'
    },
    {
      id: 'vaccine',
      label: '疫苗预防接种覆盖率',
      icon: 'HeartPulse',
      tag: '预防',
      desc: '重点慢病人群流感/肺炎疫苗接种大盘'
    },
    {
      id: 'quality',
      label: '临床路径规范性质控',
      icon: 'Compass',
      tag: '质控',
      desc: '基于知识图谱的诊疗合规度审计'
    },
    {
      id: 'reports',
      label: '综合决策报表导出',
      icon: 'Download',
      tag: '报表',
      desc: '多维慢病医疗运营报表导出'
    }
  ],

  tech_admin: [
    {
      id: 'overview',
      label: '系统拓扑与服务监控',
      icon: 'Cpu',
      tag: '集群',
      desc: 'API 响应、内存与容器状态'
    },
    {
      id: 'neo4j',
      label: 'Neo4j 图谱与 APOC 引擎',
      icon: 'Database',
      tag: '图库',
      desc: '节点与关系统计、APOC 存储过程性能'
    },
    {
      id: 'rbac',
      label: 'RBAC 角色与账号管理',
      icon: 'Settings',
      tag: 'RBAC',
      desc: '五大角色权限点分配、用户管理'
    },
    {
      id: 'iot',
      label: '医疗 IoT 设备接入',
      icon: 'Bluetooth',
      tag: '流式',
      desc: '便携血氧仪/肺功能仪 API 与数据流监控'
    },
    {
      id: 'vnode',
      label: '虚拟节点与脱敏规则',
      icon: 'ShieldAlert',
      tag: '脱敏',
      desc: 'vNode 脱敏策略配置、安全审计'
    },
    {
      id: 'audit',
      label: '全链路安全审计日志',
      icon: 'FileText',
      tag: '等保',
      desc: '敏感操作、接口调用与访问留痕'
    },
    {
      id: 'release',
      label: '系统发布与多端配置',
      icon: 'RefreshCw',
      tag: '多端',
      desc: '移动端版本热更新、二维码服务配置'
    }
  ]
};

// 移动端底部 4 个高频 Tab 配置 (每个角色挑 4 个核心直达入口)
export const MOBILE_BOTTOM_TABS = {
  patient: ['overview', 'checkin', 'trends', 'graph'],
  doctor: ['overview', 'patients', 'radar', 'consult'],
  nurse: ['overview', 'monitor', 'triage', 'education'],
  director: ['overview', 'readmission', 'performance', 'reports'],
  tech_admin: ['overview', 'neo4j', 'rbac', 'audit']
};
