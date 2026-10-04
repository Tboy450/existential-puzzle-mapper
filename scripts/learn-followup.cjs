const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const engine = require("../simulation-core.js");
const learning = require("../learning-core.js");
const original = learning.validateStudy(require("../learning-results.js"));
const root = path.resolve(__dirname, "..");
const destination = path.join(root, "learning-followup.js");
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n")).digest("hex");
const insights = ["call", "trial", "boon"];
const clamp = (n, key) => Math.max(key === "budget" ? 8 : 0, Math.min(key === "budget" ? 40 : 100, n));
const oldTraining = original.series.filter((r) => r.split === "train");
const oldValidation = original.series.filter((r) => r.split === "validation");
const initialTraining = oldTraining.filter((r) => r.round === 1);
const oldKeys = new Set(original.series.map((r) => learning.profileKey(r.profile)));
const cache = new Map();
let episodes = 0;
for (const row of oldTraining) row.seeds.forEach((seed, i) =>
  cache.set(`${learning.profileKey(row.profile)}:${seed}:${row.cases}`, row.counts[i]));

function collect(profiles, split, round, seeds, cases, stratum) {
  return profiles.map((profile) => {
    const counts = seeds.map((seed) => {
      const key = `${learning.profileKey(profile)}:${seed}:${cases}`;
      if (!cache.has(key)) {
        const result = engine.compare({ ...engine.defaults, ...profile, seed, runs: cases, comparison: "roles" });
        cache.set(key, result.cohorts.flatMap((cohort) => learning.metrics.map((metric) => cohort.summary.counts[metric])));
        episodes += cases * engine.strategies.length;
      }
      return cache.get(key);
    });
    return { split, round, profile, seeds, cases, counts, values: learning.summarizeSeries(counts, cases).values,
      ...(stratum ? { stratum } : {}) };
  });
}
function unique(profiles, excluded = new Set()) {
  const found = new Map();
  for (const p of profiles) {
    const key = learning.profileKey(p);
    if (!excluded.has(key)) found.set(key, learning.profile(p));
  }
  return [...found.values()];
}
function choose(rows, validation, depths) {
  return depths.map((depth) => {
    const model = learning.fit(rows, { maxDepth: depth, minLeaf: 6 });
    return { model, depth, validation: learning.evaluate(model, validation) };
  }).sort((a, b) => a.validation.overall - b.validation.overall || a.depth - b.depth)[0];
}
const anchors = [
  ...engine.presets.map(({ access, difficulty, cooperation }) => ({ access, difficulty, cooperation, budget: 16 })),
  { access: 0, difficulty: 10, cooperation: 30, budget: 16 },
  { access: 100, difficulty: 60, cooperation: 90, budget: 16 }
];

console.log("Diagnosing original regressions without using original test outcomes.");
const originalRounds = original.rounds.map((round) => {
  const rows = oldTraining.filter((r) => r.round <= round.round);
  const added = rows.filter((r) => r.round === round.round);
  const model = learning.fit(rows, { maxDepth: round.candidateDepth, minLeaf: 6 });
  return {
    round: round.round, profiles: rows.length, depth: round.candidateDepth,
    addedByInsight: Object.fromEntries(insights.map((insight) => [insight, added.filter((r) => r.profile.insight === insight).length])),
    candidateTraining: learning.evaluate(model, rows),
    retainedOnSameTraining: learning.evaluate(original.model, rows),
    candidateOriginalTraining: learning.evaluate(model, initialTraining),
    validation: learning.evaluate(model, oldValidation),
    splitUsage: learning.splitUsage(model)
  };
});
// Hold recipe coverage fixed and give every recipe the same nine training seeds.
const commonSeeds = [...new Set(oldTraining.flatMap((r) => r.seeds))];
const repeatedSeries = oldTraining.flatMap((row) => collect([row.profile], "train", row.round, commonSeeds, row.cases));
const repeatControls = [1, 2, 3].map((round) => {
  const rows = repeatedSeries.filter((r) => r.round <= round);
  const candidate = choose(rows, oldValidation, [1, 2, 3, 4, 5, 6]);
  return { round, profiles: rows.length, depth: candidate.depth, validation: candidate.validation };
});

// Match the original addition counts, seeds and cases, but spread additions across anchors and roles.
const pairs = [["access", "difficulty"], ["access", "cooperation"], ["difficulty", "cooperation"], ["budget", "access"]];
const pools = anchors.flatMap((a) => insights.map((insight) => unique(pairs.flatMap(([aKey, bKey]) =>
  [-1, 1].flatMap((aSign) => [-1, 1].map((bSign) => ({
    ...a, insight,
    [aKey]: clamp(a[aKey] + aSign * (aKey === "budget" ? 1 : 5), aKey),
    [bKey]: clamp(a[bKey] + bSign * 5, bKey)
  })))), oldKeys)));
const coverageSeries = [], used = new Set(oldKeys);
let cursor = 0;
for (const round of [2, 3]) {
  const needed = original.rounds[round - 1].addedProfiles, profiles = [];
  let attempts = 0;
  while (profiles.length < needed) {
    if (++attempts > 10000) throw new Error("Insufficient distinct coverage-control recipes.");
    const pool = pools[cursor++ % pools.length];
    const p = pool.shift();
    if (!p || used.has(learning.profileKey(p))) continue;
    used.add(learning.profileKey(p)); profiles.push(p);
  }
  const reference = oldTraining.find((r) => r.round === round);
  coverageSeries.push(...collect(profiles, "train", round, reference.seeds, reference.cases));
}
const coverageControls = [2, 3].map((round) => {
  const rows = [...initialTraining, ...coverageSeries.filter((r) => r.round <= round)];
  const candidate = choose(rows, oldValidation, [1, 2, 3, 4, 5, 6]);
  return { round, profiles: rows.length, depth: candidate.depth, validation: candidate.validation };
});
const diagnosis = {
  method: "Original candidates are reconstructed, not confused with the retained model's trainingError. Nine-seed controls keep recipe coverage fixed and replace each recipe's three-seed estimate with the same nine training seeds. Coverage controls match addition counts, original training seeds, cases and depth search, but spread new recipes across six anchors and three insight roles instead of selecting only high residuals. These are fixed deterministic controls, not replicated randomized causal attribution. Original validation is reused diagnostically; original test outcomes are not used.",
  newEpisodes: episodes, commonSeeds,
  originalRounds, repeatControls, coverageControls,
  validation: oldValidation, repeatedSeries, coverageSeries
};
for (const row of originalRounds) console.log(`Original ${row.round}: validation ${(row.validation.overall * 100).toFixed(2)} pp; nine-seed control ${(repeatControls[row.round - 1].validation.overall * 100).toFixed(2)} pp.`);
for (const row of coverageControls) console.log(`Coverage control ${row.round}: ${(row.validation.overall * 100).toFixed(2)} pp.`);

// Specify all expansion splits and exclude every original or diagnostic recipe before collecting outcomes.
const excluded = new Set([...oldKeys, ...coverageSeries.map((r) => learning.profileKey(r.profile))]);
function grid(levels, budgets) {
  return levels.flatMap((access) => levels.flatMap((difficulty) => levels.flatMap((cooperation) =>
    budgets.flatMap((budget) => insights.map((insight) => ({ access, difficulty, cooperation, budget, insight }))))));
}
function nearby(delta) {
  return anchors.flatMap((a) => insights.flatMap((insight) => [-1, 1].map((sign) => ({
    access: clamp(a.access + sign * delta, "access"),
    difficulty: clamp(a.difficulty - sign * 2, "difficulty"),
    cooperation: clamp(a.cooperation + sign * 4, "cooperation"),
    budget: 16 + sign, insight
  }))));
}
function reserve(profiles) {
  const rows = unique(profiles, excluded);
  rows.forEach((p) => excluded.add(learning.profileKey(p)));
  return rows;
}
const trainProfiles = [
  reserve(grid([0, 50, 100], [8, 24, 40])),
  reserve(grid([15, 50, 85], [12, 24, 36])),
  reserve(grid([30, 50, 70], [16, 24, 32]))
];
const validationProfiles = { local: reserve(nearby(6)), broad: reserve(grid([8, 42, 92], [10, 22, 38])) };
const testProfiles = { local: reserve(nearby(4)), broad: reserve(grid([4, 46, 96], [9, 26, 39])) };
const seeds = {
  train: [[1011001, 1021001, 1031001], [1111001, 1121001, 1131001], [1211001, 1221001, 1231001]],
  validation: [2011001, 2021001, 2031001],
  test: [3011001, 3021001, 3031001, 3041001, 3051001]
};
const expansionStart = episodes;
const validation = Object.entries(validationProfiles).flatMap(([stratum, profiles]) =>
  collect(profiles, "validation", 0, seeds.validation, 60, stratum));
let training = [], selected = null;
const rounds = [];
for (let round = 1; round <= 3; round++) {
  training.push(...collect(trainProfiles[round - 1], "train", round, seeds.train[round - 1], 40));
  const candidate = choose(training, validation, [1, 2, 3, 4, 5, 6, 7, 8]);
  const retained = !selected || candidate.validation.overall < selected.validation.overall - 1e-12;
  if (retained) selected = { ...candidate, round };
  rounds.push({
    round, addedProfiles: trainProfiles[round - 1].length, trainingProfiles: training.length,
    candidateDepth: candidate.depth, candidateValidation: candidate.validation, retained,
    deployedCandidateRound: selected.round, validation: selected.validation,
    trainingError: learning.evaluate(selected.model, training)
  });
  console.log(`Expansion ${round}: ${training.length} training recipes; validation ${(candidate.validation.overall * 100).toFixed(2)} pp; ${retained ? "retained" : "previous candidate retained"}.`);
}
// Freeze the selected model before generating any fresh test outcomes.
const test = Object.entries(testProfiles).flatMap(([stratum, profiles]) => collect(profiles, "test", 0, seeds.test, 80, stratum));
const selectedTraining = training.filter((r) => r.round <= selected.round);
const baseline = learning.fit(selectedTraining, { maxDepth: 0 });
const benchmarks = ["local", "broad"].map((stratum) => {
  const rows = test.filter((r) => r.stratum === stratum);
  return { stratum, profiles: rows.length,
    expanded: learning.evaluate(selected.model, rows), constant: learning.evaluate(baseline, rows),
    original: learning.evaluate(original.model, rows),
    outsideOriginalRanges: rows.filter((r) => learning.outsideRange(r.profile, original.ranges).length).length
  };
});
const study = {
  format: "puzzle-learning-study", version: learning.version, engineVersion: engine.version,
  edition: "coverage-expansion-1",
  codeHashes: { engine: hash("simulation-core.js"), learner: hash("learning-core.js"), runner: hash("scripts/learn-followup.cjs"), original: hash("learning-results.js") },
  method: "Three balanced Cartesian-grid cycles, with equal representation of call, trial and boon. Axis levels 0/50/100, then 15/50/85, then 30/50/70; action budgets 8/24/40, then 12/24/36, then 16/24/32. Eight tree depths per cycle; minimum leaf size six. Select by reused validation MAE; reject worse candidates. Every original and diagnostic recipe is excluded. All expansion seeds are fresh. New local and broad test recipes are generated only after freezing selection. Test comparisons never control selection.",
  targetNote: "The broader grid is a harder, different evaluation distribution. Compare predictors on the same fresh test stratum, not the original 2.68 pp score against this study's overall score. The original predictor's out-of-range benchmark is an extrapolation stress test, not an available in-app forecast. No generator rules or detectors changed.",
  targets: learning.targets, selectedRound: selected.round, depth: selected.depth,
  totalEpisodes: episodes - expansionStart, newEpisodesIncludingDiagnosis: episodes,
  rounds, testError: learning.evaluate(selected.model, test), baselineError: learning.evaluate(baseline, test),
  ranges: learning.ranges(selectedTraining), splitUsage: learning.splitUsage(selected.model),
  model: selected.model, baseline, benchmarks, diagnosis, series: [...training, ...validation, ...test]
};
learning.validateStudy(study);
const { series, diagnosis: { validation: diagnosticValidation, repeatedSeries: repeated, coverageSeries: coverage, ...diagnosticMetadata }, ...metadata } = study;
const array = (rows) => `[\n${rows.map((row) => `    ${JSON.stringify(row)}`).join(",\n")}\n  ]`;
const content = `// Generated by npm run learn:followup; original study remains unchanged.\n(function (root) {\n  const study = ${JSON.stringify({ ...metadata, diagnosis: diagnosticMetadata }, null, 2)};\n  study.diagnosis.validation = ${array(diagnosticValidation)};\n  study.diagnosis.repeatedSeries = ${array(repeated)};\n  study.diagnosis.coverageSeries = ${array(coverage)};\n  study.series = ${array(series)};\n  if (typeof module === "object" && module.exports) module.exports = study;\n  else root.SimulationLearningFollowup = study;\n})(typeof globalThis !== "undefined" ? globalThis : this);\n`;
if (process.argv.includes("--check")) {
  if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n") !== content) {
    throw new Error("Follow-up study differs from a full rerun. Run npm run learn:followup.");
  }
  console.log("Follow-up reproduced exactly.");
} else fs.writeFileSync(destination, content);
console.log(`${study.totalEpisodes} expansion episodes; ${diagnosis.newEpisodes} new diagnostic episodes; ${study.newEpisodesIncludingDiagnosis} new episodes total.`);
console.log(`Fresh test: ${(study.testError.overall * 100).toFixed(2)} pp versus constant ${(study.baselineError.overall * 100).toFixed(2)} pp.`);
for (const row of benchmarks) console.log(`${row.stratum}: expanded ${(row.expanded.overall * 100).toFixed(2)} pp; original ${(row.original.overall * 100).toFixed(2)} pp; ${row.outsideOriginalRanges}/${row.profiles} outside original ranges.`);
