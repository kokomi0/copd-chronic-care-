// ==============================================================================
// 智肺呼吸 (RespiCare 360) —— Neo4j 5.x 知识图谱初始化与 APOC 脱敏存储过程 Cypher 脚本
// 涵盖：约束与索引、患者图谱核心时序、急性加重级联、疫苗接种、临床本体知识库与 APOC 虚拟节点脱敏查询
// ==============================================================================

// ------------------------------------------------------------------------------
// 1. 唯一性约束与高性能索引 (Neo4j 5.x 规范)
// ------------------------------------------------------------------------------
CREATE CONSTRAINT c_patient_id IF NOT EXISTS FOR (p:Patient) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT c_patient_anon IF NOT EXISTS FOR (p:Patient) REQUIRE p.anon_code IS UNIQUE;
CREATE CONSTRAINT c_observation_id IF NOT EXISTS FOR (o:Observation) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT c_exacerbation_id IF NOT EXISTS FOR (e:Exacerbation) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT c_vaccination_id IF NOT EXISTS FOR (v:Vaccination) REQUIRE v.id IS UNIQUE;
CREATE CONSTRAINT c_disease_name IF NOT EXISTS FOR (d:Disease) REQUIRE d.name IS UNIQUE;
CREATE CONSTRAINT c_medication_name IF NOT EXISTS FOR (m:Medication) REQUIRE m.name IS UNIQUE;
CREATE CONSTRAINT c_symptom_name IF NOT EXISTS FOR (s:Symptom) REQUIRE s.name IS UNIQUE;
CREATE CONSTRAINT c_doctor_id IF NOT EXISTS FOR (doc:Doctor) REQUIRE doc.id IS UNIQUE;

CREATE INDEX idx_obs_date IF NOT EXISTS FOR (o:Observation) ON (o.date);
CREATE INDEX idx_exac_date IF NOT EXISTS FOR (e:Exacerbation) ON (e.onset_date);

// ------------------------------------------------------------------------------
// 2. 清理旧数据并注入 COPD 临床本体知识库 (Ontology)
// ------------------------------------------------------------------------------
MERGE (copd:Disease {name: '慢性阻塞性肺疾病 (COPD)'})
ON CREATE SET 
  copd.code = 'ICD-10: J44.9',
  copd.gold_standard = '吸入支气管舒张剂后 FEV1/FVC < 0.70',
  copd.description = '一种常见、可防可治的慢性气道疾病，其特征为持续存在的气流受限及呼吸道症状。';

// 核心症状节点
MERGE (s1:Symptom {name: '慢性咳嗽', severity_tier: '常见伴随', tip: '晨间咳嗽常较明显，随病情发展可终日有咳'})
MERGE (s2:Symptom {name: '咳痰', severity_tier: '常见伴随', tip: '常呈白色黏液或浆液性泡沫痰，急性加重期转为脓性痰'})
MERGE (s3:Symptom {name: '活动后气促 (劳力性呼吸困难)', severity_tier: '核心标志', tip: 'COPD标志性症状，早期于剧烈活动时出现，逐渐加重至静息时亦喘'})
MERGE (s4:Symptom {name: '喘息与胸闷', severity_tier: '重度提示', tip: '常在劳累后或急性加重时发生，多伴呼气相延长'})
MERGE (s5:Symptom {name: '乏力与体重下降', severity_tier: '全身效应', tip: '重度及极重度COPD常伴骨骼肌功能障碍与营养消耗'})

// 疾病与症状关联
MERGE (copd)-[:HAS_SYMPTOM {frequency: '85%'}]->(s1)
MERGE (copd)-[:HAS_SYMPTOM {frequency: '80%'}]->(s2)
MERGE (copd)-[:HAS_SYMPTOM {frequency: '95%'}]->(s3)
MERGE (copd)-[:HAS_SYMPTOM {frequency: '60%'}]->(s4)
MERGE (copd)-[:HAS_SYMPTOM {frequency: '45%'}]->(s5)

// 临床规范药物节点
MERGE (m1:Medication {name: '布地奈德福莫特罗吸入粉雾剂', class: 'ICS + LABA', device: '都保 (Turbuhaler)', line: '基础联合维持'})
MERGE (m2:Medication {name: '噻托溴铵粉吸入剂', class: 'LAMA (长效抗胆碱能药物)', device: '吸入器 (HandiHaler)', line: '一线长效支气管舒张剂'})
MERGE (m3:Medication {name: '沙美特罗替卡松粉吸入剂', class: 'ICS + LABA', device: '准纳尔 (Diskus)', line: '反复加重伴嗜酸粒细胞增高推荐'})
MERGE (m4:Medication {name: '氟替美维吸入粉雾剂 (三联制剂)', class: 'ICS + LAMA + LABA', device: '易纳器 (Ellipta)', line: 'GOLD E组重度加重患者强化治疗'})
MERGE (m5:Medication {name: '硫酸沙丁胺醇吸入气雾剂', class: 'SABA (短效β2受体激动剂)', device: '定量气雾剂 (pMDI)', line: '急性发作急救备用'})

MERGE (copd)-[:TREATED_BY {recommendation_level: 'GOLD A/B/E指南I级推荐'}]->(m1)
MERGE (copd)-[:TREATED_BY {recommendation_level: 'GOLD A/B/E指南I级推荐'}]->(m2)
MERGE (copd)-[:TREATED_BY {recommendation_level: 'GOLD E组推荐'}]->(m3)
MERGE (copd)-[:TREATED_BY {recommendation_level: 'GOLD E组重度极高危推荐'}]->(m4)
MERGE (copd)-[:TREATED_BY {recommendation_level: '按需急救使用'}]->(m5)

// 药物配伍相互作用
MERGE (m1)-[:INTERACTS_WITH {risk: '同类叠加慎用', note: '与沙丁胺醇合用时须防止过量导致心动过速或低钾血症'}]->(m5)
MERGE (m2)-[:INTERACTS_WITH {risk: '协同增效', note: 'LAMA与LABA联合使用可产生气道平滑肌松弛互补协同效应'}]->(m1)

// 并发症
MERGE (c1:Complication {name: '慢性肺源性心脏病', risk: '极高危', warning: '常继发于长期慢性缺氧与肺动脉高压，出现下肢水肿'})
MERGE (c2:Complication {name: '自发性气胸', risk: '急症高危', warning: '肺大疱破裂引发突然剧烈胸痛与呼吸急促极度加剧，需紧急就医'})
MERGE (c3:Complication {name: '慢性II型呼吸衰竭', risk: '高危', warning: 'PaO2 < 60mmHg 伴 PaCO2 > 50mmHg，需规范长期家庭氧疗'})

MERGE (copd)-[:LEADS_TO]->(c1)
MERGE (copd)-[:LEADS_TO]->(c2)
MERGE (copd)-[:LEADS_TO]->(c3)

// 肺康复指南方案
MERGE (r1:Rehabilitation {name: '缩唇呼吸训练 (Pursed-lip Breathing)', frequency: '每天3次，每次10~15分钟', benefit: '增加气道外周阻力，防止小气道过早陷闭，促进肺内残气排出'})
MERGE (r2:Rehabilitation {name: '腹式呼吸训练 (Diaphragmatic Breathing)', frequency: '每日早晚各一次', benefit: '增强膈肌肌力，降低辅助呼吸肌负荷，改善通气效率'})
MERGE (r3:Rehabilitation {name: '主动循环呼吸排痰技术 (ACBT)', frequency: '晨起排痰期', benefit: '松动深部气道分泌物，减少细菌定植与感染诱发加重'})

MERGE (copd)-[:REHABILITATION_PATH]->(r1)
MERGE (copd)-[:REHABILITATION_PATH]->(r2)
MERGE (copd)-[:REHABILITATION_PATH]->(r3)

// ------------------------------------------------------------------------------
// 3. 初始患者实例与责任医生关联 (Patient -> Doctor)
// ------------------------------------------------------------------------------
MERGE (doc:Doctor {id: 'DOC8801'})
ON CREATE SET 
  doc.name = '李华山',
  doc.title = '呼吸内科主任医师',
  doc.dept = '呼吸与危重症医学科',
  doc.hospital = '三亚市呼吸疾病数字诊疗中心';

MERGE (p:Patient {id: 'PAT2026001'})
ON CREATE SET 
  p.anon_code = 'ANON-COPD-2026001',
  p.gender = 'M',
  p.age = 68,
  p.gold_stage = 3,
  p.gold_group = 'E',
  p.fev1_pred_pct = 42.5,
  p.fev1_fvc_ratio = 54.2,
  p.smoking_history = '已戒烟5年，既往吸烟30包年',
  p.enrolled_date = '2026-08-01';

MERGE (p)-[:MONITORED_BY {bind_date: '2026-08-01', care_team: 'PCCM慢病精细化管理组'}]->(doc);

// ------------------------------------------------------------------------------
// 4. 每日 CAT/mMRC 打卡时序链 (Patient -> Observation)
// ------------------------------------------------------------------------------
MERGE (obs1:Observation {id: 'OBS_20260920'})
ON CREATE SET 
  obs1.date = '2026-09-20',
  obs1.cat_score = 16,
  obs1.mmrc_grade = 2,
  obs1.cough = 2,
  obs1.sputum = 2,
  obs1.dyspnea = 2,
  obs1.spo2 = 94,
  obs1.weight = 65.2,
  obs1.hr = 76,
  obs1.note = '早晨起床稍有咳嗽，含服温开水缓解';

MERGE (obs2:Observation {id: 'OBS_20260923'})
ON CREATE SET 
  obs2.date = '2026-09-23',
  obs2.cat_score = 19,
  obs2.mmrc_grade = 2,
  obs2.cough = 3,
  obs2.sputum = 3,
  obs2.dyspnea = 3,
  obs2.spo2 = 92,
  obs2.weight = 65.0,
  obs2.hr = 82,
  obs2.note = '天气转凉，痰量增多转为淡黄色';

MERGE (obs3:Observation {id: 'OBS_20260926'})
ON CREATE SET 
  obs3.date = '2026-09-26',
  obs3.cat_score = 15,
  obs3.mmrc_grade = 1,
  obs3.cough = 2,
  obs3.sputum = 1,
  obs3.dyspnea = 2,
  obs3.spo2 = 96,
  obs3.weight = 65.3,
  obs3.hr = 75,
  obs3.note = '今日依从都保规范吸入，感觉呼吸平稳很多';

MERGE (p)-[:HAS_OBSERVATION]->(obs1)
MERGE (p)-[:HAS_OBSERVATION]->(obs2)
MERGE (p)-[:HAS_OBSERVATION]->(obs3)

// ------------------------------------------------------------------------------
// 5. 急性加重 (AECOPD) 红色预警事件 (Patient -> Exacerbation)
// ------------------------------------------------------------------------------
MERGE (ex1:Exacerbation {id: 'EXAC_20260815'})
ON CREATE SET 
  ex1.onset_date = '2026-08-15',
  ex1.severity = 'MODERATE',
  ex1.triggers = ['着凉感冒', '气温突降'],
  ex1.used_antibiotic = true,
  ex1.used_steroid = true,
  ex1.hospitalized = false,
  ex1.status = 'RESOLVED',
  ex1.clinical_verdict = '门诊使用阿莫西林克拉维酸钾 + 口服泼尼松5天，已完全控制平稳';

MERGE (p)-[:HAS_EXACERBATION]->(ex1);

// ------------------------------------------------------------------------------
// 6. 疫苗预防接种档案 (Patient -> Vaccination)
// ------------------------------------------------------------------------------
MERGE (v1:Vaccination {id: 'VAC_FLU_2025'})
ON CREATE SET 
  v1.vaccine_type = '四价流感病毒裂解疫苗 (Influenza)',
  v1.dose_num = 1,
  v1.date_given = '2025-10-12',
  v1.next_due_date = '2026-10-12',
  v1.lot_number = 'FLU-202510-098',
  v1.site = '左上臂三角肌肌内注射',
  v1.status = 'VALID';

MERGE (v2:Vaccination {id: 'VAC_PCV_2024'})
ON CREATE SET 
  v2.vaccine_type = '23价肺炎球菌多糖疫苗 (PPSV23)',
  v2.dose_num = 1,
  v2.date_given = '2024-04-18',
  v2.next_due_date = '2029-04-18',
  v2.lot_number = 'PCV-202404-112',
  v2.site = '右上臂三角肌肌内注射',
  v2.status = 'VALID';

MERGE (p)-[:HAS_VACCINATION]->(v1)
MERGE (p)-[:HAS_VACCINATION]->(v2);

// ==============================================================================
// 7. 核心业务：APOC 动态生成脱敏虚拟节点 (apoc.create.vNode)
// 业务要求：向前端脱敏返回患者综合趋势指标，不暴露患者敏感真实属性
// ==============================================================================
// 生产查询 Cypher 脚本示例：
// CALL apoc.create.vNode(['COPDTrend'], { ... }) YIELD node AS trendNode
// ==============================================================================
MATCH (p:Patient {anon_code: 'ANON-COPD-2026001'})
OPTIONAL MATCH (p)-[:HAS_OBSERVATION]->(o:Observation)
WITH p, count(o) AS checkin_days, avg(o.cat_score) AS avg_cat, avg(o.spo2) AS avg_spo2, max(o.date) AS latest_obs_date
OPTIONAL MATCH (p)-[:HAS_EXACERBATION]->(e:Exacerbation)
WITH p, checkin_days, avg_cat, avg_spo2, latest_obs_date, count(e) AS exac_count
CALL apoc.create.vNode(['COPDTrend'], {
  anon_id: p.anon_code,
  gold_group: p.gold_group,
  gold_stage: p.gold_stage,
  cat_avg_30d: round(coalesce(avg_cat, 15.0), 1),
  spo2_baseline: round(coalesce(avg_spo2, 95.0), 1),
  total_checkin_count: checkin_days,
  latest_checkin_date: latest_obs_date,
  annual_exacerbations: exac_count,
  risk_tier: CASE 
    WHEN exac_count >= 2 OR avg_cat >= 20 THEN 'HIGH_DANGER'
    WHEN exac_count = 1 OR avg_cat >= 10 THEN 'MEDIUM_WARNING'
    ELSE 'SAFE_STABLE'
  END,
  trend_summary: 'GOLD E组患者，近30天打卡依从良好，CAT评分平稳，血氧基线处于安全范围',
  desensitized_at: datetime()
}) YIELD node AS trendNode
RETURN trendNode;
