# Customizations Log

Track all fork modifications for conflict resolution during `git pull upstream master`

## Git Setup
```bash
origin   → https://github.com/WebDevRes/umami
upstream → https://github.com/umami-software/umami
```

---

## Change Log

### 2025-11-04 - Initial Setup
**Files:**
- `CLAUDE.md` - AI rules & architecture
- `CUSTOMIZATIONS.md` - This file
- `FORK-README.md` - Fork docs
- `GIT-WORKFLOW.md` - Git cheatsheet
- `.env.example` - Env template
- `.gitignore:42` - Added `!.env.example`

**Merge Strategy:**
- New files → no conflicts expected
- `.gitignore` → keep both (upstream + line 42)

---

## Adding New Customizations

```markdown
### YYYY-MM-DD - Feature Name
**Files:** path/to/file.ts - description
**Changes:** what & why
**Merge Strategy:** conflict handling
```

Mark custom code:
```typescript
// CUSTOM: reason
code...
// END CUSTOM
```

## Custom Features

- None yet

## Known Issues

- None yet
