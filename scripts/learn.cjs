const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const engine = require("../simulation-core.js");
const learning = require("../learning-core.js");
const root = path.resolve(__dirname, "..");
const destination = path.join(root, "learning-results.js");

const anchors = [
  ...engine.presets.map(({ access, difficulty, cooperation }) => ({ access, difficulty, cooperation, budget: 16 })),
  { access: 0, difficulty: 10, cooperation: 30, budget: 16 },
  { access: 100, difficulty: 60, cooperation: 90, budget: 16 }
];
const insights = ["call", "trial", "boon"];
const seeds = {
  train: [[11011, 21011, 31011], [111011, 121011, 131011], [211011, 221011, 231011]],
  validation: [41011, 51011, 61011],
  test: [71011, 81011, 91011, 101011, 151011]
};
const clamp = (value, key) => Math.min(key === "budget" ? 40 : 100, Math.max(key === "budget" ? 8 : 0, value));
function vary(p, key, delta) { return { ...p, [key]: clamp(p[key] + delta, key) }; }
function unique(profiles, excluded = new Set()) {
  const found = new Map();
  for (const p of profiles) {
    const key = learning.profileKey(p);
    if (!excluded.has(key)) found.set(key, learning.profile(p));
  }
  return [...found.values()];
}
const bases = anchors.flatMap((a) => insights.map((insight) => ({ ...a, insight })));
const initial = unique(bases.flatMap((p) => [p, ...["access", "difficulty", "cooperation", "budget"].flatMap((key) =>
  [-1, 1].map((sign) => vary(p, key, sign * (key === "budget" ? 2 : 10))))]));
const trainKeys = new Set(initial.map(learning.profileKey));
const validationProfiles = unique(bases.flatMap((p) =>
  ["access", "difficulty", "cooperation", "budget"].flatMap((key) =>
    [-1, 1].map((sign) => vary(p, key, sign * (key === "budget" ? 1 : 5))))), trainKeys);
const reserved = new Set([...trainKeys, ...validationProfiles.map(learning.profileKey)]);
const testProfiles = unique(bases.flatMap((p) => [
  vary(vary(vary(p, "access", 3), "cooperation", -7), "budget", 1),
  vary(vary(vary(p, "difficulty", 7), "cooperation", 3), "budget", -1)
]), reserved);
const evaluationKeys = new Set([...validationProfiles, ...testProfiles].map(learning.profileKey));
let episodes = 0;

function collect(profiles, split, round, repeatSeeds, cases) {
  return profiles.map((p) => {
    const counts = repeatSeeds.map((seed) => {
      const result = engine.compare({ ...engine.defaults, ...p, seed, runs: cases, comparison: "roles" });
      episodes += cases * engine.strategies.length;
      return result.cohorts.flatMap((cohort) => learning.metrics.map((metric) => cohort.summary.counts[metric]));
    });
    return { split, round, profile: p, seeds: repeatSeeds, cases, counts,
      values: learning.summarizeSeries(counts, cases).values };
  });
}
function refinements(rows, model) {
  const excluded = new Set([...evaluationKeys, ...rows.map((r) => learning.profileKey(r.profile))]);
  const ranked = rows.map((row) => ({ row, error: learning.evaluate(model, [row]).overall }))
    .sort((a, b) => b.error - a.error);
  return unique(ranked.slice(0, 8).flatMap(({ row }) =>
    ["access", "difficulty", "cooperation", "budget"].flatMap((key) =>
      [-1, 1].map((sign) => vary(row.profile, key, sign * (key === "budget" ? 1 : 5))))), excluded);
}
const hash = (file) => crypto.createHash("sha256").update(fs.readFileSync(path.join(root, file), "utf8").replace(/\r\n/g, "\n")).digest("hex");

console.log(`Learning study: three cycles, ${initial.length} initial recipes, ${validationProfiles.length} validation recipes, ${testProfiles.length} reserved test recipes.`);
const validation = collect(validationProfiles, "validation", 0, seeds.validation, 60);
let training = [], selected = null;
const rounds = [];
for (let round = 1; round <= 3; round++) {
  const additions = round === 1 ? initial : refinements(training, selected.model);
  training = training.concat(collect(additions, "train", round, seeds.train[round - 1], 40));
  const candidates = [1, 2, 3, 4, 5, 6].map((depth) => {
    const model = learning.fit(training, { maxDepth: depth, minLeaf: 6 });
    return { model, depth, validation: learning.evaluate(model, validation), round };
  });
  candidates.sort((a, b) => a.validation.overall - b.validation.overall || a.depth - b.depth);
  const candidate = candidates[0];
  const accepted = !selected || candidate.validation.overall < selected.validation.overall - 1e-12;
  if (accepted) selected = candidate;
  rounds.push({ round, addedProfiles: additions.length, trainingProfiles: training.length,
    candidateDepth: candidate.depth, candidateValidation: candidate.validation, retained: accepted,
    deployedCandidateRound: selected.round, validation: selected.validation,
    trainingError: learning.evaluate(selected.model, training) });
  console.log(`Cycle ${round}: +${additions.length} recipes; candidate validation error ${(100 * candidate.validation.overall).toFixed(2)} pp; ${accepted ? "retained" : "previous candidate retained"}.`);
}

// Test outcomes are generated only after the final candidate has been selected.
const test = collect(testProfiles, "test", 0, seeds.test, 80);
const selectedTraining = training.filter((row) => row.round <= selected.round);
const baseline = learning.fit(selectedTraining, { maxDepth: 0 });
const testError = learning.evaluate(selected.model, test);
const baselineError = learning.evaluate(baseline, test);
const study = {
  format: "puzzle-learning-study", version: learning.version, engineVersion: engine.version,
  codeHashes: { engine: hash("simulation-core.js"), learner: hash("learning-core.js"), runner: hash("scripts/learn.cjs") },
  method: "Deterministic multi-output regression tree. Six candidate depths per cycle, selected by validation mean absolute error. Two refinement cycles add small perturbations around the eight largest TRAINING residuals. Validation is reused for selection; final test recipes and seeds are disjoint and evaluated once after selection. All four targets are weighted equally. No ideology frequency is rewarded and simulator rules are unchanged.",
  targetNote: "Learned forecasts approximate this synthetic generator, not real-world frequencies, causality, or truth. Each recipe has equal evaluation weight. A repeated-seed range is not a confidence interval.",
  targets: learning.targets, selectedRound: selected.round, depth: selected.depth,
  totalEpisodes: episodes, rounds, testError, baselineError,
  ranges: learning.ranges(selectedTraining), splitUsage: learning.splitUsage(selected.model),
  model: selected.model, baseline, series: [...training, ...validation, ...test]
};
learning.validateStudy(study);
const { series, ...metadata } = study;
const content = `// Generated by npm run learn; do not edit.\n(function (root) {\n  const study = ${JSON.stringify(metadata, null, 2)};\n  study.series = [\n${series.map((row) => `    ${JSON.stringify(row)}`).join(",\n")}\n  ];\n  if (typeof module === "object" && module.exports) module.exports = study;\n  else root.SimulationLearningStudy = study;\n})(typeof globalThis !== "undefined" ? globalThis : this);\n`;
if (process.argv.includes("--check")) {
  if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8").replace(/\r\n/g, "\n") !== content) {
    throw new Error("Stored learning study differs from a full reproducible rerun. Run npm run learn.");
  }
  console.log("Learning study reproduced exactly.");
} else {
  fs.writeFileSync(destination, content);
  console.log("Saved learning-results.js.");
}
console.log(`Final test error: ${(100 * testError.overall).toFixed(2)} pp; constant training-mean baseline: ${(100 * baselineError.overall).toFixed(2)} pp.`);
console.log(`${episodes} synthetic policy episodes; ${training.length} training, ${validation.length} validation, ${test.length} test recipes.`);
