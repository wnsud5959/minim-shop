# MINIM. -> GitHub push + Pages 배포 스크립트
# 사용법: 이 파일에서 마우스 오른쪽 클릭 > "PowerShell에서 실행"
#        또는 PowerShell 열고  powershell -ExecutionPolicy Bypass -File _push.ps1

$ErrorActionPreference = "Stop"
$repo = "https://github.com/wnsud5959/minim-shop.git"
Set-Location -Path $PSScriptRoot

Write-Host "== 1. git 설치 확인" -ForegroundColor Cyan
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
  Write-Host "git이 설치되어 있지 않습니다. https://git-scm.com/download/win 에서 설치 후 다시 실행하세요." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료"
  exit 1
}
git --version

Write-Host "== 2. 워크플로 파일 배치" -ForegroundColor Cyan
if (Test-Path ".\deploy.yml") {
  New-Item -ItemType Directory -Force -Path ".\.github\workflows" | Out-Null
  Move-Item -Force ".\deploy.yml" ".\.github\workflows\deploy.yml"
  Write-Host "   .github\workflows\deploy.yml 이동 완료"
} elseif (Test-Path ".\.github\workflows\deploy.yml") {
  Write-Host "   이미 배치됨 - 건너뜀"
} else {
  Write-Host "deploy.yml 을 찾을 수 없습니다." -ForegroundColor Red
  Read-Host "엔터를 누르면 종료"
  exit 1
}

Write-Host "== 3. 저장소 초기화" -ForegroundColor Cyan
if (-not (Test-Path ".\.git")) { git init | Out-Null }
git symbolic-ref HEAD refs/heads/main

Write-Host "== 4. 커밋" -ForegroundColor Cyan
if (-not (git config user.email)) { git config user.email "dev@minim.local" }
if (-not (git config user.name))  { git config user.name  "minim" }
git add -A
git commit -m "feat: MINIM. 반응형 패션 쇼핑몰 1차 구현" 2>&1 | Out-Host
git branch -M main

Write-Host "== 5. 원격 연결" -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin $repo
git remote -v

Write-Host "== 6. push (로그인 창이 뜨면 GitHub 계정으로 인증)" -ForegroundColor Cyan
git push -u origin main

Write-Host ""
Write-Host "=========================================" -ForegroundColor Green
Write-Host " push 완료" -ForegroundColor Green
Write-Host " 다음 단계 (웹에서 1회만):" -ForegroundColor Green
Write-Host " 1) https://github.com/wnsud5959/minim-shop/settings/pages"
Write-Host " 2) Source 를 'GitHub Actions' 로 변경"
Write-Host " 3) https://github.com/wnsud5959/minim-shop/actions 에서 배포 완료 확인"
Write-Host " 4) 접속 -> https://wnsud5959.github.io/minim-shop/"
Write-Host "=========================================" -ForegroundColor Green
Read-Host "엔터를 누르면 종료"
