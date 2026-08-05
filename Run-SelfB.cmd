@echo off
title SelfB Launcher

start "SelfB Backend" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0run-backend.ps1"

timeout /t 7 /nobreak >nul

start "SelfB Frontend" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%~dp0run-frontend.ps1"