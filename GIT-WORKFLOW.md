# Git Workflow

## Remotes
```bash
origin   → https://github.com/WebDevRes/umami
upstream → https://github.com/umami-software/umami
```

## Daily Commands

```bash
# Work cycle
git add .
git commit -m "msg"
git push

# Get upstream updates
git pull upstream master
git push origin master

# Check status
git status
git diff
git log --oneline -10

# Branches
git checkout -b feature-name
git merge feature-name
```

## Conflict Resolution

```bash
git pull upstream master
# If conflicts:
# 1. Check CUSTOMIZATIONS.md
# 2. Edit files, resolve <<<>>> markers
git add .
git commit
git push
```

## Useful

```bash
git stash / git stash pop
git reset --soft HEAD~1
git fetch upstream && git log master..upstream/master
git blame <file>
```

## Nuclear Reset
```bash
# Discard ALL custom changes
git fetch upstream
git reset --hard upstream/master
git push origin master --force
```
