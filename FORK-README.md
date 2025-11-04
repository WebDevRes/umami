# Umami Fork

Custom fork of [umami-software/umami](https://github.com/umami-software/umami)

## Git Setup

```bash
origin   → https://github.com/WebDevRes/umami (your fork)
upstream → https://github.com/umami-software/umami (official)

# Sync workflow
git pull upstream master  # Get updates
git push origin master    # Push to fork
```

## Customization Rules

1. New features → new files/modules (avoid editing core)
2. If editing core → minimal changes + mark with `// CUSTOM: reason`
3. Document all changes in `CUSTOMIZATIONS.md`
4. Test after upstream merge

## Docs

- [CLAUDE.md](./CLAUDE.md) - AI rules & architecture
- [CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md) - Change log
- [GIT-WORKFLOW.md](./GIT-WORKFLOW.md) - Git cheatsheet
- [Official Docs](https://umami.is/docs)

## Quick Start

```bash
npm install
cp .env.example .env
npm run build-db
npm run dev
```
