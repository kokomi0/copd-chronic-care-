@echo off
chcp 65001 >nul
title 智肺呼吸 (RespiCare 360) - 后端服务启动器
cd /d "%~dp0"

echo ==============================================================================
echo 正在启动 智肺呼吸 (RespiCare 360) Flask 后端服务...
echo 数据库配置: MySQL 8.0 (3306) + Neo4j 5.x Bolt (7687)
echo 访问地址: http://localhost:5001
echo ==============================================================================

python app.py
pause
