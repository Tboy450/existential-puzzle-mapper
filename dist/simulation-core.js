(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SimulationCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const version = 1;
  const defaults = Object.freeze({
    seed: 12345, runs: 80, budget: 16, access: 50, difficulty: 35,
    cooperation: 65, insight: "boon", comparison: "roles"
  });
  const strategies = Object.freeze([
    { id: "standard", title: "Standard journey", rule: "Notice a call, depart, investigate three clues, check a claim, then return with a shared gain. No peer bypass." },
    { id: "interchange", title: "Interchangeable roles", rule: "Investigate or check a claim before committing to a call. Departing is optional; a gain can precede a call." },
    { id: "reciprocal", title: "Reciprocal inquiry", rule: "Prefer exchanging evidence with a peer, then check and share a claim. No required departure or ranked access for peer exchanges." },
    { id: "free", title: "Unordered control", rule: "Choose among physically available actions without narrative prerequisites. It is a control policy, not an absence of structure." }
  ]);
  const presets = Object.freeze([
    { id: "balanced", title: "Mixed access", access: 50, difficulty: 35, cooperation: 65 },
    { id: "restricted", title: "Restricted access", access: 90, difficulty: 45, cooperation: 40 },
    { id: "shared", title: "Distributed support", access: 15, difficulty: 35, cooperation: 90 },
    { id: "friction", title: "Difficult inquiry", access: 50, difficulty: 80, cooperation: 30 }
  ]);
  const definitions = Object.freeze([
    { title: "Call", text: "A noticed invitation activates the focal inquiry. In the call placement, it also introduces a fallible insight claim." },
    { title: "Trial", text: "An attempt to obtain or check evidence. Failure costs one action; it is not presumed meaningful or necessary." },
    { title: "Boon", text: "A checked, correct synthetic solution becomes usable. Sharing it is a separate outcome, not guaranteed by acquiring it." },
    { title: "Gnosis / insight proxy", text: "A candidate knowledge claim, not a spiritual diagnosis or revelation. Place it at the call, after the first trial, or after all three clues. Its role changes its timing and available evidence." },
    { title: "Monomyth-like signature", text: "A noticed call, departure, successful trial, verified gain, and successful return/share, in that strict order for the focal inquiry. A deliberately narrow sequence proxy, not a complete definition of the monomyth." },
    { title: "Access hierarchy", text: "Actual requests traverse Seeker to Steward and Steward to Council. A single obstacle is insufficient. This access-chain proxy does not identify or establish a Gnostic cosmology." },
    { title: "Alternative signatures", text: "Distributed gain: Seeker and Peer both supply evidence before sharing. Gain before call: verification precedes a later call. Revision: a rejected claim is followed by a verified one. These may overlap the other signatures." },
    { title: "Inside / outside", text: "Inside means the complete sequence signature matched within the action budget. Outside includes partial, failed, differently ordered, and incomplete journeys; it does not automatically mean a new ideology." }
  ]);

  function validateConfig(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Choose a simulation settings object.");
    if (Object.keys(input).some((key) => !Object.hasOwn(defaults, key))) throw new Error("Unknown simulation setting.");
    const bounds = { seed: [0, 4294967295], runs: [1, 200], budget: [8, 40], access: [0, 100], difficulty: [0, 100], cooperation: [0, 100] };
    Object.entries(bounds).forEach(([key, [min, max]]) => {
      if (!Number.isInteger(input[key]) || input[key] < min || input[key] > max) {
        throw new Error(`${key} must be an integer from ${min} to ${max}.`);
      }
    });
    if (!["call", "trial", "boon"].includes(input.insight)) throw new Error("Choose call, trial, or boon for insight placement.");
    if (!["roles", "access"].includes(input.comparison)) throw new Error("Choose role comparison or polarized access comparison.");
    return Object.fromEntries(Object.keys(defaults).map((key) => [key, input[key]]));
  }

  // Draws are keyed by world, action and attempt, not by policy or execution order.
  function draw(seed, run, channel, attempt = 0) {
    let hash = 2166136261;
    for (const char of `${seed}:${run}:${channel}:${attempt}`) {
      hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
    }
    hash ^= hash >>> 16;
    hash = Math.imul(hash, 0x7feb352d);
    hash ^= hash >>> 15;
    hash = Math.imul(hash, 0x846ca68b);
    return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
  }

  function classify(events) {
    const first = (predicate, after = 0) => events.find((event) => event.step > after && predicate(event));
    const call = first((e) => e.type === "call" && e.success);
    const departure = call && first((e) => e.type === "depart", call.step);
    const trial = departure && first((e) => e.type === "trial" && e.success, departure.step);
    const gain = trial && first((e) => e.type === "check" && e.success, trial.step);
    const returned = gain && first((e) => e.type === "share" && e.success, gain.step);
    const lower = first((e) => e.type === "access" && e.from === "Seeker" && e.to === "Steward");
    const upper = first((e) => e.type === "access" && e.from === "Steward" && e.to === "Council");
    const anyGain = first((e) => e.type === "check" && e.success);
    const laterCall = anyGain && first((e) => e.type === "call" && e.success, anyGain.step);
    const shared = first((e) => e.type === "share" && e.success);
    const evidence = events.filter((e) => e.type === "trial" && e.success && (!shared || e.step < shared.step));
    const seeker = evidence.find((e) => e.actor === "Seeker");
    const peer = evidence.find((e) => e.actor === "Peer");
    const rejected = first((e) => e.type === "check" && !e.success);
    const revised = rejected && first((e) => e.type === "check" && e.success, rejected.step);
    return {
      monomyth: returned ? [call.step, departure.step, trial.step, gain.step, returned.step] : [],
      hierarchy: lower && upper ? [lower.step, upper.step] : [],
      distributed: shared && seeker && peer ? [seeker.step, peer.step, shared.step] : [],
      gainBeforeCall: laterCall ? [anyGain.step, laterCall.step] : [],
      revision: revised ? [rejected.step, revised.step] : []
    };
  }

  function simulate(config, strategyId, run = 0) {
    config = validateConfig(config);
    if (!strategies.some((strategy) => strategy.id === strategyId)) throw new Error("Unknown simulation strategy.");
    if (!Number.isInteger(run) || run < 0 || run >= config.runs) throw new Error("Case index is outside this experiment.");
    const truth = Math.floor(draw(config.seed, run, "truth") * 8);
    const ranks = [0, 1, 2].map((clue) => {
      const gate = draw(config.seed, run, `gate-${clue}`);
      return gate < config.access / 200 ? 2 : gate < config.access / 100 ? 1 : 0;
    });
    const events = [], attempts = new Map(), known = new Set();
    const state = { called: false, departed: false, rank: 0, candidate: null, verified: false, shared: false };
    let candidates = Array.from({ length: 8 }, (_, i) => i);
    const random = (key) => {
      const attempt = attempts.get(key) || 0;
      attempts.set(key, attempt + 1);
      return draw(config.seed, run, key, attempt);
    };
    const emit = (event) => events.push({ step: events.length + 1, actor: "Seeker", roles: [], ...event });
    const propose = (role) => {
      const choice = candidates[Math.floor(random("claim") * candidates.length)];
      state.candidate = choice;
      return { claim: choice, insightRole: role };
    };
    const readyForClaim = () => config.insight === "call" ? state.called : known.size >= (config.insight === "trial" ? 1 : 3);
    const missing = () => [0, 1, 2].filter((clue) => !known.has(clue));

    function investigate(withPeer) {
      const clue = missing()[0];
      const rank = ranks[clue];
      if (!withPeer && rank > state.rank) {
        const requested = state.rank + 1;
        const success = random(`access-${requested}`) < config.cooperation / 100;
        if (success) state.rank = requested;
        emit({ type: "access", roles: ["trial"], success, from: requested === 1 ? "Seeker" : "Steward",
          to: requested === 1 ? "Steward" : "Council",
          detail: `${success ? "Granted" : "Refused"} access level ${requested}; clue ${clue + 1} needs level ${rank}.` });
        return;
      }
      const success = random(`${withPeer ? "exchange" : "investigate"}-${clue}`) <
        (withPeer ? config.cooperation / 100 : 1 - config.difficulty / 100);
      if (success) {
        known.add(clue);
        candidates = candidates.filter((value) => (value & (1 << clue)) === (truth & (1 << clue)));
      }
      emit({ type: "trial", actor: withPeer ? "Peer" : "Seeker", roles: ["trial"], success, clue: clue + 1,
        detail: success ? `${withPeer ? "Peer supplied" : "Investigation found"} clue ${clue + 1}; ${candidates.length} candidate(s) remain.`
          : `${withPeer ? "Exchange" : "Investigation"} produced no evidence. One action spent.` });
    }

    function act(action) {
      if (action === "call") {
        const success = random("notice") < 0.8;
        state.called = success;
        const insight = success && config.insight === "call" && state.candidate === null && !state.verified ? propose("call") : {};
        emit({ type: "call", roles: success ? ["call"] : [], success, ...insight,
          detail: success ? `Inquiry activated.${Object.hasOwn(insight, "claim") ? ` Initial insight claims candidate ${insight.claim}; it is not yet checked.` : ""}` : "Invitation not taken up. One action spent." });
      } else if (action === "depart") {
        state.departed = true;
        emit({ type: "depart", success: true, detail: "Moved from the starting context into a dedicated inquiry." });
      } else if (action === "investigate" || action === "exchange") {
        investigate(action === "exchange");
      } else if (action === "claim") {
        const insight = propose(config.insight);
        emit({ type: "insight", success: null, ...insight,
          detail: `Proposed candidate ${insight.claim} from ${candidates.length} remaining possibility/possibilities. A claim is not a verified boon.` });
      } else if (action === "check") {
        const claim = state.candidate;
        const success = claim === truth;
        state.verified = success;
        if (!success) {
          candidates = candidates.filter((value) => value !== claim);
          state.candidate = null;
        }
        emit({ type: "check", roles: success ? ["trial", "boon"] : ["trial"], success, claim,
          detail: success ? `Candidate ${claim} passed the synthetic check; a usable gain is available.`
            : `Candidate ${claim} failed. Only that claim is rejected, not replaced by its opposite. ${candidates.length} possibilities remain.` });
      } else if (action === "share") {
        const success = random("share") < config.cooperation / 100;
        state.shared = success;
        emit({ type: "share", success, detail: success ? "Verified gain returned to the shared task; public acceptance criterion met."
          : "Gain remains usable privately, but the shared task did not receive it. One action spent." });
      } else {
        emit({ type: "wait", success: false, detail: "No progress this action." });
      }
    }

    for (let step = 0; step < config.budget && !state.shared; step += 1) {
      let action;
      if (strategyId === "standard") {
        if (!state.called) action = "call";
        else if (!state.departed) action = "depart";
        else if (state.verified) action = "share";
        else if (state.candidate !== null && known.size === 3) action = "check";
        else if (state.candidate === null && readyForClaim()) action = "claim";
        else action = "investigate";
      } else {
        const available = ["wait"];
        if (!state.called) available.push("call");
        if (!state.departed) available.push("depart");
        if (missing().length && !state.verified) available.push("investigate", "exchange");
        if (state.candidate === null && !state.verified && readyForClaim()) available.push("claim");
        if (state.candidate !== null && !state.verified) available.push("check");
        if (state.verified) available.push("share");
        if (strategyId === "free") {
          action = available[Math.floor(random("policy") * available.length)];
        } else {
          const priority = strategyId === "reciprocal"
            ? ["share", "check", "claim", "exchange", "investigate", "call", "depart", "wait"]
            : ["share", "check", "claim", "investigate", "call", "depart", "exchange", "wait"];
          // Exploration permits departures and role-order changes without requiring them.
          const explore = random("explore") < 0.3;
          action = explore ? available[Math.floor(random("policy") * available.length)] : priority.find((item) => available.includes(item));
        }
      }
      act(action);
    }
    const matches = classify(events);
    return {
      case: run + 1, world: { truth, ranks }, events, matches,
      outcome: { verified: state.verified, shared: state.shared, actions: events.length, clues: known.size,
        candidates: [...candidates], called: state.called, departed: state.departed }
    };
  }

  function summarize(runs) {
    const counts = { verified: 0, shared: 0, monomyth: 0, hierarchy: 0, both: 0, neither: 0,
      distributed: 0, gainBeforeCall: 0, revision: 0 };
    const insightRoles = { call: 0, trial: 0, boon: 0 };
    let actions = 0;
    runs.forEach((run) => {
      for (const key of ["verified", "shared"]) if (run.outcome[key]) counts[key]++;
      for (const key of ["monomyth", "hierarchy", "distributed", "gainBeforeCall", "revision"]) if (run.matches[key].length) counts[key]++;
      if (run.matches.monomyth.length && run.matches.hierarchy.length) counts.both++;
      if (!run.matches.monomyth.length && !run.matches.hierarchy.length) counts.neither++;
      for (const role of Object.keys(insightRoles)) if (run.events.some((event) => event.insightRole === role)) insightRoles[role]++;
      actions += run.outcome.actions;
    });
    return { total: runs.length, counts, insightRoles, meanActions: actions / runs.length,
      hierarchyInside: { count: counts.both, total: counts.monomyth },
      hierarchyOutside: { count: counts.hierarchy - counts.both, total: runs.length - counts.monomyth } };
  }

  function pairedOutcomes(baseline, variant) {
    const counts = { both: 0, baselineOnly: 0, variantOnly: 0, neither: 0 };
    baseline.forEach((run, i) => {
      const a = run.outcome.shared, b = variant[i].outcome.shared;
      counts[a && b ? "both" : a ? "baselineOnly" : b ? "variantOnly" : "neither"]++;
    });
    return counts;
  }

  function compare(input) {
    const config = validateConfig(input);
    const conditions = config.comparison === "access" ? [0, 100] : [config.access];
    const cohorts = [];
    for (const access of conditions) {
      let baseline;
      for (const strategy of strategies) {
        const runs = Array.from({ length: config.runs }, (_, index) => simulate({ ...config, access }, strategy.id, index));
        if (!baseline) baseline = runs;
        cohorts.push({ strategy: strategy.id, access, runs, summary: summarize(runs), paired: pairedOutcomes(baseline, runs) });
      }
    }
    return { engineVersion: version, config, cohorts };
  }

  function exportExperiment(result) {
    return JSON.parse(JSON.stringify({
      format: "puzzle-simulation", engineVersion: version, config: validateConfig(result.config),
      note: "Synthetic comparison, not measured prevalence or evidence about a private experience. Import replays the recipe; reported summaries are not trusted inputs. All traces are reproduced from the versioned recipe.",
      definitions,
      report: result.cohorts.map(({ strategy, access, summary, paired }) => ({ strategy, access, summary, paired }))
    }));
  }

  function parseExperiment(input) {
    const payload = typeof input === "string" ? JSON.parse(input) : input;
    if (!payload || payload.format !== "puzzle-simulation" || payload.engineVersion !== version) {
      throw new Error("Choose a simulation export for engine version 1, not a map export.");
    }
    return validateConfig(payload.config);
  }

  return { version, defaults, strategies, presets, definitions, validateConfig, simulate, classify, summarize, compare, exportExperiment, parseExperiment };
});
