-- ==============================================================================
-- 智肺呼吸 (RespiCare 360) —— MySQL 8.0 关系型数据库建表与种子数据脚本
-- 涵盖：用户体系、RBAC五大角色、患者档案、医护资质、短信限流、物联网遥测、处方依从性与审计日志
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `respicare_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `respicare_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. 角色字典表 (sys_roles)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sys_roles`;
CREATE TABLE `sys_roles` (
    `role_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '角色自增ID',
    `role_code` VARCHAR(32) NOT NULL UNIQUE COMMENT '角色代码(patient/doctor/nurse/director/tech_admin)',
    `role_name` VARCHAR(64) NOT NULL COMMENT '角色中文名称',
    `description` VARCHAR(255) DEFAULT NULL COMMENT '职责描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='RBAC基础角色定义表';

INSERT INTO `sys_roles` (`role_code`, `role_name`, `description`) VALUES
('patient', '慢阻肺患者', '慢病居家管理、症状量表打卡、用药提醒、急性加重上报与康复图谱探索'),
('doctor', '主治/呼吸专科医生', '患者图谱全景、GOLD E组高危预警雷达、临床干预处置与科研队列脱敏分析'),
('nurse', '责任/专科护士', '辖区打卡监控、漏卡一键催办、急性加重应急初筛分诊与吸入宣教核销'),
('director', '业务副院长/质控管理', '全院慢病综合驾驶舱、再入院指标监控、医护工作负荷与规范路径质控'),
('tech_admin', '系统运维与知识工程师', 'Neo4j图拓扑监控、APOC存储过程性能、双写CDC一致性调度与脱敏配置');

-- ------------------------------------------------------------------------------
-- 2. 系统用户主表 (sys_users)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sys_users`;
CREATE TABLE `sys_users` (
    `user_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '用户主键ID',
    `user_code` VARCHAR(64) NOT NULL UNIQUE COMMENT '业务唯一编码/工号/患者号',
    `phone` VARCHAR(20) NOT NULL UNIQUE COMMENT '注册手机号',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希值(加盐SHA256或bcrypt)',
    `real_name` VARCHAR(64) NOT NULL COMMENT '真实姓名',
    `role_code` VARCHAR(32) NOT NULL COMMENT '当前默认角色代码',
    `avatar` VARCHAR(255) DEFAULT '/assets/avatar-default.png' COMMENT '头像地址',
    `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否激活(1:启用 0:禁用)',
    `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_phone` (`phone`),
    INDEX `idx_user_code` (`user_code`),
    INDEX `idx_role` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统核心用户表';

-- ------------------------------------------------------------------------------
-- 3. 患者专科健康档案表 (patient_profiles)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `patient_profiles`;
CREATE TABLE `patient_profiles` (
    `profile_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '患者档案ID',
    `user_id` BIGINT NOT NULL UNIQUE COMMENT '关联用户ID',
    `anon_code` VARCHAR(64) NOT NULL UNIQUE COMMENT '医学脱敏研究编号(如: SYU-COPD-2026-088)',
    `gender` ENUM('M', 'F') NOT NULL DEFAULT 'M' COMMENT '性别 M/F',
    `birth_date` DATE NOT NULL COMMENT '出生日期',
    `height_cm` DECIMAL(5,1) DEFAULT 170.0 COMMENT '身高cm',
    `weight_kg` DECIMAL(5,1) DEFAULT 65.0 COMMENT '体重kg',
    `smoking_status` VARCHAR(32) DEFAULT '戒烟' COMMENT '吸烟史(不吸烟/戒烟/吸烟中)',
    `smoking_pack_years` INT DEFAULT 30 COMMENT '吸烟包年数(每日包数*年数)',
    `fev1_pred_pct` DECIMAL(5,1) DEFAULT 45.2 COMMENT 'FEV1占预计值百分比(%)',
    `fev1_fvc_ratio` DECIMAL(5,1) DEFAULT 58.5 COMMENT '吸入支气管舒张剂后FEV1/FVC(%)',
    `gold_stage` INT DEFAULT 3 COMMENT 'GOLD气流受限分级(1~4级)',
    `gold_group` VARCHAR(8) DEFAULT 'E' COMMENT 'GOLD综合评估分组(A / B / E组)',
    `bound_doctor_id` BIGINT DEFAULT NULL COMMENT '绑定随访专科医生ID',
    `bound_nurse_id` BIGINT DEFAULT NULL COMMENT '绑定病区责任护士ID',
    `emergency_contact_name` VARCHAR(32) DEFAULT '家属' COMMENT '紧急联系人家属姓名',
    `emergency_contact_phone` VARCHAR(20) DEFAULT '13800000000' COMMENT '紧急联系人电话',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '建立档案时间',
    CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='慢阻肺患者全病程临床档案表';

-- ------------------------------------------------------------------------------
-- 4. 医护与管理者资质档案表 (staff_profiles)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `staff_profiles`;
CREATE TABLE `staff_profiles` (
    `staff_id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '医护专职主键ID',
    `user_id` BIGINT NOT NULL UNIQUE COMMENT '关联系统用户ID',
    `badge_no` VARCHAR(32) NOT NULL UNIQUE COMMENT '医院正式工号',
    `title` VARCHAR(64) NOT NULL COMMENT '职称(副主任医师/护士长/主任医师等)',
    `department` VARCHAR(64) NOT NULL DEFAULT '呼吸与危重症医学科(PCCM)' COMMENT '科室',
    `hospital_name` VARCHAR(128) NOT NULL DEFAULT '三亚市慢阻肺数字诊疗协同中心' COMMENT '执业医疗机构',
    `license_no` VARCHAR(64) DEFAULT NULL COMMENT '医师/护士执业证书编号',
    `specialty` VARCHAR(255) DEFAULT '慢性阻塞性肺疾病急性加重早期阻断、肺康复' COMMENT '主攻方向',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `sys_users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='专业医护与质控管理人员档案表';

-- ------------------------------------------------------------------------------
-- 5. 短信验证码防刷与审计表 (sms_verification_codes)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `sms_verification_codes`;
CREATE TABLE `sms_verification_codes` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '流水主键',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `code` VARCHAR(8) NOT NULL COMMENT '6位短信验证码',
    `purpose` VARCHAR(32) NOT NULL DEFAULT 'login_or_register' COMMENT '用途(登录注册/绑定/改密)',
    `send_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '发送时刻',
    `expire_time` DATETIME NOT NULL COMMENT '过期时刻(默认5分钟)',
    `is_used` TINYINT(1) DEFAULT 0 COMMENT '是否已核销',
    `ip_address` VARCHAR(64) DEFAULT NULL COMMENT '请求客户端IP',
    INDEX `idx_phone_time` (`phone`, `send_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='手机短信验证码与防刷网关表';

-- ------------------------------------------------------------------------------
-- 6. 吸入药物处方表 (inhalation_prescriptions)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `inhalation_prescriptions`;
CREATE TABLE `inhalation_prescriptions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '处方主键ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者用户ID',
    `drug_name` VARCHAR(128) NOT NULL COMMENT '药品商品通用名(如: 布地奈德福莫特罗粉吸入剂)',
    `drug_class` VARCHAR(64) NOT NULL COMMENT '药物大类(ICS+LABA / LAMA / 三联)',
    `device_type` VARCHAR(64) NOT NULL COMMENT '吸入装置(都保Turbuhaler / 准纳尔Diskus / 软雾吸入剂SMI)',
    `dosage` VARCHAR(64) NOT NULL COMMENT '单次剂量(如: 160/4.5μg/吸)',
    `daily_frequency` INT NOT NULL DEFAULT 2 COMMENT '每日频次(早晚各1次)',
    `times_plan` VARCHAR(128) DEFAULT '08:00, 20:00' COMMENT '建议计划服药时刻',
    `start_date` DATE NOT NULL COMMENT '处方开始日期',
    `end_date` DATE DEFAULT NULL COMMENT '处方结束日期',
    `prescribing_doctor_id` BIGINT DEFAULT NULL COMMENT '开方医生ID',
    `status` ENUM('ACTIVE', 'SUSPENDED', 'STOPPED') DEFAULT 'ACTIVE' COMMENT '状态',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '下达时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='慢阻肺规范吸入制剂处方主表';

-- ------------------------------------------------------------------------------
-- 7. 每日服药与吸入依从性核销表 (inhalation_logs)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `inhalation_logs`;
CREATE TABLE `inhalation_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '服药打卡记录ID',
    `patient_id` BIGINT NOT NULL COMMENT '患者用户ID',
    `prescription_id` BIGINT NOT NULL COMMENT '关联处方ID',
    `scheduled_time` VARCHAR(16) NOT NULL COMMENT '计划时刻(如 08:00)',
    `taken_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '实际打卡吸入时间',
    `technique_verified` TINYINT(1) DEFAULT 1 COMMENT '是否按规范屏气10秒与含漱',
    `adherence_score` INT DEFAULT 100 COMMENT '依从性评分',
    INDEX `idx_patient_log` (`patient_id`, `taken_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='吸入装置依从性打卡日记表';

-- ------------------------------------------------------------------------------
-- 8. 智能硬件蓝牙遥测明细表 (device_telemetries)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `device_telemetries`;
CREATE TABLE `device_telemetries` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '遥测数据主键',
    `patient_id` BIGINT NOT NULL COMMENT '患者用户ID',
    `device_type` VARCHAR(32) NOT NULL COMMENT '设备类型(oximeter血氧仪 / spirometer便携肺功能仪)',
    `device_mac` VARCHAR(64) DEFAULT NULL COMMENT '设备MAC蓝牙地址',
    `spo2` INT DEFAULT NULL COMMENT '血氧饱和度百分比(%)',
    `pulse_rate` INT DEFAULT NULL COMMENT '脉率/心率(bpm)',
    `fev1_l` DECIMAL(4,2) DEFAULT NULL COMMENT '第一秒用力呼气容积(L)',
    `fvc_l` DECIMAL(4,2) DEFAULT NULL COMMENT '用力肺活量(L)',
    `pef_l_min` DECIMAL(5,1) DEFAULT NULL COMMENT '呼气峰值流速(L/min)',
    `recorded_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '采集入库时刻',
    INDEX `idx_patient_device` (`patient_id`, `recorded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='IoT智能医疗设备直连采集时序数据表';

-- ------------------------------------------------------------------------------
-- 9. 全链路合规操作审计日志表 (audit_logs)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '审计流水号',
    `user_id` BIGINT DEFAULT NULL COMMENT '操作人ID',
    `user_code` VARCHAR(64) DEFAULT NULL COMMENT '操作人工号/患者脱敏号',
    `role_code` VARCHAR(32) DEFAULT NULL COMMENT '操作人角色',
    `action_type` VARCHAR(64) NOT NULL COMMENT '行为类型(LOGIN/SUBMIT_CHECKIN/ALERT_EXACERBATION/EXPORT_REPORT)',
    `resource_uri` VARCHAR(255) NOT NULL COMMENT '访问RESTful接口路径',
    `request_method` VARCHAR(16) NOT NULL COMMENT 'HTTP方法(GET/POST/PUT/DELETE)',
    `ip_address` VARCHAR(64) DEFAULT NULL COMMENT '来源客户端IP',
    `status_code` INT DEFAULT 200 COMMENT '响应状态码',
    `latency_ms` INT DEFAULT 12 COMMENT '耗时毫秒数',
    `details` TEXT DEFAULT NULL COMMENT '操作上下文与参数摘要',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '审计记录时刻',
    INDEX `idx_action_time` (`action_type`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='等保三级与HIPAA全链路安全审计日志表';

-- ------------------------------------------------------------------------------
-- 10. 初始种子数据：五大角色全功能预置账号 (初始密码统一为: 123456)
-- 哈希说明：123456 加盐 SHA256 哈希值: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
-- ------------------------------------------------------------------------------
INSERT INTO `sys_users` (`user_id`, `user_code`, `phone`, `password_hash`, `real_name`, `role_code`, `avatar`) VALUES
(1, 'PAT2026001', '13800000001', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '张建国', 'patient', '👨‍🦳'),
(2, 'DOC8801',    '13900000002', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '李华山', 'doctor',  '👨‍⚕️'),
(3, 'NUR6601',    '13700000003', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '王春燕', 'nurse',   '👩‍⚕️'),
(4, 'DIR0001',    '13600000004', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '陈远东', 'director','👔'),
(5, 'ADM9901',    '13500000005', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '周天成', 'tech_admin','💻');

-- 关联患者档案
INSERT INTO `patient_profiles` (`user_id`, `anon_code`, `gender`, `birth_date`, `fev1_pred_pct`, `fev1_fvc_ratio`, `gold_stage`, `gold_group`, `bound_doctor_id`, `bound_nurse_id`) VALUES
(1, 'ANON-COPD-2026001', 'M', '1958-06-15', 42.5, 54.2, 3, 'E', 2, 3);

-- 关联医护人员档案
INSERT INTO `staff_profiles` (`user_id`, `badge_no`, `title`, `department`, `hospital_name`, `specialty`) VALUES
(2, 'DOC8801', '呼吸内科主任医师 / 教授', '呼吸与危重症医学科', '三亚市呼吸疾病数字诊疗中心', '慢阻肺个体化靶向评估、重症急性加重抢救与肺康复'),
(3, 'NUR6601', '副主任护师 / PCCM专科护士长', '呼吸与危重症医学科', '三亚市呼吸疾病数字诊疗中心', '慢病居家呼吸训练、吸入装置使用宣教与出院随访'),
(4, 'DIR0001', '业务副院长 / 呼吸病学学术带头人', '院领导班子/医疗质控部', '三亚市呼吸疾病数字诊疗中心', '医院精细化慢病管理指标、临床路径质控与科研建设'),
(5, 'ADM9901', '首席知识图谱算法架构师', '信息技术部 / 医疗大数据中心', '三亚市呼吸疾病数字诊疗中心', '知识图谱本体维护、双库高可用协同与数据脱敏');

-- 初始处方
INSERT INTO `inhalation_prescriptions` (`patient_id`, `drug_name`, `drug_class`, `device_type`, `dosage`, `daily_frequency`, `times_plan`, `start_date`, `prescribing_doctor_id`) VALUES
(1, '布地奈德福莫特罗吸入粉雾剂(II)', 'ICS+LABA', '都保 (Turbuhaler)', '160/4.5μg/吸, 每次1吸', 2, '08:00, 20:00', '2026-08-01', 2),
(1, '噻托溴铵粉雾剂', 'LAMA', '吸入装置(HandiHaler)', '18μg/粒, 每次1粒', 1, '09:00', '2026-08-01', 2);

-- 初始服药打卡
INSERT INTO `inhalation_logs` (`patient_id`, `prescription_id`, `scheduled_time`, `taken_at`, `technique_verified`, `adherence_score`) VALUES
(1, 1, '08:00', '2026-09-26 08:05:00', 1, 100),
(1, 2, '09:00', '2026-09-26 09:12:00', 1, 100);

-- 初始蓝牙遥测样本
INSERT INTO `device_telemetries` (`patient_id`, `device_type`, `device_mac`, `spo2`, `pulse_rate`, `fev1_l`, `fvc_l`, `pef_l_min`, `recorded_at`) VALUES
(1, 'oximeter', 'C4:7D:E4:91:2A:01', 95, 78, NULL, NULL, NULL, '2026-09-26 08:10:00'),
(1, 'spirometer', 'B8:27:EB:13:99:5F', NULL, NULL, 1.45, 2.68, 280.5, '2026-09-25 19:30:00');

-- 初始审计日志样本
INSERT INTO `audit_logs` (`user_id`, `user_code`, `role_code`, `action_type`, `resource_uri`, `request_method`, `ip_address`, `status_code`, `latency_ms`, `details`) VALUES
(1, 'PAT2026001', 'patient', 'LOGIN', '/api/auth/login', 'POST', '127.0.0.1', 200, 8, '张建国通过手机短信验证码完成患者端鉴权登录'),
(2, 'DOC8801', 'doctor', 'VIEW_GRAPH', '/api/doctor/patient-graph/PAT2026001', 'GET', '127.0.0.1', 200, 15, '李华山医生调阅患者ANON-COPD-2026001的GOLD E全景图谱');

SET FOREIGN_KEY_CHECKS = 1;
