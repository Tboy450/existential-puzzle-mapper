(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(require("./simulation-core.js"));
  else root.SimulationLearning = factory(root.SimulationCore);
})(typeof globalThis !== "undefined" ? globalThis : this, function (engine) {
  "use strict";

  const version = 1;
  const features = ["access", "difficulty", "cooperation", "budget", "insight"];
  const metrics = ["shared", "monomyth", "hierarchy", "both"];
  const targets = engine.strategies.flatMap((strategy) => metrics.map((metric) => `${strategy.id}.${metric}`));

  function profile(config) {
    const valid = engine.validateConfig({ ...engine.defaults, ...config });
    return Object.fromEntries(features.map((key) => [key, valid[key]]));
  }
  function profileKey(config) { return JSON.stringify(profile(config)); }
  function mean(vectors) {
    if (!vectors.length) throw new Error("At least one observation is required.");
    const total = new Array(targets.length).fill(0);
    for (const values of vectors) {
      if (!Array.isArray(values) || values.length !== targets.length || values.some((v) => !Number.isFinite(v) || v < 0 || v > 1)) {
        throw new Error("Learning targets must be finite occurrence proportions between zero and one.");
      }
      values.forEach((value, i) => { total[i] += value; });
    }
    return total.map((value) => value / vectors.length);
  }
  function leaf(rows) { return { values: mean(rows.map((row) => row.values)), support: rows.length }; }
  function squaredError(rows, values) {
    return rows.reduce((total, row) => total + row.values.reduce((sum, value, i) => sum + (value - values[i]) ** 2, 0), 0);
  }
  function goesLeft(config, node) {
    return node.feature === "insight" ? config.insight === node.threshold : config[node.feature] <= node.threshold;
  }
  function fit(rows, { maxDepth = 4, minLeaf = 6 } = {}) {
    if (!Number.isInteger(maxDepth) || maxDepth < 0 || maxDepth > 8 || !Number.isInteger(minLeaf) || minLeaf < 1) {
      throw new Error("Use a depth from 0 to 8 and a positive minimum leaf size.");
    }
    if (!rows.length) throw new Error("Training requires observations.");
    const clean = rows.map((row) => ({ profile: profile(row.profile), values: [...row.values] }));
    mean(clean.map((row) => row.values));
    function grow(subset, depth) {
      const node = leaf(subset);
      if (depth >= maxDepth || subset.length < minLeaf * 2) return node;
      let best = null, bestError = squaredError(subset, node.values);
      for (const feature of features) {
        const unique = [...new Set(subset.map((row) => row.profile[feature]))];
        unique.sort(feature === "insight" ? undefined : (a, b) => a - b);
        const thresholds = feature === "insight" ? unique : unique.slice(1).map((v, i) => (v + unique[i]) / 2);
        for (const threshold of thresholds) {
          const candidate = { feature, threshold }, left = [], right = [];
          for (const row of subset) (goesLeft(row.profile, candidate) ? left : right).push(row);
          if (left.length < minLeaf || right.length < minLeaf) continue;
          const error = squaredError(left, leaf(left).values) + squaredError(right, leaf(right).values);
          if (error < bestError - 1e-12) {
            bestError = error;
            best = { feature, threshold, left, right };
          }
        }
      }
      if (!best) return node;
      return { ...node, feature: best.feature, threshold: best.threshold,
        left: grow(best.left, depth + 1), right: grow(best.right, depth + 1) };
    }
    return grow(clean, 0);
  }
  function predict(model, config) {
    const input = profile(config);
    let node = model;
    for (let depth = 0; depth <= 8; depth++) {
      if (!node || !Array.isArray(node.values)) throw new Error("Invalid learned model.");
      if (!node.feature) return { values: [...node.values], support: node.support };
      node = goesLeft(input, node) ? node.left : node.right;
    }
    throw new Error("Learned model exceeds the supported depth.");
  }
  function evaluate(model, rows) {
    if (!rows.length) throw new Error("Evaluation requires held-out observations.");
    const errors = new Array(targets.length).fill(0);
    for (const row of rows) {
      mean([row.values]);
      const forecast = predict(model, row.profile).values;
      row.values.forEach((value, i) => { errors[i] += Math.abs(value - forecast[i]); });
    }
    const perTarget = errors.map((error) => error / rows.length);
    const perMetric = Object.fromEntries(metrics.map((metric, index) => [metric,
      engine.strategies.reduce((total, _strategy, s) => total + perTarget[s * metrics.length + index], 0) / engine.strategies.length]));
    return { overall: perTarget.reduce((a, b) => a + b, 0) / targets.length, perMetric, perTarget };
  }
  function summarizeSeries(counts, cases) {
    if (!Number.isInteger(cases) || cases < 1 || !counts.length) throw new Error("A repeated series needs cases and repetitions.");
    if (counts.some((values) => !Array.isArray(values) || values.length !== targets.length ||
      values.some((value) => !Number.isInteger(value) || value < 0 || value > cases))) {
      throw new Error("Repeated counts must be integers within the per-seed case count.");
    }
    const repetitions = counts.map((values) => values.map((value) => value / cases));
    const values = mean(repetitions);
    const minimum = values.map((_v, i) => Math.min(...repetitions.map((row) => row[i])));
    const maximum = values.map((_v, i) => Math.max(...repetitions.map((row) => row[i])));
    const sd = values.map((value, i) => repetitions.length < 2 ? 0 :
      Math.sqrt(repetitions.reduce((sum, row) => sum + (row[i] - value) ** 2, 0) / (repetitions.length - 1)));
    return { values, minimum, maximum, sd };
  }
  function ranges(rows) {
    if (!rows.length) throw new Error("Training ranges require observations.");
    return Object.fromEntries(features.map((key) => [key, key === "insight"
      ? [...new Set(rows.map((row) => row.profile[key]))].sort()
      : [Math.min(...rows.map((row) => row.profile[key])), Math.max(...rows.map((row) => row.profile[key]))]]));
  }
  function outsideRange(config, bounds) {
    const p = profile(config);
    return features.filter((key) => key === "insight" ? !bounds[key].includes(p[key]) :
      p[key] < bounds[key][0] || p[key] > bounds[key][1]);
  }
  function splitUsage(model) {
    const count = Object.fromEntries(features.map((key) => [key, 0]));
    function visit(node) {
      if (node.feature) { count[node.feature]++; visit(node.left); visit(node.right); }
    }
    visit(model);
    return count;
  }
  function validateStudy(study) {
    if (!study || study.format !== "puzzle-learning-study" || study.version !== version || study.engineVersion !== engine.version) {
      throw new Error("The learning study does not match this simulator.");
    }
    if (JSON.stringify(study.targets) !== JSON.stringify(targets)) throw new Error("Learning targets do not match this workbench.");
    function check(node, depth = 0) {
      if (!node || depth > 8 || !Number.isInteger(node.support) || node.support < 1) throw new Error("Invalid learning model support or depth.");
      mean([node.values]);
      if (node.feature) {
        if (!features.includes(node.feature) ||
          (node.feature === "insight" ? !["call", "trial", "boon"].includes(node.threshold) : !Number.isFinite(node.threshold))) {
          throw new Error("Unknown learning feature or threshold.");
        }
        check(node.left, depth + 1); check(node.right, depth + 1);
        if (node.support !== node.left.support + node.right.support) throw new Error("Learning model support does not match its children.");
      } else if (node.left || node.right) throw new Error("A learning leaf cannot contain child models.");
    }
    check(study.model); check(study.baseline);
    if (!Array.isArray(study.series) || !study.series.length || !Array.isArray(study.rounds) || study.rounds.length !== 3) {
      throw new Error("The learning study is incomplete.");
    }
    if (!Number.isInteger(study.selectedRound) || study.selectedRound < 1 || study.selectedRound > 3) {
      throw new Error("Invalid selected learning cycle.");
    }
    const splitKeys = { train: new Set(), validation: new Set(), test: new Set() };
    for (const row of study.series) {
      if (!Object.hasOwn(splitKeys, row.split)) throw new Error("Unknown learning split.");
      if (!Number.isInteger(row.round) || (row.split === "train" ? row.round < 1 || row.round > 3 : row.round !== 0)) {
        throw new Error("Invalid series cycle.");
      }
      const key = profileKey(row.profile);
      if (splitKeys[row.split].has(key)) throw new Error("Duplicate recipe within a learning split.");
      splitKeys[row.split].add(key);
      if (!Array.isArray(row.seeds) || new Set(row.seeds).size !== row.seeds.length || row.seeds.length !== row.counts.length ||
        row.seeds.some((seed) => !Number.isInteger(seed) || seed < 0 || seed > 4294967295)) {
        throw new Error("Invalid repetition seeds.");
      }
      const summary = summarizeSeries(row.counts, row.cases);
      mean([row.values]);
      if (!Array.isArray(row.values) || row.values.some((value, i) => Math.abs(value - summary.values[i]) > 1e-12) ||
        row.values.length !== targets.length) throw new Error("Stored learning averages disagree with repetition counts.");
    }
    for (const [a, b] of [["train", "validation"], ["train", "test"], ["validation", "test"]]) {
      if ([...splitKeys[a]].some((key) => splitKeys[b].has(key))) throw new Error("Learning recipe leakage between splits.");
      const seeds = (split) => new Set(study.series.filter((row) => row.split === split).flatMap((row) => row.seeds));
      const left = seeds(a), right = seeds(b);
      if ([...left].some((seed) => right.has(seed))) throw new Error("Learning seed leakage between splits.");
    }
    const selectedRows = study.series.filter((row) => row.split === "train" && row.round <= study.selectedRound);
    if (study.model.support !== selectedRows.length || study.baseline.support !== selectedRows.length) {
      throw new Error("Learning model support disagrees with its training split.");
    }
    if (JSON.stringify(study.ranges) !== JSON.stringify(ranges(selectedRows))) throw new Error("Learning ranges disagree with training data.");
    const tests = study.series.filter((row) => row.split === "test");
    if (JSON.stringify(study.testError) !== JSON.stringify(evaluate(study.model, tests)) ||
      JSON.stringify(study.baselineError) !== JSON.stringify(evaluate(study.baseline, tests))) {
      throw new Error("Reported test errors disagree with the held-out repetitions.");
    }
    const episodes = study.series.reduce((total, row) => total + row.cases * row.seeds.length * engine.strategies.length, 0);
    if (study.totalEpisodes !== episodes) throw new Error("Learning episode count does not match the series.");
    return study;
  }

  return { version, features, metrics, targets, profile, profileKey, mean, fit, predict, evaluate,
    summarizeSeries, ranges, outsideRange, splitUsage, validateStudy };
});
