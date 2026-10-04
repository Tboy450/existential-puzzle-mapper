# Learning regression notes

Recorded 2026-10-04. These are synthetic model-development results, not evidence about an ideology or private experience.

## What got worse

The later **predictors**, not the simulated participants, performed worse on the original validation set. Average absolute prediction error rose from **2.47 to 2.67 to 3.02 percentage points**. The application correctly retained the first model.

The stored original `trainingError` refers to the **retained** model evaluated on the growing training set. It must not be mistaken for each rejected candidate's fitting error. Reconstruction gives:

| Original cycle | Candidate on its training set | Retained model on that same set | Candidate on original training set | Candidate validation |
|---|---:|---:|---:|---:|
| 1 | 2.78 pp | 2.78 pp | 2.78 pp | 2.47 pp |
| 2 | 2.62 pp | 3.94 pp | 2.64 pp | 2.67 pp |
| 3 | 2.90 pp | 5.25 pp | 3.09 pp | 3.02 pp |

The candidate fit the added difficult examples better than the retained model, but generalized worse to the original validation distribution. Cycle 3 also lost accuracy on the original training recipes. Calling all of this simply "overfitting" would hide the change in coverage and fitting priorities.

The largest target-level regression was **interchangeable-role hierarchy occurrence**: its validation error rose from **2.93 to 3.70 to 4.91 pp**. Standard-policy overlap error rose from 4.23 to 5.86 pp. Not every target worsened: reciprocal and unordered shared-outcome predictions improved slightly by cycle 3.

## What changed in the sampling

The first cycle contained 52 call, 52 trial and 52 boon recipes. The added recipes were **14/14/26** in cycle 2 and **14/7/28** in cycle 3. Thus boon received 54 of the 103 additions. The residual-only selection also increasingly targeted budget-sensitive tails: added budgets extended from 13-19 to 12-20, whereas initial training covered 14-18.

The fitted trees changed accordingly. Budget splits increased from zero to four to six; access splits decreased from three to two by cycle 3. These counts describe the fitted trees, not causal feature importance. They are consistent with limited tree capacity being redirected toward the newly emphasized examples.

## Controls actually run

All controls use **original validation**, never original test outcomes. The candidate depth search and minimum leaf size remain the same as the first study.

| Original cycle | Original sampling, three seeds per recipe | Same recipe coverage, nine common seeds | Spread coverage, matched added run count |
|---|---:|---:|---:|
| 1 | 2.47 pp | 2.27 pp | Same starting set |
| 2 | 2.67 pp | 2.80 pp | 2.40 pp |
| 3 | 3.02 pp | 2.77 pp | 2.46 pp |

The nine-seed control gives every recipe all nine original training seeds, rather than its own cycle's three seeds. It reduces some sampling variation, but **does not remove the later regression**. More repetitions did not automatically fix it; this does not rule out remaining sampling noise.

The coverage control keeps the initial 156 recipes and matches the original 54 and 49 additions, seed groups, cases per seed, and model search. Instead of following only the largest residuals, it spreads additions across six anchors and three roles. Its additions total **35 call, 34 trial, 34 boon**. It avoids the marked regression, although 2.40 versus 2.47 pp is too small to claim a robust universal improvement from this one reused validation set.

These controls support a **coverage and model-capacity trade-off**. They do not isolate role balance from all other changes in the selected settings, prove a single cause, or supply a confidence interval. Repeated randomized sampling-policy comparisons would be needed for stronger attribution.

## Expansion without overwriting the first study

Three further cycles use balanced Cartesian grids rather than residual-only additions:

| Expansion cycle | Access, difficulty and cooperation levels | Action budgets | Cumulative training recipes | Candidate validation |
|---|---|---|---:|---:|
| 1 | 0, 50, 100 | 8, 24, 40 | 243 | 8.30 pp |
| 2 | 15, 50, 85 | 12, 24, 36 | 483 | 7.90 pp |
| 3 | 30, 50, 70 | 16, 24, 32 | 720 | 7.06 pp |

Each grid includes all three insight placements. Duplicate and previously used recipes are excluded. Training uses three seeds and 40 cases per policy; validation uses three different seeds and 60 cases; test uses five further seeds and 80 cases. All expansion seeds are new. Eight tree depths are compared using validation, with six recipes minimum per leaf.

The 279 validation recipes contain local probes plus a broad grid. The **273 final test recipes** contain 30 local probes and 243 broad-grid probes; boundary-clamped duplicates are removed before collection. No original, diagnostic, training or validation recipe enters the fresh test. Final test outcomes are collected only after the final model is frozen. The original model is unchanged.

The expanded study's overall fresh-test error is **5.26 pp**, versus **19.87 pp** for its constant-average baseline. That is not a regression from the old 2.68 pp test score: these are different, broader test settings. The meaningful comparison uses the same new test recipes for both fixed models:

| Fresh test stratum | Recipes | Expanded model | Original model |
|---|---:|---:|---:|
| Local probes, within original ranges | 30 | 8.34 pp | 4.50 pp |
| Broad grid, outside original ranges | 243 | 4.88 pp | 17.09 pp |

**Broader coverage improved broad-condition predictions but reduced local precision.** Keep the original model as the default; the expanded model is an explicit option. The original broad-grid benchmark is extrapolation for diagnosis only, not permission to remove the original forecast range guard. Selection was frozen before these tests; no model or routing rule was retuned using their results.

There were **298,080 new diagnostic policy runs** plus **983,280 expansion runs**, totaling **1,281,360 new runs**. Reused original counts are not counted as new runs. These are paired synthetic episodes, not independent observations about the world.

## Reproduce and inspect

- Original artifact: `learning-results.js`, preserved byte-for-byte.
- Follow-up artifact: `learning-followup.js`, including controls, seed-level counts, models, source hashes, benchmark strata, and all expansion series.
- Run `npm run learn:followup` to regenerate, or `npm run learn:followup:check` to reproduce it exactly.
- In Simulations, expand the regression review and choose the original or expanded study. Either study supports seed replay and export; switching models never changes observed simulation counts or saved maps.

The simulator, detector definitions and learner implementation were not changed. Next methodological work should separate sampling balance, tail coverage and tree capacity in replicated controlled comparisons, while preserving a fresh holdout for any new model-selection procedure.
