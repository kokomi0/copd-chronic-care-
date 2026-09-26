@echo off
chcp 65001 >nul
rem ============================================================
rem  慢阻肺健康管理 - 启动后端服务
rem  双击本文件，会在本机启动 Flask 后端，端口 5000。
rem  关掉这个黑色窗口，服务就停了。
rem ============================================================

cd /d "%~dp0"

rem 用电脑里已装的 Python（固定位置，不新增任何文件）
set PYEXE=%LOCALAPPDATA%\Programs\Python\Python314\python.exe
if not exist "%PYEXE%" set PYEXE=python

echo.
echo 正在启动后端服务，请保持这个窗口打开……
echo   后端地址： http://localhost:5000
echo   健康检查： http://localhost:5000/api/health
echo.

"%PYEXE%" app.py

pause
