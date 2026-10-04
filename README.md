# Existential Puzzle Mapper

Live site: https://tboy450.github.io/existential-puzzle-mapper/ (deployed from `dist/` on every push to `main`).

This folder contains a standalone exploratory mapping program generated from `Note 123.pdf`.

Open `index.html` in a browser. It links to the downloaded PDF and the extracted transcript, then keeps the optional references in a separate "Reference Lenses" section.

The site opens on the interactive map and includes a `Project` tab that defines the static website, its section boundaries, and the clean separation model.

The "Next Steps" tab is a separate action layer. Those entries are optional continuation moves, not source claims, final answers, or reference authorities.

The "Pattern Lab" tab is a future-facing workbench for non-standard pattern sets such as signal residue, contradiction knots, attractor basins, shadow options, negative-space traces, and other collection lenses. These are candidate data structures, not conclusions. Some pattern sets are families with multiple possible instances.

The "Term Key" tab defines the project's vocabulary and mapping technology with plain descriptions, intended use, and what each term should not be confused with.

## Simulation test progress and findings

**Progress snapshot: 2026-10-04. Further scientific testing is paused at this checkpoint.**

### Progress

The project now has a reproducible process for comparing structures, investigating unexpected results, and preserving competing findings. Six learning cycles plus diagnostic controls account for **1,562,640 recorded simulated policy runs**. These are paired synthetic episodes, not independent observations about the world.

The [live workbench](https://tboy450.github.io/existential-puzzle-mapper/#simulations) supports four policies, call/trial/boon insight placement, repeated-seed comparisons, event-trace replay, separately selectable forecast models, and downloadable results. Original results remain available alongside the expansion.

### Findings

**Structural occurrence and useful outcomes can vary separately.** In the interchangeable-role policy, changing insight placement from boon to trial produced the following averages:

| Measurement | Boon placement | Trial placement |
|---|---:|---:|
| Hierarchy occurrence | 62.5% | 22.5% |
| Shared outcome achieved | 89.2% | 90.8% |
| Monomyth-like occurrence | 2.5% | 2.5% |

This comparison used three seeds with 40 cases each, holding gated clues at 50%, investigation failure at 35%, cooperation at 65%, and the action budget at 16. Within these rules, substantially different structural behavior accompanied similar outcome rates.

**The later original rounds produced useful information, not simply failure.** Their predictors became less accurate on the original validation cases: average error rose from 2.47 to 2.67 to 3.02 percentage points. Training increasingly emphasized difficult examples and boon placement. Nine-seed controls did not remove that regression; spreading the same added run count across conditions reduced it, with later errors of 2.40 and 2.46 points. This supports a coverage and model-capacity trade-off, without establishing one isolated cause.

**Broader prediction coverage came with reduced local precision.** On the same fresh test cases, mean absolute forecast errors were:

| Test conditions | Original predictor | Expanded predictor |
|---|---:|---:|
| Near original conditions | **4.50 points** | 8.34 points |
| Broad conditions | 17.09 points (extrapolation) | **4.88 points** |

The original predictor was outside its studied ranges on all broad-grid cases. That comparison is an extrapolation diagnostic, not an endorsed forecast. These are errors of the predictors, not scores of the competing ideologies or structural policies.

### Conclusion

**No universal winning structure has been established. The project has demonstrated a process for finding and examining conditional differences.** Different arrangements can produce similar outcomes, and a result that challenges an earlier model can be valuable rather than something to discard.

The original and expanded predictors remain available separately, with the original as the default because it retained better local precision. Retaining that predictor does not establish the original conceptual framework as more correct. The findings concern the stated synthetic rules, not real-world ideological prevalence, and all results are preserved for the next testing phase.

See [LEARNING-NOTES.md](LEARNING-NOTES.md) for the reconstructed errors, control designs, expansion results, and interpretation limits.

## Simulation workbench

Open **Simulations** (or the site's `#simulations` link). Start with **Mixed access**, leave the seed fixed, and run the comparison. The four policies use the same synthetic worlds:

- **Standard journey:** a call, departure, evidence gathering, checked gain, and return/share, with prerequisites enforced. Matches are calibration, not discoveries.
- **Interchangeable roles:** investigate or check before committing to the call; the ordering is not required.
- **Reciprocal inquiry:** favor peer evidence exchange, without requiring a hero's departure or ranked permission for exchanges.
- **Unordered control:** choose among available actions without narrative prerequisites. This is still a policy, not a model-free explanation.

Insight/gnosis placement is a working part of the process: **call** introduces an initial, possibly wrong claim; **trial** proposes one after the first clue; **boon** waits for all three clues. The standard policy still waits for all clues before checking; other policies can check earlier. Changing placement changes available evidence and actions, not only labels.

Each world contains a synthetic solution among eight candidates and three truthful binary clues. Investigations, access requests, exchanges, checks, and sharing spend actions. Rejected claims are removed without establishing their opposite. A verified private gain and a successfully shared outcome are counted separately. The on-screen rules document the deliberately simple probabilities and assumptions.

Results show counts and denominators for a narrow monomyth-like sequence, an actual two-level access-request chain, their overlap, and neither. Conditional rates compare hierarchy **inside and outside** the sequence signature, using the appropriate group denominator. Other detectors look for distributed evidence leading to a shared gain, a gain before a later call, and successful revision after rejection. Detectors link to numbered trace events. Partial or budget-exhausted journeys are outside the complete sequence signature, not automatically alternative ideologies. An access chain is not a detector of Gnostic belief or cosmological truth.

Use **open vs. gated access** to compare polarized conditions while holding the other settings fixed. Inspect both successes and unfinished cases, examine paired differences against the standard policy, change one setting, and repeat with another seed. The experiment is a way to develop and question processes, not a simulation of the entire philosophical puzzle or proof of a worldview. There is no AI-generated narrative, private-data input, network request, or empirical prevalence estimate in the simulator.
Policy comparisons change several rules together; identifying a single causal mechanism needs a further controlled comparison.

The last completed recipe is saved separately under `existential-puzzle-simulation-v1`. **Export experiment** includes the engine version, recipe, definitions, aggregate counts, and paired outcomes. **Import & replay** validates the recipe and recomputes all traces and counts rather than trusting reported results. Map JSON and experiment JSON are distinct formats. Editing controls marks the current results as stale until rerun.
An unreadable saved recipe is left untouched on startup and copied to `existential-puzzle-simulation-v1-damaged` before a new run replaces it. Storage failures remain visible and do not prevent exporting the completed comparison.

**Add this comparison to map** creates an explicitly synthetic custom piece linked to Pattern Lab (or the selected piece in an imported map). It includes the recipe and selected policy, participates in normal map save/export/recovery, and never increments the Pattern Lab's real-observation counts. Results are not posted to GitHub or shared with anyone automatically.

Engine and detector behavior are versioned in `simulation-core.js` and covered by `tests/simulation.test.cjs`. Changing simulation rules requires a new engine version before accepting old recipes as reproducible.

### Repeated learning study

Expand **Learning study** in Simulations to inspect three completed learning cycles. A small, dependency-free multi-output regression tree learns 16 rates: shared outcomes, monomyth-like occurrence, hierarchy occurrence, and their overlap for each policy. It uses only access, investigation difficulty, cooperation, budget, and categorical insight placement. Seeds, hidden solutions, traces, private text, and real observations are not prediction features. This is an approximation of the existing synthetic generator, not validation of an ideology.

The study uses six starting anchors (four presets plus open/independent and gated/supportive conditions), all three insight placements, and a budget of 16. Initial training perturbs one numeric setting by 10 percentage points, or budget by 2. Validation uses separate 5-point or 1-action variations. Final tests use combined nearby variations and entirely separate seeds. Repeated training runs use 3 seeds with 40 cases per policy; validation uses 3 with 60; final test uses 5 with 80. Policies share worlds within a seed, so the total is **paired policy runs**, not independent observations.

Each cycle selects among six tree depths using validation mean absolute error. The next two cycles add small variations around the eight largest **training** residuals; they never add validation or test recipes. Validation is reused for selection, and a worse candidate is rejected. Final test outcomes are generated only after selection, with equal weight per recipe and target. The constant-average baseline uses the same training recipes as the retained model. The simulator's rules and occurrence definitions are unchanged, and no target ideology frequency is rewarded.

The published study contains **433 recipes and 281,280 policy runs**: 259 training, 138 validation, and 36 test recipes. Cycle 1's depth-5 model was retained; cycles 2 and 3 worsened validation error rather than improving it. The retained model uses the initial 156 training recipes. Final test error averages **2.68 percentage points**, versus **13.13** for the constant training-mean predictor. Shared-outcome predictions have the largest average error (4.45 points); individual policy/metric comparisons can perform worse than the baseline. Full per-target errors are included in the study export.

Use the study selectors to inspect means, seed ranges, sample standard deviations, and individual seed counts, then **Replay this studied seed** to reproduce its event traces. Seed ranges are descriptive, not confidence intervals. **Export full learning study** saves every recipe, count, seed, model, selection round, and code hash in a separate `puzzle-learning-study` format; it is not a single-experiment import.

Completed experiments also show a separately labeled **Learned forecast versus this simulation run**. Forecasts use the completed recipe (including each cohort's access), never dirty controls, and never replace actual counts. Unsupported settings suppress forecasts while leaving simulations usable. Studied numeric ranges are access 0-100%, difficulty 0-90%, cooperation 20-100%, and budget 14-18; all three insight placements are covered. These bounds do not imply coverage of all combinations. Held-out results test nearby variations under this generator, not broad extrapolation or real-world prevalence.

Run `npm run learn` to regenerate the complete deterministic study. `npm run learn:check` reruns all three cycles and compares the artifact exactly. Source hashes and replay samples are checked by the normal tests, so changing the engine, learner, or runner requires regenerating the report. Regenerate `dist` afterward. The app does not train online, upload data, change the saved map, or turn synthetic findings into logged observations.

### Regression review and broader follow-up

The original later-cycle regression is recorded in [LEARNING-NOTES.md](LEARNING-NOTES.md) and the workbench's **Why did the original later forecasts get worse?** panel. Reconstructed candidate errors distinguish them from the retained model's training error. Nine-seed controls keep recipe coverage fixed; matched-run coverage controls spread additions across anchors and insight roles. More repetitions alone did not remove the regression, while spread coverage reduced it. This supports a coverage/model-capacity trade-off, not a uniquely proven cause.

Three additional balanced-grid cycles expand studied access, difficulty and cooperation to 0-100% and budgets to 8-40. They use fresh training, validation and test seeds, exclude all earlier recipes, and freeze selection before generating the new test outcomes. The follow-up adds **1,281,360 policy runs**, including diagnostics. Expansion validation error falls from **8.30 to 7.90 to 7.06 pp**; fresh-test error is **5.26 pp** versus a **19.87 pp** constant baseline.

Broader does not mean universally better: on the same fresh local probes, the original model scores **4.50 pp** versus **8.34 pp** for the expanded model. On the broad grid, the expanded model scores **4.88 pp**; the original's **17.09 pp** is an out-of-range stress test only. The original remains the default. The **Study and forecast model** selector explicitly switches reports and forecasts without changing recipes, simulated counts, or saved maps. Both studies retain seed replay and export. Neither covers every combination accurately; see the same-test comparison and limitations before interpreting a forecast.

`learning-results.js` is preserved, and `learning-followup.js` stores the follow-up separately. Run `npm run learn:followup`, or `npm run learn:followup:check` for exact reproduction. Its export includes diagnostic validation data, nine-seed counts, matched-run control counts, all expansion series, and source hashes. Simulator rules, occurrence detectors, and the underlying learner are unchanged.

Pattern and answer-vector fit uses an editorial scale: Unassessed, Tentative, Moderate, or Strong. The Pattern Lab and Term Key explain the rubric. These categories describe conceptual relevance; all bundled candidates have zero logged observations. The lab currently provides collection prompts and a schema; observation entry is future work.

The map supports content-aware Fit Map, extended zoom, wheel/trackpad panning, two-finger touch pan/pinch on the graph, and dynamic Pan X / Pan Y sliders matched to the graph contents. Fit Map can zoom below 12% when needed to show a wide layout on a small screen. Card actions center and zoom into their mapped piece for readable inspection without changing its stored coordinates.

The map uses provenance rings: the core signal is in the centre, then source puzzles and barriers, then reference lenses (dashed ring), then moves, outcomes, and risks, with added pieces outermost (the Rings legend in the map corner lists them). Distance from the centre means distance from the PDF source; within each ring, pieces sit near the pieces they connect to. Panning and zooming never move nodes. Dragging a piece pulls its connected pieces along, then the map settles and stops; Reset Layout restores the rings, and Fit Map shows the whole map.

Files:

- `index.html` - app shell
- `styles.css` - interface styling
- `data.js` - PDF-derived map data, objectives, scenarios, source anchors, and separated references
- `app.js` - graph, inspector, scenario, objective, next-step, export, and local custom-piece behavior
- `map-core.js` - shared model validation, routing, storage recovery, and snapshot helpers
- `simulation-core.js` - seeded synthetic event engine, role policies, detectors, and comparisons
- `simulation-ui.js` - experiment controls, evidence inspection, separate persistence, replay, and map integration
- `learning-core.js` - regression-tree learner, held-out evaluation, repeated-seed summaries, and range guards
- `learning-results.js` - generated reproducible study, fitted model, and all aggregate repetition counts
- `scripts/learn.cjs` - three-cycle synthetic study and deterministic reproduction check
- `learning-followup.js` - preserved regression controls, expanded study, and fresh same-test comparisons
- `scripts/learn-followup.cjs` - regression reconstruction and three balanced expansion cycles
- `LEARNING-NOTES.md` - measured regressions, control results, interpretation limits, and expansion trade-offs
- `Note 123.pdf` - source PDF downloaded from the Quick Share link
- `note_123_extracted.txt` - raw text extracted from the PDF

The complete current map and node positions are saved in browser local storage. Existing v1 custom pieces are restored automatically. Failed saves produce a visible message and preserve session changes; use Export JSON to keep them. The previous action is recoverable even after a reload, including the first change to a fresh map. A damaged save is retained under `existential-puzzle-map-v2-damaged` when replaced, while valid backups remain recoverable. Browser storage is tied to the site origin, so opening the local HTML and using a hosted copy use separate saves.

Export JSON includes the model, source anchors, types, all definition collections, custom-piece IDs, and layout diagnostics. Import JSON validates a snapshot before replacing the map and persists the imported model. The source PDF and transcript are separate files, not embedded in JSON. Older exports are accepted by filling their missing fields from this bundled map; the UI reports that fallback. Unsupported versions, duplicate IDs, missing references, invalid coordinates, and oversized files are rejected.

Use the inspector to edit or delete a custom piece. Use Connect Pieces to connect the selected node to another existing node; added connections can be removed in the inspector. Restore previous save recovers the previous action or saved snapshot. Restore original map resets the content and layout to the bundled version after confirmation. Original source nodes cannot be edited or deleted through the custom-piece controls. If an imported content card references a custom piece, deletion is blocked with an explanation; update those JSON references first to avoid erasing provenance.

Keyboard: use Left/Right, Home/End in the tab list, Tab to reach graph nodes and card buttons, and Enter/Space to select a node or open a card on the map. Drag nodes to position them, or drag empty graph space to pan. Search and layer filters apply to both the graph and Nearby Routes; routes show one shortest path per reachable target, up to five targets and four relationships deep.

Development requires Node.js 22 or later and no installed packages:

```sh
npm start          # http://127.0.0.1:4173
npm test           # validation, snapshots, routes, storage recovery, lifecycle tests
npm run learn      # repeat the three-cycle synthetic learning study
npm run learn:check # reproduce the published study exactly
npm run learn:followup # diagnose regressions and repeat the broader expansion
npm run learn:followup:check # reproduce the complete follow-up exactly
npm run build      # copy the root source files and source documents to dist/
npm run verify     # tests plus a check that dist/ matches the root sources
```

Edit root files only; `dist/` is the generated deployment copy used by Sites hosting. Run `npm run build` before publishing. The GitHub verification workflow rejects an out-of-date deployment copy. Building does not publish the site.
