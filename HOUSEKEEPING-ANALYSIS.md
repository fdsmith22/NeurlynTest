# Neurlyn Housekeeping Analysis
**Generated:** 2025-10-12

## Executive Summary

**Current State:**
- 60+ markdown documentation files in root
- 43 diagnostic/test scripts in root directory
- 78 scripts in `/scripts` directory
- Significant duplication and historical artifacts

**Recommendations:**
- Archive 80% of documentation files
- Move/delete 43 diagnostic scripts from root
- Consolidate 30+ redundant scripts
- Retain only essential production and active development files

---

## 1. CORE PRODUCTION FILES (KEEP)

### Backend Core
- `backend.js` - Main Express server entry point
- `ecosystem.config.js` - PM2 deployment configuration

### Frontend Pages (Production)
- `index.html` - Landing page
- `free-assessment.html` - Free tier assessment interface
- `in-depth-assessment.html` - Paid tier comprehensive assessment
- `about.html` - About page
- `privacy.html` - Privacy policy
- `support.html` - Support page
- `sw.js` - Service worker for PWA

### Configuration Files
- `package.json` / `package-lock.json` - Dependencies
- `.env.example` - Environment template
- `.gitignore` - Git configuration
- `eslint.config.js` - ESLint v9 flat config
- `postcss.config.js` - CSS processing
- `webpack.config.optimized.js` - Production webpack config
- `playwright.config.js` - E2E test configuration

### Core Directories (Production)
```
/api              - API route handlers
/assessments      - Assessment logic
/config           - Configuration files
/js               - Frontend JavaScript
/middleware       - Express middleware
/models           - MongoDB Mongoose models
/routes           - Express routes
/services         - Core business logic
/styles           - CSS stylesheets
/utils            - Utility functions
/assets           - Static assets
```

### Essential Scripts (Keep in /scripts)
- `seed-master-questions.js` - Primary question seeding
- `seed-complete-expanded-questions.js` - Expanded questions
- `verify-setup.js` - System verification
- `check-requirements.js` - Requirements checker (just fixed!)
- `check-database.js` - Database health check
- `optimize-mongodb-indexes.js` - DB optimization

---

## 2. ESSENTIAL DOCUMENTATION (KEEP)

### User-Facing Documentation
- ✅ `README.md` - Project overview
- ✅ `SETUP-CHECKLIST.md` - Setup instructions
- ✅ `DEVELOPMENT.md` - Development guide
- ✅ `API_REFERENCE.md` - API documentation

### Production Documentation
- ✅ `PRODUCTION_CHECKLIST.md` - Deployment guide
- ✅ `MONITORING.md` - Monitoring setup
- ✅ `GITHUB_SECRETS_SETUP.md` - CI/CD secrets
- ✅ `TESTING-GUIDE.md` - Testing instructions
- ✅ `USER-TESTING-GUIDE.md` - User testing procedures

### Current Implementation Reference
- ✅ `PHASE-1-DESIGN-SYSTEM-IMPLEMENTATION-COMPLETE.md` - Design system foundation
- ✅ `PHASE-2-SECTION-IMPROVEMENTS-COMPLETE.md` - Report sections phase 2
- ✅ `PHASE-3-ADDITIONAL-SECTIONS-COMPLETE.md` - Report sections phase 3
- ✅ `PHASE-4-ADVANCED-SECTIONS-COMPLETE.md` - Report sections phase 4
- ✅ `REPORT-DESIGN-OPTIMIZATION-COMPLETE-SUMMARY.md` - Overall design summary
- ✅ `DESIGN-OPTIMIZATION-QUICK-REFERENCE.md` - Quick reference guide

**Total to Keep:** 16 documentation files

---

## 3. DOCUMENTATION TO ARCHIVE/DELETE (44 files)

### Historical Implementation Docs (Archive to /docs/archive/)
These document completed work that's no longer actively referenced:

1. `ADAPTIVE-SYSTEM-OPTIMIZATION-COMPLETE.md`
2. `ALL-ISSUES-FIXED-SUMMARY.md`
3. `ASSESSMENT-DATA-INTEGRITY-ANALYSIS.md`
4. `ASSESSMENT-ENHANCEMENT-EXECUTIVE-SUMMARY.md`
5. `ASSESSMENT-SESSION-BUG-FIXES.md`
6. `ASSESSMENT-SYSTEM-VALIDITY-REPORT.md`
7. `CLINICAL-ADDON-IMPLEMENTATION-DETAILED.md`
8. `CLINICAL-ASSESSMENT-FIX-VALIDATED.md`
9. `CLINICAL-ASSESSMENT-INTEGRATION.md`
10. `COMPETITIVE-ANALYSIS-AND-RECOMMENDATIONS.md`
11. `COMPREHENSIVE-ALGORITHM-ANALYSIS.md`
12. `COMPREHENSIVE-ASSESSMENT-GAP-ANALYSIS.md`
13. `COMPREHENSIVE-REPORT-AUDIT-FINDINGS.md`
14. `COMPREHENSIVE-REPORT-STRUCTURE-ANALYSIS.md`
15. `CORRECTED-SYSTEM-EFFICACY-ANALYSIS.md`
16. `CRITICAL-BUGS-FIXED-2025-10-07.md`
17. `DATABASE-CONFIGURATION-FIX-SUMMARY.md`
18. `ENHANCED-INTELLIGENCE-IMPLEMENTATION-COMPLETE.md`
19. `FACET-DATA-FIX-COMPLETE.md`
20. `FACET-FIX-VALIDATION-REPORT.md`
21. `FINAL-CORRECTED-SYSTEM-ANALYSIS.md`
22. `FLOW-ANALYSIS-SUMMARY.md`
23. `IMPLEMENTATION-PLAN.md`
24. `IMPLEMENTATION-TRACKING.md`
25. `INTELLIGENT-ADAPTIVE-SYSTEM-PROPOSAL.md`
26. `INTELLIGENT-SELECTOR-IMPLEMENTATION-SUMMARY.md`
27. `ORDER-OF-MAGNITUDE-INTELLIGENCE-IMPROVEMENTS.md`
28. `PHASE-1-IMPLEMENTATION-COMPLETE.md` (superseded by design system doc)
29. `PHASE-1-INTELLIGENT-ASSESSMENT-IMPLEMENTATION.md`
30. `PHASE-1-PROGRESS-SUMMARY.md`
31. `PHASE-2-IMPLEMENTATION-COMPLETE.md` (superseded)
32. `PHASE-2-IMPLEMENTATION-PLAN.md`
33. `PHASE-3-IMPLEMENTATION-COMPLETE.md` (superseded)
34. `PHASE-3-IMPLEMENTATION-PLAN.md`
35. `QUESTION-VALIDATION-COMPLETE.md`
36. `REPORT-DESIGN-OPTIMIZATION-TRACKER.md`
37. `REPORT-SYNTHETIC-DATA-FIX-PLAN.md`
38. `REPORT-VALIDATION-FIXES-SUMMARY.md`
39. `SYSTEM-COMPARISON-VISUALIZATION.md`
40. `SYSTEM-EFFICACY-DEEP-ANALYSIS.md`
41. `SYSTEM-OPTIMIZATION-COMPLETE.md`
42. `SYSTEM_OPTIMIZATION_REPORT.md`
43. `TACTFUL-ASSESSMENT-IMPLEMENTATION-SUMMARY.md`
44. `TACTFUL-BASELINE-PROPOSAL.md`
45. `TEST-RUN-ANALYSIS-REPORT.md`
46. `TIER-RESTRUCTURING-IMPLEMENTATION-SUMMARY.md`
47. `VALIDATION-FINAL-REPORT.md`

**Action:** Move to `/docs/archive/2025-implementation-history/`

---

## 4. ROOT-LEVEL DIAGNOSTIC SCRIPTS TO REMOVE (43 files)

These are one-off debugging/analysis scripts that should be deleted or moved:

### Analysis Scripts (DELETE - purpose served)
1. `analyze-assessment-differences.js`
2. `analyze-baseline-detailed.js`
3. `analyze-baseline-questions.js`
4. `analyze-new-assessment.js`
5. `analyze-question-bank-depth.js`
6. `analyze-responses.js`
7. `analyze-test-run.js`
8. `comprehensive-question-audit.js`
9. `comprehensive-report-audit.js`

### Debug Scripts (DELETE - one-off debugging)
10. `debug-adaptive.js`
11. `debug-exact-report-calc.js`
12. `debug-neurodiversity-data.js`
13. `debug-response-structure.js`
14. `debug-score-mismatch.js`
15. `diagnose-report.js`

### Check/Validation Scripts (DELETE or CONSOLIDATE)
16. `check-db-status.js`
17. `check-question.js`
18. `check-sensory-correlations.js`
19. `check-sensory-questions.js`

### Fix Scripts (DELETE - fixes already applied)
20. `extract-phases.js`
21. `fix-attachment-question.js`
22. `fix-database-issues.js`
23. `fix-true-double-negatives.js`

### Inspection/Validation Scripts (DELETE)
24. `inspect-questions.js`
25. `scan-negative-frequency-questions.js`
26. `validate-all-questions.js`
27. `verify-instruments.js`

### Test Scripts (MOVE to /tests/)
28. `test-adaptive-question-selection.js`
29. `test-baseline-analysis-depth.js`
30. `test-clinical-scorers.js`
31. `test-comprehensive-flow-analysis.js`
32. `test-comprehensive-reports.js`
33. `test-cross-pathway-nuance-validation.js`
34. `test-ef-scoring.js`
35. `test-new-pdf-generation.js`
36. `test-paid-comprehensive-enhanced.js`
37. `test-proper-assessment-flow.js`
38. `test-real-sensory.js`
39. `test-report-layers.js`
40. `test-suite-with-real-questions.js`
41. `test-visualizations-close.js`

### Test HTML Pages (DELETE or CONSOLIDATE)
42. `comprehensive-test-suite.html`
43. `run-test-suite.html`
44. `test-changes.html`

### Other One-Off Scripts (DELETE)
45. `enhanced-psychological-insights.js`
46. `psychological-research-database-complete.js`
47. `puppeteer-assessment-tester.js`

---

## 5. /scripts DIRECTORY CLEANUP (78 → ~25 files)

### Keep (Essential Production Scripts)
1. ✅ `seed-master-questions.js` - Primary seeding
2. ✅ `seed-complete-expanded-questions.js` - Expanded seeding
3. ✅ `verify-setup.js` - Setup verification
4. ✅ `check-requirements.js` - Requirements check
5. ✅ `check-database.js` - DB health
6. ✅ `optimize-mongodb-indexes.js` - DB optimization
7. ✅ `test-adaptive-assessment.js` - Adaptive system testing
8. ✅ `verify-adaptive-system.js` - Adaptive verification
9. ✅ `export-all-questions.js` - Question export utility

### Archive (Historical Question Management - 50+ files)
Move to `/scripts/archive/question-management/`:

**Add/Seed Scripts:**
- `add-5-baseline-questions.js`
- `add-comprehensive-baseline.js`
- `add-comprehensive-questions.js`
- `add-diagnostic-weights.js`
- `add-gateway-questions.js`
- `add-lateral-questions.js`
- `add-missing-sensory-questions.js`
- `add-soft-probe-questions.js`
- `seed-communication-processing-questions.js`
- `seed-complete-baseline-and-facets.js`
- `seed-neo-facet-questions.js`
- `seed-phase1-clinical-questions.js`
- `seed-phase2-comprehensive.js`
- `seed-phase2-questions.js`
- `seed-phase3-comprehensive.js`

**Analysis Scripts:**
- `analyze-and-tag-question-tiers.js`
- `analyze-database-state.js`
- `analyze-facet-distribution.js`
- `analyze-question-wording.js`
- `analyze-report-sections.js`
- `analyze-trait-mapping.js`
- `comprehensive-coverage-analysis.js`
- `deep-question-analysis.js`
- `display-gap-analysis-summary.js`

**Audit Scripts:**
- `audit-clinical-questions.js`
- `check-all-baseline.js`
- `check-assessment-structure.js`
- `check-autism-questions.js`
- `check-baseline-reverse-scoring.js`
- `check-frequency-questions.js`
- `check-neurlyn-test-db.js`
- `check-responses-array.js`
- `check-sensory-active.js`

**Enhancement Scripts:**
- `enhance-all-questions-metadata.js`
- `enhance-neurodiversity-metadata.js`
- `apply-sensitivity-metadata.js`
- `tag-ef-sensory-questions.js`
- `tag-question-sensitivity-v2.js`
- `tag-question-sensitivity.js`
- `tag-questions-with-tiers.js`

**Fix Scripts:**
- `fix-audit-response-type.js`
- `fix-gad7-response-type.js`
- `fix-phq9-response-type.js`
- `fix-question-answer-types.js`
- `fix-question-diversity.js`
- `fix-question-grammar.js`
- `fix-reverse-scoring.js`
- `fix-stigmatizing-language.js`
- `fix-untagged-questions.js`
- `update-phq9-question.js`

**Validation Scripts:**
- `validate-baseline-questions.js`
- `validate-question-answer-types.js`
- `validate-question-coverage.js`
- `validate-question-metadata.js`
- `verify-neurodiversity-scores.js`
- `verify-tactful-filtering.js`
- `verify-test-run-tier-filtering.js`
- `verify-tier-assignments.js`
- `find-phq9-question.js`
- `diagnose-archetype-repetition.js`

**Total to Archive:** ~60 files

---

## 6. OTHER CLEANUP ITEMS

### Archived Seeds (Already in subdirectory - KEEP)
```
/scripts/archived-seeds/
  - seed-all-expanded-questions.js
  - seed-all-questions.js
  - seed-database.js
```

### JSON Reports (DELETE or MOVE to /docs/reports/)
- `database-analysis-report.json`
- `database-question-analysis.json`
- `test-assessment-report.json`
- `test-full-assessment-report.json`
- `tier-assignments-report.json`

### Webpack Config (CONSOLIDATE)
- Keep: `webpack.config.optimized.js` (current production config)
- Delete: `webpack.config.js` (if outdated)

### ESLint Config (CONSOLIDATE)
- Keep: `eslint.config.js` (v9 flat config)
- Delete: `.eslintrc.js` (legacy format)

### Playwright Config (KEEP all 3)
- `playwright.config.js` - Default
- `playwright.config.ci.js` - CI environment
- `playwright.config.critical.js` - Critical tests only

---

## 7. PROPOSED DIRECTORY STRUCTURE AFTER CLEANUP

```
/home/freddy/Neurlyn/
├── backend.js                         ← Production entry point
├── ecosystem.config.js                ← PM2 config
│
├── index.html                         ← Landing page
├── free-assessment.html
├── in-depth-assessment.html
├── about.html / privacy.html / support.html
├── sw.js
│
├── package.json / package-lock.json
├── .env.example
├── .gitignore
├── eslint.config.js                   ← Keep v9
├── postcss.config.js
├── webpack.config.optimized.js        ← Keep production
├── playwright.config.js (+ CI/critical)
│
├── /api/                              ← Production code
├── /assessments/
├── /config/
├── /js/
├── /middleware/
├── /models/
├── /routes/
├── /services/
├── /styles/
├── /utils/
├── /assets/
│
├── /scripts/                          ← Essential scripts only (9 files)
│   ├── seed-master-questions.js
│   ├── seed-complete-expanded-questions.js
│   ├── verify-setup.js
│   ├── check-requirements.js
│   ├── check-database.js
│   ├── optimize-mongodb-indexes.js
│   ├── test-adaptive-assessment.js
│   ├── verify-adaptive-system.js
│   ├── export-all-questions.js
│   │
│   └── /archive/                      ← Historical scripts
│       └── /question-management/
│
├── /tests/                            ← All test files
│   ├── /unit/
│   ├── /integration/
│   ├── /performance/
│   └── /fixtures/
│
├── /docs/                             ← All documentation
│   ├── /archive/
│   │   └── /2025-implementation-history/  ← 44 historical docs
│   └── /reports/                      ← JSON analysis reports
│
├── README.md                          ← 16 essential docs
├── SETUP-CHECKLIST.md
├── DEVELOPMENT.md
├── API_REFERENCE.md
├── PRODUCTION_CHECKLIST.md
├── MONITORING.md
├── TESTING-GUIDE.md
├── USER-TESTING-GUIDE.md
├── GITHUB_SECRETS_SETUP.md
├── PHASE-1-DESIGN-SYSTEM-IMPLEMENTATION-COMPLETE.md
├── PHASE-2-SECTION-IMPROVEMENTS-COMPLETE.md
├── PHASE-3-ADDITIONAL-SECTIONS-COMPLETE.md
├── PHASE-4-ADVANCED-SECTIONS-COMPLETE.md
├── REPORT-DESIGN-OPTIMIZATION-COMPLETE-SUMMARY.md
└── DESIGN-OPTIMIZATION-QUICK-REFERENCE.md
```

---

## 8. CLEANUP ACTIONS SUMMARY

| Category | Current | After Cleanup | Action |
|----------|---------|---------------|--------|
| **Root MD Files** | 60 | 16 | Archive 44 to `/docs/archive/` |
| **Root Diagnostic Scripts** | 43 | 0 | Delete 43 files |
| **Scripts Directory** | 78 | 9 | Archive 60+ to `/scripts/archive/` |
| **Total File Reduction** | 181 | 25 | **Remove 156 files from root/scripts** |

### Estimated Space Savings
- Documentation: ~5-10 MB
- Scripts: ~2-3 MB
- **Total:** ~8-13 MB
- **Mental overhead reduction:** MASSIVE

---

## 9. RECOMMENDED EXECUTION PLAN

### Phase 1: Create Archive Structure
```bash
mkdir -p docs/archive/2025-implementation-history
mkdir -p docs/reports
mkdir -p scripts/archive/question-management
```

### Phase 2: Archive Documentation (44 files)
```bash
# Move historical implementation docs
mv ADAPTIVE-SYSTEM-OPTIMIZATION-COMPLETE.md docs/archive/2025-implementation-history/
mv ALL-ISSUES-FIXED-SUMMARY.md docs/archive/2025-implementation-history/
# ... (repeat for all 44 files)
```

### Phase 3: Delete Root Diagnostic Scripts (43 files)
```bash
# Delete analysis scripts
rm analyze-*.js
rm debug-*.js
rm diagnose-*.js
rm check-db-status.js check-question.js check-sensory-*.js
rm fix-*.js extract-phases.js
rm inspect-questions.js scan-*.js validate-all-questions.js verify-instruments.js
rm test-*.js test-*.html
rm comprehensive-test-suite.html run-test-suite.html
rm enhanced-psychological-insights.js psychological-research-database-complete.js
rm puppeteer-assessment-tester.js
```

### Phase 4: Archive Scripts Directory (60+ files)
```bash
cd scripts
# Move all add-*/seed-*/analyze-*/audit-*/check-*/enhance-*/fix-*/tag-*/validate-*/verify-* files
mv add-*.js archive/question-management/
mv seed-communication-*.js seed-complete-baseline-*.js seed-neo-*.js seed-phase*.js archive/question-management/
# ... (all other archived scripts)
```

### Phase 5: Move JSON Reports
```bash
mv *.json docs/reports/ 2>/dev/null || true
```

### Phase 6: Consolidate Configs
```bash
# Verify eslint.config.js is active, then:
rm .eslintrc.js

# If webpack.config.js is outdated:
# rm webpack.config.js
```

---

## 10. VALIDATION CHECKLIST

After cleanup, verify:

- [ ] `npm run dev` still works
- [ ] `npm run seed` still works
- [ ] `npm run verify` still works
- [ ] `npm run check:requirements` still works
- [ ] `npm test` still works
- [ ] `npm run build` still works
- [ ] All production pages load correctly
- [ ] Backend connects to MongoDB
- [ ] Essential documentation still accessible

---

## 11. BENEFITS

### Developer Experience
- **90% reduction in root clutter** (16 docs vs 60)
- **100% cleaner scripts directory** (9 vs 78)
- Easier onboarding for new developers
- Clear separation of production vs historical files

### Repository Health
- Smaller clone size
- Faster file searches
- Better IDE performance
- Cleaner git history presentation

### Maintenance
- Easier to identify what's actively maintained
- Clear audit trail of historical decisions (archived)
- No confusion about which scripts to run

---

## 12. RISK MITIGATION

**Before deleting anything:**
1. ✅ Create git branch: `git checkout -b housekeeping-cleanup`
2. ✅ Commit current state: `git add -A && git commit -m "Pre-cleanup snapshot"`
3. ✅ Archive (don't delete) documentation
4. ✅ Test thoroughly after each phase
5. ✅ Keep this analysis file for reference

**Recovery:** If anything breaks, `git checkout main` restores everything.

---

## CONCLUSION

Current repository has accumulated significant development artifacts. This cleanup will:
- Remove 156 files from root and scripts directories
- Maintain 100% of essential functionality
- Archive (not delete) all historical documentation
- Result in a clean, professional, production-ready repository

**Recommendation:** Execute cleanup in phases with testing between each phase.
