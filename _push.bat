@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
set "LOG=%~dp0_push_log.txt"

echo ==== MINIM push log ==== > "%LOG%"
echo %DATE% %TIME% >> "%LOG%"
echo CWD: %CD% >> "%LOG%"
echo. >> "%LOG%"

echo [1/6] checking git ...
echo ---- STEP 1 git ---- >> "%LOG%"
where git >> "%LOG%" 2>&1
if errorlevel 1 (
  echo ERROR: git not found >> "%LOG%"
  echo.
  echo   git is NOT installed.
  echo   Install from https://git-scm.com/download/win  then run this file again.
  goto :report
)
git --version >> "%LOG%" 2>&1

echo [2/6] placing workflow file ...
echo ---- STEP 2 workflow ---- >> "%LOG%"
if exist "deploy.yml" (
  if not exist ".github\workflows" mkdir ".github\workflows"
  move /Y "deploy.yml" ".github\workflows\deploy.yml" >> "%LOG%" 2>&1
  echo moved deploy.yml >> "%LOG%"
) else (
  echo deploy.yml not in root ^(maybe already moved^) >> "%LOG%"
)
dir /b ".github\workflows" >> "%LOG%" 2>&1

echo [3/6] git init ...
echo ---- STEP 3 init ---- >> "%LOG%"
if not exist ".git" (
  git init >> "%LOG%" 2>&1
) else (
  echo .git already exists >> "%LOG%"
)
git config user.email >nul 2>&1 || git config user.email "dev@minim.local"
git config user.name  >nul 2>&1 || git config user.name  "minim"

echo [4/6] commit ...
echo ---- STEP 4 commit ---- >> "%LOG%"
git add -A >> "%LOG%" 2>&1
git commit -m "feat: MINIM. responsive fashion mall v1" >> "%LOG%" 2>&1
echo commit exit=%errorlevel% >> "%LOG%"
git branch -M main >> "%LOG%" 2>&1

echo [5/6] remote ...
echo ---- STEP 5 remote ---- >> "%LOG%"
git remote remove origin >nul 2>&1
git remote add origin https://github.com/wnsud5959/minim-shop.git >> "%LOG%" 2>&1
git remote -v >> "%LOG%" 2>&1

echo [6/6] push  ^(a GitHub login window may open - please sign in^) ...
echo ---- STEP 6 push ---- >> "%LOG%"
git push -u origin main >> "%LOG%" 2>&1
echo push exit=%errorlevel% >> "%LOG%"

echo ---- FINAL STATE ---- >> "%LOG%"
git log --oneline -1 >> "%LOG%" 2>&1
git status -sb >> "%LOG%" 2>&1
git ls-files >> "%LOG%" 2>&1

:report
echo.
echo ============================================================
type "%LOG%"
echo ============================================================
echo.
echo   Log file saved to: %LOG%
echo   Next: Settings ^> Pages ^> Source = GitHub Actions
echo   URL : https://wnsud5959.github.io/minim-shop/
echo.
pause
