@echo off
echo ============================================
echo     🚀 Upload MusixOne to GitHub (automated)
echo ============================================
echo.
set /p GITHUB_USER=Enter your GitHub username (default: jeremygs01):
if "%GITHUB_USER%"=="" set GITHUB_USER=jeremygs01
set /p GITHUB_TOKEN=Paste your GitHub Personal Access Token (will not be stored):
set REPO_NAME=musixone-app
echo.
echo Creating GitHub repo...
curl -u %GITHUB_USER%:%GITHUB_TOKEN% https://api.github.com/user/repos -d "{"name":"%REPO_NAME%","private":false}"
echo.
echo Initializing local repo...
git init
git add .
git commit -m "Initial commit - MusixOne by jeremygs01"
git branch -M main
echo.
echo Adding remote and pushing...
git remote add origin https://%GITHUB_USER%:%GITHUB_TOKEN%@github.com/%GITHUB_USER%/%REPO_NAME%.git
git push -u origin main
echo.
echo ✅ Done. Repo created at: https://github.com/%GITHUB_USER%/%REPO_NAME%
pause
