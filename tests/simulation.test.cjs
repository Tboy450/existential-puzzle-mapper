const test = require("node:test");
const assert = require("node:assert/strict");
const sim = require("../simulation-core.js");
const config = (changes = {}) => ({ ...sim.defaults, runs: 12, ...changes });

test("simulation recipes reject missing, oversized, noninteger and unknown inputs", () => {
  for (const changes of [{ runs: 0 }, { runs: 201 }, { budget: 41 }, { seed: -1 }, { seed: 4294967296 },
    { access: NaN }, { difficulty: 1.2 }, { cooperation: "50" }, { insight: "truth" }, { comparison: "beliefs" }, { extra: true }]) {
    assert.throws(() => sim.compare(config(changes)));
  }
  assert.throws(() => sim.compare({}));
  assert.throws(() => sim.simulate(config(), "missing"));
  assert.throws(() => sim.simulate(config(), "standard", -1));
});

test("same recipe reproduces every event; policies share worlds rather than different random inputs", () => {
  const a = sim.compare(config());
  assert.deepEqual(sim.compare(config()), a);
  for (const cohort of a.cohorts) {
    assert.deepEqual(cohort.runs.map((r) => r.world), a.cohorts[0].runs.map((r) => r.world));
  }
  assert.notDeepEqual(sim.compare(config({ seed: 789 })).cohorts[0].runs, a.cohorts[0].runs);
});

test("open access allows standard journeys but never fabricates an access hierarchy", () => {
  const result = sim.compare(config({ access: 0, difficulty: 0, cooperation: 100, budget: 40 }));
  assert.equal(result.cohorts[0].summary.counts.shared, 12);
  assert.equal(result.cohorts[0].summary.counts.monomyth, 12);
  for (const cohort of result.cohorts) assert.equal(cohort.summary.counts.hierarchy, 0);
  const gated = sim.compare(config({ access: 100, difficulty: 0, cooperation: 100, budget: 40 }));
  assert.ok(gated.cohorts[0].summary.counts.hierarchy > 0);
});

test("zero cooperation prevents sharing; failures and budget exhaustion remain in denominators", () => {
  const result = sim.compare(config({ cooperation: 0 }));
  for (const cohort of result.cohorts) {
    assert.equal(cohort.summary.total, 12);
    assert.equal(cohort.summary.counts.shared, 0);
    assert.ok(cohort.runs.every((r) => r.events.length === sim.defaults.budget));
  }
  const impossible = sim.compare(config({ access: 0, difficulty: 100, cooperation: 0 }));
  assert.equal(impossible.cohorts[0].summary.counts.verified, 0);
});

test("a call, trial and gain alone are not a monomyth; order and return evidence matter", () => {
  const events = [
    { step: 1, type: "call", success: true }, { step: 2, type: "depart" },
    { step: 3, type: "trial", success: true, actor: "Seeker" }, { step: 4, type: "check", success: true },
    { step: 5, type: "share", success: true }
  ];
  assert.deepEqual(sim.classify(events).monomyth, [1, 2, 3, 4, 5]);
  assert.equal(sim.classify(events.slice(0, -1)).monomyth.length, 0);
  assert.equal(sim.classify(events.map((e) => ({ ...e, step: 6 - e.step })).sort((a, b) => a.step - b.step)).monomyth.length, 0);
  assert.equal(sim.classify(events.filter((e) => e.type !== "depart")).monomyth.length, 0);
  assert.equal(sim.classify([{ step: 1, type: "access", from: "Seeker", to: "Steward" }]).hierarchy.length, 0);
});

test("alternative signatures can overlap; all detections point to trace evidence", () => {
  const events = [
    { step: 1, type: "trial", success: true, actor: "Seeker" },
    { step: 2, type: "check", success: false },
    { step: 3, type: "trial", success: true, actor: "Peer" },
    { step: 4, type: "check", success: true },
    { step: 5, type: "call", success: true },
    { step: 6, type: "share", success: true }
  ];
  const matches = sim.classify(events);
  assert.deepEqual(matches.gainBeforeCall, [4, 5]);
  assert.deepEqual(matches.distributed, [1, 3, 6]);
  assert.deepEqual(matches.revision, [2, 4]);
  assert.deepEqual(matches.monomyth, []);
  for (const cohort of sim.compare(config()).cohorts) for (const run of cohort.runs) {
    for (const ids of Object.values(run.matches)) for (const id of ids) assert.ok(run.events.some((e) => e.step === id));
  }
});

test("insight placement changes behavior, not just labels; rejection never discards the true candidate", () => {
  const call = sim.compare(config({ insight: "call", access: 0, cooperation: 100 }));
  const trial = sim.compare(config({ insight: "trial", access: 0, cooperation: 100 }));
  const boon = sim.compare(config({ insight: "boon", access: 0, cooperation: 100 }));
  assert.notDeepEqual(call.cohorts[0].runs, boon.cohorts[0].runs);
  assert.notDeepEqual(trial.cohorts[0].runs, boon.cohorts[0].runs);
  assert.ok(call.cohorts.some((c) => c.summary.counts.revision > 0));
  for (const result of [call, trial, boon]) for (const cohort of result.cohorts) for (const run of cohort.runs) {
    assert.ok(run.outcome.candidates.includes(run.world.truth));
    assert.ok(run.events.length <= result.config.budget);
    const gain = run.events.find((e) => e.type === "check" && e.success);
    if (gain) assert.equal(gain.claim, run.world.truth);
    if (run.outcome.shared) assert.ok(gain);
    for (const event of run.events) {
      if (event.roles.includes("boon")) assert.ok(event.type === "check" && event.success, "a claim is not a verified boon");
    }
  }
});

test("polarized runs keep truths fixed and report conditional denominators and paired outcomes exactly", () => {
  const result = sim.compare(config({ comparison: "access" }));
  assert.equal(result.cohorts.length, 8);
  assert.deepEqual(result.cohorts[0].runs.map((r) => r.world.truth), result.cohorts[4].runs.map((r) => r.world.truth));
  for (const cohort of result.cohorts) {
    const s = cohort.summary;
    assert.equal(s.hierarchyInside.total + s.hierarchyOutside.total, s.total);
    assert.equal(s.hierarchyInside.count + s.hierarchyOutside.count, s.counts.hierarchy);
    assert.equal(Object.values(cohort.paired).reduce((a, b) => a + b, 0), s.total);
    assert.equal(cohort.paired.both + cohort.paired.variantOnly, s.counts.shared);
    assert.equal(s.counts.neither, s.total - s.counts.monomyth - s.counts.hierarchy + s.counts.both);
  }
});

test("exports replay completely; foreign map files, stale engines and tampered settings are rejected", () => {
  const result = sim.compare(config());
  const file = sim.exportExperiment(result);
  assert.deepEqual(sim.compare(sim.parseExperiment(JSON.stringify(file))), result);
  file.report[0].summary.counts.shared = 900;
  assert.deepEqual(sim.compare(sim.parseExperiment(file)), result, "reported counts are recomputed, never imported as evidence");
  assert.throws(() => sim.parseExperiment({ schemaVersion: 2, nodes: [] }));
  assert.throws(() => sim.parseExperiment({ ...file, engineVersion: 999 }));
  assert.throws(() => sim.parseExperiment({ ...file, config: config({ budget: 1000000 }) }));
});
