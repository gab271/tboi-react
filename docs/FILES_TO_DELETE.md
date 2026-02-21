# 🗑️ Files Deleted During Cleanup

> Documentation of all files that were deleted during the refactoring process

---

## ✅ Root Directory Files (DELETED)

### JavaScript Files (Extraction/Analysis Scripts)
- [x] `ADDITIONAL_QUALITY_WIKI_EXTRACTED.js`
- [x] `analyze_extracted_items.js`
- [x] `compare_items.js`
- [x] `COMPLETE_TBOI_ITEMS_EXTRACTED.js`
- [x] `COMPLETE_TBOI_QUALITY_EXTRACTED.js`
- [x] `extract_all_items_tboi.js`
- [x] `fix_characters_images.js`
- [x] `MASSIVE_QUALITY_DATABASE.js`
- [x] `NEW_ITEMS_TO_ADD.js`
- [x] `OFFICIAL_QUALITY_VALUES.js`
- [x] `REPENTANCE_HIGHLIGHTS.js`

### Lua Files (Game Data Files)
- [x] `items_ab_plus.lua`
- [x] `items_base.lua`
- [x] `items_rep.lua`

### JSON Files
- [x] `items_temp.json`

### SQL Files (Database Scripts)
- [x] `supabase_add_columns.sql`
- [x] `supabase_add_pools_column_final.sql`
- [x] `supabase_add_pools_column.sql`
- [x] `supabase_add_stats_column.sql`
- [x] `supabase_admin_setup.sql`
- [x] `supabase_auth.sql`
- [x] `supabase_codex_setup.sql`
- [x] `supabase_fix_policies_overlap.sql`
- [x] `supabase_fix_security_warnings.sql`
- [x] `supabase_fix_warnings.sql`
- [x] `supabase_schema.sql`

### Markdown Reports
- [x] `EXTRACTION_REPORT.md`
- [x] `ITEMS_CORRECTION_REPORT.md`
- [x] `ITEMS_DATABASE_FIX_REPORT.md`
- [x] `ITEMS_FIX_REPORT.md`
- [x] `REPORTE_FINAL_VERIFICACION.md`
- [x] `SETUP_ADMIN.md`

### Other Files
- [x] `tsconfig.json` (unused root config)
- [x] `TBOI HD Sprites v3.zip` (large asset archive)

---

## ✅ scripts/ Directory (DELETED ENTIRE FOLDER)

23 one-time database scripts were removed:
- `add_missing_actives.js`
- `add_missing_items_complete.js`
- `analyze_actives.js`
- And 20 more...

---

## ✅ backend/scripts/ Directory (DELETED ENTIRE FOLDER)

85+ one-time scripts were removed including:
- Database seeders
- Data fixers
- Migration scripts
- Validation scripts

---

## ✅ backend/data/ Directory - Backups (DELETED)

19 backup JSON files were removed:
- [x] `items.seed.BACKUP.json`
- [x] `items.seed.BACKUP_1769534982528.json`
- [x] All other BACKUP_*.json files
- [x] `items.seed.FIXED.json`
- [x] `items.seed.ORIGINAL.json`

### Files Kept
- `bosses.seed.json` - Active seed data
- `items.seed.json` - Active seed data

---

## ✅ backend/ Directory - Misc Files (DELETED)

- [x] `MISSING_SPRITES_LIST.txt`
- [x] `missing.txt`

---

## Summary

| Location | Files Deleted | Status |
|----------|--------------|--------|
| Root | 32 files | ✅ Done |
| scripts/ | 23 files | ✅ Done |
| backend/scripts/ | 85+ files | ✅ Done |
| backend/data/ | 19 backups | ✅ Done |
| backend/ misc | 2 files | ✅ Done |

**Total files deleted: ~160 files**
