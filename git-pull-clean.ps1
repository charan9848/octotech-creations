# Git Pull and Clean Script
# This script pulls the latest changes from Git and removes any untracked files

Write-Host "Checking Git status..." -ForegroundColor Yellow
git status

Write-Host "`nPulling latest changes from Git..." -ForegroundColor Yellow
git pull

Write-Host "`nChecking if repository is up to date..." -ForegroundColor Yellow
$gitStatus = git status --porcelain

if ($gitStatus) {
    Write-Host "Repository has uncommitted changes. Cleaning untracked files..." -ForegroundColor Cyan
    git clean -fd
    Write-Host "Untracked files removed successfully!" -ForegroundColor Green
} else {
    Write-Host "Repository is clean and up to date!" -ForegroundColor Green
    # Still check for untracked files and clean them
    $untrackedFiles = git ls-files --others --exclude-standard
    if ($untrackedFiles) {
        Write-Host "Found untracked files. Cleaning them..." -ForegroundColor Cyan
        git clean -fd
        Write-Host "Untracked files removed successfully!" -ForegroundColor Green
    } else {
        Write-Host "No untracked files found." -ForegroundColor Green
    }
}

Write-Host "`nFinal Git status:" -ForegroundColor Yellow
git status

Write-Host "`nGit pull and cleanup completed!" -ForegroundColor Green