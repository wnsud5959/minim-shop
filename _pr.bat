@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "LOG=%~dp0_setup_log.txt"

echo ============================================================
echo   MINIM. - create branch, commit, push
echo ============================================================
echo.
echo   branch name examples:
echo     docs/readme-portfolio
echo     feat/product-review
echo     fix/QA-031-cart-stock-sync
echo.
set /p BR=branch name : 
if "%BR%"=="" (echo branch name is required. & pause & exit /b 1)
echo.
set /p MSG=commit message (type: summary) : 
if "%MSG%"=="" (echo commit message is required. & pause & exit /b 1)
echo.

echo ==== pr log ==== > "%LOG%"
echo %DATE% %TIME% >> "%LOG%"
echo branch=%BR% >> "%LOG%"
echo msg=%MSG% >> "%LOG%"

git config i18n.commitEncoding utf-8 >> "%LOG%" 2>&1
git config i18n.logOutputEncoding utf-8 >> "%LOG%" 2>&1

echo [1/4] syncing main ...
git switch main >> "%LOG%" 2>&1
git pull >> "%LOG%" 2>&1

echo [2/4] creating branch ...
git switch -c "%BR%" >> "%LOG%" 2>&1 || git switch "%BR%" >> "%LOG%" 2>&1
git branch --show-current >> "%LOG%" 2>&1

echo [3/4] commit ...
git add -A >> "%LOG%" 2>&1
git commit -m "%MSG%" >> "%LOG%" 2>&1
echo commit exit=%errorlevel% >> "%LOG%"

echo [4/4] push ...
git push -u origin "%BR%" >> "%LOG%" 2>&1
echo push exit=%errorlevel% >> "%LOG%"
git log --oneline -3 >> "%LOG%" 2>&1

echo.
echo ============================================================
type "%LOG%"
echo ============================================================
echo.
echo   Open a Pull Request:
echo   https://github.com/wnsud5959/minim-shop/compare/main...%BR%
echo.
echo   Then: wait for CI 'verify', Squash and merge, delete branch.
echo.
pause
