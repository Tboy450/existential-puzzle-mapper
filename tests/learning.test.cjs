const test = require("node:test");
const assert = require("node:assert/strict");
const learning = require("../learning-core.js");
const engine = require("../simulation-core.js");
const values = (n) => new Array(learning.targets.length).fill(n);
const row = (changes, value) => ({ profile: learning.profile({ ...engine.defaults, ...changes }), values: values(value) });

test("learner uses recipe conditions, never seed, truth, run outcomes or private text as features", () => {
  const a = learning.profile({ ...engine.defaults, seed: 3, runs: 10 });
  const b = learning.profile({ ...engine.defaults, seed: 99, runs: 200 });
  assert.deepEqual(a, b);
  assert.deepEqual(Object.keys(a), ["access", "difficulty", "cooperation", "budget", "insight"]);
  assert.throws(() => learning.profile({ ...engine.defaults, truth: 7 }));
  assert.throws(() => learning.profile({ ...engine.defaults, difficulty: NaN }));
});

test("multi-output regression learns conditional differences rather than a constant average", () => {
  const train = [row({ access: 0 }, 0), row({ access: 10 }, 0), row({ access: 90 }, 1), row({ access: 100 }, 1)];
  const model = learning.fit(train, { maxDepth: 2, minLeaf: 1 });
  const baseline = learning.fit(train, { maxDepth: 0 });
  const heldout = [row({ access: 20 }, 0), row({ access: 80 }, 1)];
  assert.equal(learning.evaluate(model, heldout).overall, 0);
  assert.equal(learning.evaluate(baseline, heldout).overall, 0.5);
  assert.deepEqual(model, learning.fit(train, { maxDepth: 2, minLeaf: 1 }));
  assert.deepEqual(learning.predict(model, { ...engine.defaults, access: 80, seed: 123 }).values, values(1));
});

test("insight roles are categorical, not an ordered numeric scale", () => {
  const rows = [row({ insight: "call" }, 0), row({ insight: "trial" }, 1), row({ insight: "boon" }, 0)];
  const model = learning.fit(rows, { maxDepth: 1, minLeaf: 1 });
  assert.equal(model.feature, "insight");
  assert.equal(model.threshold, "trial");
  assert.equal(learning.evaluate(model, rows).overall, 0);
  assert.deepEqual(learning.splitUsage(model), { access: 0, difficulty: 0, cooperation: 0, budget: 0, insight: 1 });
});

test("minimum support, depth bounds and malformed targets fail safely", () => {
  const rows = [row({ access: 0 }, 0), row({ access: 100 }, 1)];
  assert.equal(learning.fit(rows, { minLeaf: 2 }).feature, undefined);
  assert.throws(() => learning.fit([]));
  assert.throws(() => learning.fit(rows, { maxDepth: 9 }));
  assert.throws(() => learning.fit([{ ...rows[0], values: values(NaN) }]));
  assert.throws(() => learning.fit([{ ...rows[0], values: [0.5] }]));
  assert.throws(() => learning.evaluate(learning.fit(rows), []));
});

test("repeated-series statistics retain sampling variation and denominators", () => {
  const stats = learning.summarizeSeries([values(0), values(5), values(10)], 10);
  assert.deepEqual(stats.values, values(0.5));
  assert.deepEqual(stats.minimum, values(0));
  assert.deepEqual(stats.maximum, values(1));
  assert.deepEqual(stats.sd, values(0.5));
  assert.throws(() => learning.summarizeSeries([values(11)], 10));
  assert.throws(() => learning.summarizeSeries([values(0.1)], 10));
  assert.throws(() => learning.summarizeSeries([], 10));
});

test("learned forecasts expose unsupported ranges rather than extrapolating silently", () => {
  const rows = [row({ access: 20, budget: 14, insight: "call" }, 0.1), row({ access: 80, budget: 18, insight: "trial" }, 0.9)];
  const bounds = learning.ranges(rows);
  assert.deepEqual(learning.outsideRange({ ...engine.defaults, access: 50, insight: "call" }, bounds), []);
  assert.deepEqual(learning.outsideRange({ ...engine.defaults, access: 0, budget: 40, insight: "boon" }, bounds), ["access", "budget", "insight"]);
  assert.throws(() => learning.ranges([]));
});

const study = require("../learning-results.js");

test("published study is complete, separated, source-matched and consistent with all repetition counts", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const crypto = require("node:crypto");
  assert.equal(learning.validateStudy(study), study);
  for (const [key, file] of [["engine", "simulation-core.js"], ["learner", "learning-core.js"], ["runner", "scripts/learn.cjs"]]) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/\r\n/g, "\n");
    assert.equal(crypto.createHash("sha256").update(source).digest("hex"), study.codeHashes[key], `${key} changed; run npm run learn`);
  }
  for (const series of study.series) {
    assert.equal(series.seeds.length, series.split === "test" ? 5 : 3);
    assert.equal(series.cases, { train: 40, validation: 60, test: 80 }[series.split]);
    assert.deepEqual(series.values, learning.summarizeSeries(series.counts, series.cases).values);
    for (const counts of series.counts) {
      for (let i = 0; i < engine.strategies.length; i++) {
        const [shared, monomyth, hierarchy, both] = counts.slice(i * 4, i * 4 + 4);
        assert.ok(both <= monomyth && both <= hierarchy && monomyth <= shared);
      }
    }
  }
});

test("frozen model and constant baseline reproduce from their actual selected training set", () => {
  const train = study.series.filter((r) => r.split === "train" && r.round <= study.selectedRound);
  const heldout = study.series.filter((r) => r.split === "test");
  assert.deepEqual(study.model, learning.fit(train, { maxDepth: study.depth, minLeaf: 6 }));
  assert.deepEqual(study.baseline, learning.fit(train, { maxDepth: 0 }));
  assert.deepEqual(study.testError, learning.evaluate(study.model, heldout));
  assert.deepEqual(study.baselineError, learning.evaluate(study.baseline, heldout));
  let previous = Infinity, selectedRound = 0;
  for (const round of study.rounds) {
    assert.equal(round.retained, round.candidateValidation.overall < previous - 1e-12);
    if (round.retained) { previous = round.candidateValidation.overall; selectedRound = round.round; }
    assert.equal(round.deployedCandidateRound, selectedRound);
    assert.equal(round.validation.overall, previous);
  }
  assert.equal(study.selectedRound, selectedRound);
  const validation = study.series.filter((r) => r.split === "validation");
  assert.deepEqual(study.rounds.at(-1).validation, learning.evaluate(study.model, validation));
});

test("samples from every split replay against the unchanged simulator", () => {
  for (const split of ["train", "validation", "test"]) {
    const records = study.series.filter((r) => r.split === split);
    for (const record of [records[0], records[Math.floor(records.length / 2)], records.at(-1)]) {
      for (const index of [0, record.seeds.length - 1]) {
        const result = engine.compare({ ...engine.defaults, ...record.profile, seed: record.seeds[index], runs: record.cases });
        const counts = result.cohorts.flatMap((cohort) => learning.metrics.map((metric) => cohort.summary.counts[metric]));
        assert.deepEqual(counts, record.counts[index]);
      }
    }
  }
});

test("study integrity rejects leaked recipes, leaked seeds, corrupt rates and incompatible models", () => {
  for (const change of [
    (s) => { s.engineVersion++; },
    (s) => { s.model.support++; },
    (s) => { s.selectedRound = 0; },
    (s) => { s.series[0].round = 4; },
    (s) => { s.series[0].values[0] = NaN; },
    (s) => { s.series[0].counts[0][0] = s.series[0].cases + 1; },
    (s) => { s.totalEpisodes++; },
    (s) => { s.testError.overall += 0.01; },
    (s) => { s.series.find((r) => r.split === "validation").profile = s.series[0].profile; },
    (s) => { s.series.find((r) => r.split === "test").seeds[0] = s.series[0].seeds[0]; },
    (s) => { s.ranges.budget[1] = 40; }
  ]) {
    const copy = structuredClone(study);
    change(copy);
    assert.throws(() => learning.validateStudy(copy));
  }
});
