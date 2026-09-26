// ==============================================================================
// 智肺呼吸 (RespiCare 360) - 核心配置与五大角色 46+ 功能字典 (ES Module)
// ==============================================================================

export const Config = {
  APP_NAME: "智肺呼吸",
  APP_SUBTITLE: "慢阻肺数字化智慧管理与知识图谱协同平台",
  APP_EN: "RespiCare 360",
  VERSION: "v1.2.0-commercial",
  API_BASE: "/api",

  ROLES: {
    patient: {
      code: "patient",
      name: "慢阻肺患者",
      badge: "患者端",
      icon: "UserCheck",
      color: "#00897B",
      bgLight: "#E0F2F1",
      defaultAccount: "13800000001",
      defaultName: "张建国 (GOLD E组)",
      desc: "症状打卡、用药提醒、急性加重上报与康复图谱"
    },
    doctor: {
      code: "doctor",
      name: "专科医生",
      badge: "医生端",
      icon: "Stethoscope",
      color: "#0288D1",
      bgLight: "#E1F5FE",
      defaultAccount: "DOC8801",
      defaultName: "李华山 (主任医师)",
      desc: "患者图谱、GOLD E预警雷达、临床干预处置与科研统计"
    },
    nurse: {
      code: "nurse",
      name: "专科护士",
      badge: "护士端",
      icon: "HeartPulse",
      color: "#E91E63",
      bgLight: "#FCE4EC",
      defaultAccount: "NUR6601",
      defaultName: "王春燕 (主管护师)",
      desc: "病区监控大盘、漏卡催办、应急初筛与宣教核销"
    },
    director: {
      code: "director",
      name: "管理院长",
      badge: "院长端",
      icon: "BarChart2",
      color: "#7B1FA2",
      bgLight: "#F3E5F5",
      defaultAccount: "DIR0001",
      defaultName: "陈远东 (业务院长)",
      desc: "全院驾驶舱、急性加重再入院监控、质控与经营报表"
    },
    tech_admin: {
      code: "tech_admin",
      name: "技术运维",
      badge: "运维端",
      icon: "Cpu",
      color: "#E65100",
      bgLight: "#FFF3E0",
      defaultAccount: "ADM9901",
      defaultName: "周天成 (架构师)",
      desc: "Neo4j拓扑、APOC存储过程监控、双写一致性与脱敏"
    }
  },

  // 五大角色各 9+ 功能子模块完整清单
  MODULES: {
    patient: [
      { code: "P01", name: "呼吸健康看板总览", icon: "Activity", tag: "实时", desc: "今日综合评分、血氧/心率/肺功能监测基线与日程" },
      { code: "P02", name: "每日 CAT/mMRC 症状量表打卡", icon: "CheckCircle", tag: "必填", desc: "8题CAT评分与0~4级mMRC气促分级智能打卡入图" },
      { code: "P03", name: "急性加重红色事件紧急上报", icon: "ShieldAlert", tag: "高危", desc: "咳嗽/咳痰/气促突发加重直报随访医生与急救指导" },
      { code: "P04", name: "身体变化趋势", icon: "BarChart2", tag: "时序", desc: "近30/90天CAT折线、血氧波动与急性加重日历" },
      { code: "P05", name: "肺康复知识图谱探索", icon: "Share2", tag: "图谱", desc: "交互式力导向拓扑，探索症状、用药与缩唇呼吸链" },
      { code: "P06", name: "吸入装置依从性打卡与用药闹钟", icon: "Clock", tag: "打卡", desc: "都保/准纳尔用药计划、定时服药闹钟与含漱提醒" },
      { code: "P07", name: "疫苗接种档案追踪", icon: "FileText", tag: "预防", desc: "流感与23价肺炎球菌疫苗到期倒计时与预约指引" },
      { code: "P08", name: "智能设备蓝牙直连同步", icon: "Bluetooth", tag: "IoT", desc: "便携脉搏血氧仪与便携肺功能仪蓝牙数据毫秒流式同步" },
      { code: "P09", name: "在线复诊咨询与随访医生绑定", icon: "MessageSquare", tag: "门诊", desc: "绑定李华山主任医师，提供图文问诊与用药指导" },
      { code: "P10", name: "个人健康档案与脱敏导出", icon: "Download", tag: "隐私", desc: "HIPAA合规脱敏健康报告卡一键预览与结构化导出" }
    ],
    doctor: [
      { code: "D01", name: "患者图谱工作台", icon: "Share2", tag: "全景", desc: "关联患者全病程临床图谱、用药网络与生命体征" },
      { code: "D02", name: "GOLD E 组高危急性加重预警雷达", icon: "AlertTriangle", tag: "高危", desc: "多维特征雷达监测，智能识别频繁急性加重风险" },
      { code: "D03", name: "患者打卡历史与时序趋势回溯", icon: "BarChart2", tag: "回溯", desc: "CAT/mMRC/SpO2长周期时序轨迹与治疗响应评估" },
      { code: "D04", name: "急性加重临床复核与干预处置", icon: "ShieldAlert", tag: "处置", desc: "复核患者上报加重事件，下发抗生素/激素方案" },
      { code: "D05", name: "吸入剂用药依从性评估与方案调整", icon: "Clock", tag: "阶梯", desc: "评估MMAS吸入达标率，一键调整为三联强化治疗" },
      { code: "D06", name: "临床 COPD 知识图谱检索", icon: "Compass", tag: "循证", desc: "病理机制、并发症靶点与药物配伍禁忌深度推理" },
      { code: "D07", name: "在线随访与图文问诊工作站", icon: "MessageSquare", tag: "问诊", desc: "门诊患者线上咨询消息队列与结构化医嘱模板" },
      { code: "D08", name: "疫苗接种指导建议签发", icon: "FileText", tag: "签发", desc: "针对秋季病毒高发季一键签署四价流感预防接种单" },
      { code: "D09", name: "科研队列脱敏数据统计", icon: "Database", tag: "科研", desc: "GOLD分型多中心队列时序、FEV1衰减减缓率分析" }
    ],
    nurse: [
      { code: "N01", name: "辖区/病区患者今日打卡监控台", icon: "Activity", tag: "监控", desc: "网格化查看已打卡、未打卡与低氧警示患者名单" },
      { code: "N02", name: "漏卡患者一键随访催办与脱落预警", icon: "Bell", tag: "催办", desc: "短信与语音电话一键批量催办，降低失访脱落率" },
      { code: "N03", name: "急性加重应急接诊初筛", icon: "ShieldAlert", tag: "分诊", desc: "绿色通道初筛问询，评估口唇发绀与说话连贯度" },
      { code: "N04", name: "吸入装置实操视频与图谱宣教指引", icon: "FileText", tag: "考核", desc: "都保/准纳尔装置教学考核标准卡与实操视频" },
      { code: "N05", name: "疫苗接种预约与执行核销", icon: "CheckCircle", tag: "核销", desc: "流感疫苗门诊预约名单核验、批号登记与不良反应" },
      { code: "N06", name: "家用血氧/肺功能手工复核校验", icon: "UserCheck", tag: "质控", desc: "异常波动体征电话回访复测，纠偏并标记审核入库" },
      { code: "N07", name: "康复排痰操与呼吸训练指导", icon: "HeartPulse", tag: "节拍", desc: "缩唇呼吸与腹式呼吸节拍器、有效咳嗽哈气训练" },
      { code: "N08", name: "护理交接班记录与批注", icon: "MessageSquare", tag: "交接", desc: "白班/晚夜班重点关注危急重症患者时序批注" },
      { code: "N09", name: "随访问卷与宣教触达分发", icon: "Download", tag: "触达", desc: "秋冬防寒保暖、规范吸入漱口宣教全员一键触达" }
    ],
    director: [
      { code: "M01", name: "全院慢病综合管理大屏", icon: "BarChart2", tag: "驾驶舱", desc: "总在管人数、打卡活跃率、就诊转化与关键KPI" },
      { code: "M02", name: "急性加重发生率与再入院指标监控", icon: "ShieldAlert", tag: "指标", desc: "30天再入院率环比、平均住院日与加重阻断数" },
      { code: "M03", name: "医护团队随访达标率与工作负荷排行", icon: "Users", tag: "排行", desc: "专科医生与责任护士在管人数、随访率与服务评价" },
      { code: "M04", name: "GOLD A/B/E 组人群分布演变分析", icon: "Share2", tag: "演变", desc: "2024最新指南人群分布漏斗与E组稳态改善迁移" },
      { code: "M05", name: "知识图谱临床规范路径质控分析", icon: "Compass", tag: "质控", desc: "临床指南遵循率、吸入三联合理率与不合理拦截" },
      { code: "M06", name: "吸入剂全院使用依从性宏观分析", icon: "Clock", tag: "宏观", desc: "都保/准纳尔/易纳器全院患者服药打卡合规率" },
      { code: "M07", name: "疫苗预防接种覆盖率大盘", icon: "HeartPulse", tag: "覆盖", desc: "流感疫苗与肺炎多糖疫苗年度覆盖率仪表盘" },
      { code: "M08", name: "医疗安全风险与合规预警拦截", icon: "AlertTriangle", tag: "雷达", desc: "重复用药、严重药物相互作用与低氧漏诊拦截" },
      { code: "M09", name: "经营与科研报表多维导出", icon: "Download", tag: "导出", desc: "一键导出国家慢病达标统计表与科研队列数据集" }
    ],
    tech_admin: [
      { code: "T01", name: "Neo4j 图数据库拓扑与 APOC 性能监控", icon: "Database", tag: "图库", desc: "Bolt连接池、QPS、慢查询毫秒监控与APOC存量" },
      { code: "T02", name: "RBAC 用户角色与功能权限分配", icon: "Settings", tag: "RBAC", desc: "五大角色46功能点矩阵式开关与动态授权" },
      { code: "T03", name: "短信验证码服务商路由与黑名单网关", icon: "Zap", tag: "网关", desc: "阿里云/腾讯云自动熔断倒换、60s防刷与频控" },
      { code: "T04", name: "IoT 医疗设备接入管道监控", icon: "Bluetooth", tag: "IoT", desc: "apoc.load.json 遥测流式摄入吞吐量与连接探针" },
      { code: "T05", name: "敏感数据脱敏规则与 vNode 虚拟节点配置", icon: "ShieldAlert", tag: "APOC", desc: "配置 apoc.create.vNode(['COPDTrend']) 脱敏字段" },
      { code: "T06", name: "全链路访问审计日志与安全合规中心", icon: "FileText", tag: "等保", desc: "等保三级与HIPAA医疗全链路日志溯源审计" },
      { code: "T07", name: "知识图谱 Schema 与本体字典维护", icon: "Share2", tag: "本体", desc: "可视化维护 Disease/Medication 标签与关系字典" },
      { code: "T08", name: "客户端版本灰度发布与配置热更新", icon: "RefreshCw", tag: "发布", desc: "移动端与PC端版本号灰度控制与强制更新开关" },
      { code: "T09", name: "关系库与图数据库双写一致性调度", icon: "Activity", tag: "CDC", desc: "MySQL Binlog CDC 增量入图延时监控与补偿队列" }
    ]
  }
};
