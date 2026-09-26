@echo off
chcp 65001 >nul
rem ============================================================
rem  慢阻肺健康管理 - 启动预览
rem  双击本文件，会在本机开一个临时网页服务，然后：
rem    - 电脑上看：浏览器打开 http://localhost:8000
rem    - 手机上看：手机连同一个 Wi-Fi，访问下面显示的 http://电脑IP:8000
rem  关掉这个黑色窗口，服务就停了。
rem ============================================================

cd /d "%~dp0"

rem 找电脑里已安装的 Python（你的装在 C 盘固定位置，不新增任何文件）
set PYEXE=%LOCALAPPDATA%\Programs\Python\Python314\python.exe
if not exist "%PYEXE%" set PYEXE=python

echo.
echo 正在启动预览服务，请保持这个窗口打开……
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo   电脑上看： http://localhost:8000
echo   手机上看： http://%IP%:8000
echo.
echo   手机打不开的话，检查是不是和电脑连的同一个 Wi-Fi。
echo.

"%PYEXE%" -m http.server 8000

pause
