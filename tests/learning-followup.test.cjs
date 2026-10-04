const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const engine = require("../simulation-core.js");
const learning = require("../learning-core.js");
const original = require("../learning-results.js");
const followup = require("../learning-followup.js");
const originalTraining = original.series.filter((r) => r.split === "train");
const initial = originalTraining.filter((r) => r.round === 1);
const diagnosis = followup.diagnosis;
const profileKeys = (rows) => new Set(rows.map((r) => learning.profileKey(r.profile)));
const episodes = (rows) => rows.reduce((sum, r) => sum + r.cases * r.seeds.length * engine.strategies.length, 0);

test("follow-up matches its sources and preserves the separately versioned original study", () => {
  assert.equal(learning.validateStudy(original), original);
  assert.equal(learning.validateStudy(followup), followup);
  for (const [key, file] of [["engine", "simulation-core.js"], ["learner", "learning-core.js"],
    ["runner", "scripts/learn-followup.cjs"], ["original", "learning-results.js"]]) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/\r\n/g, "\n");
    assert.equal(crypto.createHash("sha256").update(source).digest("hex"), followup.codeHashes[key]);
  }
  assert.equal(followup.codeHashes.engine, original.codeHashes.engine);
  assert.equal(followup.codeHashes.learner, original.codeHashes.learner);
});

test("expanded train, validation and test inputs exclude all prior recipes and seeds", () => {
  const usedKeys = profileKeys([...original.series, ...diagnosis.coverageSeries]);
  const usedSeeds = new Set(original.series.flatMap((r) => r.seeds));
  for (const row of followup.series) {
    assert.ok(!usedKeys.has(learning.profileKey(row.profile)));
    assert.ok(row.seeds.every((seed) => !usedSeeds.has(seed)));
    assert.equal(row.seeds.length, row.split === "test" ? 5 : 3);
    assert.equal(row.cases, { train: 40, validation: 60, test: 80 }[row.split]);
    assert.deepEqual(row.values, learning.summarizeSeries(row.counts, row.cases).values);
  }
  for (const round of [1, 2, 3]) {
    const rows = followup.series.filter((r) => r.split === "train" && r.round === round);
    const sizes = ["call", "trial", "boon"].map((role) => rows.filter((r) => r.profile.insight === role).length);
    assert.equal(sizes[0], sizes[1]); assert.equal(sizes[1], sizes[2]);
  }
});

test("candidate errors are reconstructed separately from retained-model errors", () => {
  assert.deepEqual(diagnosis.validation, original.series.filter((r) => r.split === "validation"));
  for (const row of diagnosis.originalRounds) {
    const training = originalTraining.filter((r) => r.round <= row.round);
    const model = learning.fit(training, { maxDepth: row.depth, minLeaf: 6 });
    assert.deepEqual(row.candidateTraining, learning.evaluate(model, training));
    assert.deepEqual(row.retainedOnSameTraining, learning.evaluate(original.model, training));
    assert.deepEqual(row.candidateOriginalTraining, learning.evaluate(model, initial));
    assert.deepEqual(row.validation, original.rounds[row.round - 1].candidateValidation);
    assert.deepEqual(row.validation, learning.evaluate(model, diagnosis.validation));
    assert.deepEqual(row.splitUsage, learning.splitUsage(model));
  }
});

test("nine-seed controls hold coverage fixed and retain all original count observations", () => {
  assert.deepEqual(profileKeys(diagnosis.repeatedSeries), profileKeys(originalTraining));
  assert.equal(diagnosis.commonSeeds.length, 9);
  for (const row of diagnosis.repeatedSeries) {
    const reference = originalTraining.find((r) => learning.profileKey(r.profile) === learning.profileKey(row.profile));
    assert.deepEqual(row.seeds, diagnosis.commonSeeds);
    assert.equal(row.round, reference.round);
    assert.deepEqual(row.values, learning.summarizeSeries(row.counts, row.cases).values);
    reference.seeds.forEach((seed, i) => assert.deepEqual(row.counts[row.seeds.indexOf(seed)], reference.counts[i]));
  }
  for (const row of diagnosis.repeatControls) {
    const training = diagnosis.repeatedSeries.filter((r) => r.round <= row.round);
    const model = learning.fit(training, { maxDepth: row.depth, minLeaf: 6 });
    assert.deepEqual(row.validation, learning.evaluate(model, diagnosis.validation));
  }
});

test("coverage controls match additions, seed groups and case counts without holdout leakage", () => {
  const oldKeys = profileKeys(original.series);
  for (const round of [2, 3]) {
    const additions = diagnosis.coverageSeries.filter((r) => r.round === round);
    const reference = originalTraining.find((r) => r.round === round);
    assert.equal(additions.length, original.rounds[round - 1].addedProfiles);
    for (const row of additions) {
      assert.deepEqual(row.seeds, reference.seeds);
      assert.equal(row.cases, reference.cases);
      assert.ok(!oldKeys.has(learning.profileKey(row.profile)));
      assert.deepEqual(row.values, learning.summarizeSeries(row.counts, row.cases).values);
    }
    const training = [...initial, ...diagnosis.coverageSeries.filter((r) => r.round <= round)];
    const control = diagnosis.coverageControls[round - 2];
    const model = learning.fit(training, { maxDepth: control.depth, minLeaf: 6 });
    assert.deepEqual(control.validation, learning.evaluate(model, diagnosis.validation));
  }
  const sizes = ["call", "trial", "boon"].map((role) => diagnosis.coverageSeries.filter((r) => r.profile.insight === role).length);
  assert.deepEqual(sizes, [35, 34, 34]);
  const additionalRepeats = episodes(diagnosis.repeatedSeries) - episodes(originalTraining);
  assert.equal(diagnosis.newEpisodes, additionalRepeats + episodes(diagnosis.coverageSeries));
  assert.equal(followup.totalEpisodes, episodes(followup.series));
  assert.equal(followup.newEpisodesIncludingDiagnosis, followup.totalEpisodes + diagnosis.newEpisodes);
});

test("expanded model selection and same-test trade-offs reproduce without mixing benchmark strata", () => {
  const training = followup.series.filter((r) => r.split === "train" && r.round <= followup.selectedRound);
  const validation = followup.series.filter((r) => r.split === "validation");
  assert.deepEqual(followup.model, learning.fit(training, { maxDepth: followup.depth, minLeaf: 6 }));
  assert.deepEqual(followup.baseline, learning.fit(training, { maxDepth: 0 }));
  assert.deepEqual(followup.rounds.at(-1).validation, learning.evaluate(followup.model, validation));
  let previous = Infinity;
  for (const row of followup.rounds) {
    assert.equal(row.retained, row.candidateValidation.overall < previous - 1e-12);
    if (row.retained) previous = row.candidateValidation.overall;
    assert.equal(row.validation.overall, previous);
  }
  for (const row of followup.benchmarks) {
    const cases = followup.series.filter((r) => r.split === "test" && r.stratum === row.stratum);
    assert.equal(cases.length, row.profiles);
    assert.deepEqual(row.expanded, learning.evaluate(followup.model, cases));
    assert.deepEqual(row.original, learning.evaluate(original.model, cases));
    assert.deepEqual(row.constant, learning.evaluate(followup.baseline, cases));
    assert.equal(row.outsideOriginalRanges, cases.filter((r) => learning.outsideRange(r.profile, original.ranges).length).length);
  }
  const [local, broad] = followup.benchmarks;
  assert.ok(local.original.overall < local.expanded.overall, "Preserve the original model rather than silently replacing its local behavior");
  assert.ok(broad.expanded.overall < broad.original.overall);
});

test("fresh expansion and diagnostic sample counts replay against the original engine", () => {
  const groups = [
    ...["train", "validation", "test"].map((split) => followup.series.filter((r) => r.split === split)),
    diagnosis.repeatedSeries, diagnosis.coverageSeries
  ];
  for (const group of groups) {
    for (const row of [group[0], group.at(-1)]) {
      const result = engine.compare({ ...engine.defaults, ...row.profile, runs: row.cases, seed: row.seeds.at(-1) });
      assert.deepEqual(result.cohorts.flatMap((c) => learning.metrics.map((metric) => c.summary.counts[metric])), row.counts.at(-1));
    }
  }
});
