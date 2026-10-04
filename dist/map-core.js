(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MapCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const storageKey = "existential-puzzle-map-v2";
  const backupKey = `${storageKey}-backup`;
  const damagedKey = `${storageKey}-damaged`;
  const legacyKey = "existential-puzzle-custom-v1";
  const modelSchema = {
    source: { title: "string", file: "string", transcript: "string", pages: "number", note: "string" },
    project: { title: "string", purpose: "string", method: "string", principles: ["string"],
      sections: [{ title: "string", role: "string" }], separation: [{ label: "string", definition: "string" }] },
    types: ["string"],
    nodes: [{ id: "string", label: "string", type: "string", summary: "string",
      "domain?": "string", "weight?": "number", "source?": ["string"], "questions?": ["string"] }],
    edges: [{ from: "string", to: "string", label: "string", "kind?": "string", "strength?": "number" }],
    sourceAnchors: [{ id: "string", pages: "string", title: "string", note: "string", nodes: ["string"] }],
    references: [{ id: "string", title: "string", category: "string", use: "string", nodeIds: ["string"] }],
    scenarios: [{ id: "string", title: "string", premise: "string", assumptions: ["string"], moves: ["string"], risks: ["string"], outcomes: ["string"] }],
    objectives: [{ id: "string", title: "string", definition: "string", firstMoves: ["string"], signals: ["string"], risks: ["string"], nodeIds: ["string"] }],
    nextStepDefinitions: [{ term: "string", definition: "string" }],
    nextSteps: [{ id: "string", title: "string", mode: "string", tempo: "string", orientation: "string", whyDifferent: "string", actions: ["string"], nodeIds: ["string"] }],
    patternDefinitions: [{ term: "string", definition: "string" }],
    patternSets: [{ id: "string", title: "string", family: "string", status: "string", premise: "string", collects: ["string"],
      patternQuestions: ["string"], mapFocus: ["string"], "instances?": ["string"],
      metrics: { "fit?": "number", "fitLabel?": "string", entries: "number", mapLinks: "number", basis: "string" } }],
    patternDatasetTemplate: { title: "string", fields: ["string"], rule: "string" },
    answerSignals: { note: "string", vectors: [{ id: "string", title: "string", "fit?": "number", "fitLabel?": "string",
      entries: "number", linkedPatterns: "number", claim: "string", supports: ["string"], wouldRaise: "string", wouldLower: "string" }] },
    termKey: [{ category: "string", terms: [{ term: "string", definition: "string", usedFor: "string", not: "string" }] }]
  };
  const modelKeys = Object.keys(modelSchema);

  function fail(message) { throw new Error(message); }
  function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
  function checkShape(value, schema, path) {
    if (typeof schema === "string") {
      if (typeof value !== schema || (schema === "number" && !Number.isFinite(value))) fail(`${path} must be a valid ${schema}.`);
      if (schema === "string" && value.length > 20000) fail(`${path} is too long.`);
      return;
    }
    if (Array.isArray(schema)) {
      if (!Array.isArray(value) || value.length > 2000) fail(`${path} must be an array of at most 2000 items.`);
      value.forEach((item, i) => checkShape(item, schema[0], `${path}[${i}]`));
      return;
    }
    if (!isObject(value)) fail(`${path} must be an object.`);
    Object.entries(schema).forEach(([name, child]) => {
      const optional = name.endsWith("?");
      const key = optional ? name.slice(0, -1) : name;
      if (optional && !Object.hasOwn(value, key)) return;
      checkShape(value[key], child, `${path}.${key}`);
    });
  }
  function checkSafeTree(value, depth = 0) {
    if (depth > 30) fail("Map nesting is too deep.");
    if (value && typeof value === "object") Object.entries(value).forEach(([key, child]) => {
      if (["__proto__", "constructor", "prototype"].includes(key)) fail("Map contains a reserved object key.");
      checkSafeTree(child, depth + 1);
    });
  }
  function validateModel(model) {
    checkSafeTree(model);
    checkShape(model, modelSchema, "map");
    if (!model.nodes.length || model.nodes.length > 250) fail("A map must contain between 1 and 250 nodes.");
    const types = new Set(model.types);
    if (!types.size || types.size !== model.types.length) fail("Map types must be unique and nonempty.");
    if (model.types.some((type) => !type.trim())) fail("Map types cannot be blank.");
    if (!Number.isInteger(model.source.pages) || model.source.pages < 1) fail("Source pages must be a positive integer.");
    const ids = new Set();
    model.nodes.forEach((node) => {
      if (!/^[a-zA-Z0-9_-]{1,100}$/.test(node.id) || ids.has(node.id)) fail(`Invalid or duplicate node ID: ${node.id}`);
      if (!node.label.trim() || !types.has(node.type)) fail(`Invalid label or type for ${node.id}.`);
      if (node.weight !== undefined && (node.weight < 1 || node.weight > 20)) fail(`Invalid weight for ${node.id}.`);
      ids.add(node.id);
    });
    const pairs = new Set();
    model.edges.forEach((edge) => {
      if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) fail(`Invalid relationship: ${edge.from} → ${edge.to}`);
      const pair = [edge.from, edge.to].sort().join("\u0000");
      if (pairs.has(pair)) fail(`Duplicate relationship: ${edge.from} → ${edge.to}`);
      if (edge.strength !== undefined && (edge.strength < 1 || edge.strength > 5)) fail("Relationship strength must be between 1 and 5.");
      pairs.add(pair);
    });
    for (const [key, field] of [["sourceAnchors", "nodes"], ["references", "nodeIds"], ["scenarios", "outcomes"],
      ["objectives", "nodeIds"], ["nextSteps", "nodeIds"], ["patternSets", "mapFocus"]]) {
      const itemIds = new Set();
      model[key].forEach((item) => {
        if (!item.id || itemIds.has(item.id)) fail(`Duplicate or empty ID in ${key}.`);
        itemIds.add(item.id);
        item[field].forEach((id) => { if (!ids.has(id)) fail(`${key}.${item.id} refers to missing node ${id}.`); });
      });
    }
    model.objectives.forEach((item) => item.risks.forEach((id) => {
      if (!ids.has(id)) fail(`objectives.${item.id} refers to missing risk ${id}.`);
    }));
    const answerIds = new Set();
    model.answerSignals.vectors.forEach((vector) => {
      if (!vector.id || answerIds.has(vector.id)) fail("Answer-vector IDs must be nonempty and unique.");
      answerIds.add(vector.id);
    });
    [...model.patternSets.map((pattern) => pattern.metrics), ...model.answerSignals.vectors].forEach((metrics) => {
      for (const key of ["entries", "mapLinks", "linkedPatterns"]) {
        if (metrics[key] !== undefined && (!Number.isInteger(metrics[key]) || metrics[key] < 0)) fail(`${key} must be a nonnegative integer.`);
      }
      if (metrics.fit !== undefined && (metrics.fit < 0 || metrics.fit > 100)) fail("Legacy fit must be between 0 and 100.");
      if (metrics.fitLabel !== undefined && !["Unassessed", "Tentative", "Moderate", "Strong"].includes(metrics.fitLabel)) fail("Invalid editorial map-fit rating.");
    });
    return model;
  }
  function copy(value) { return value === undefined ? undefined : JSON.parse(JSON.stringify(value)); }
  function fitLabel(metrics) {
    if (metrics.fitLabel) return metrics.fitLabel;
    return metrics.fit >= 80 ? "Strong" : metrics.fit >= 70 ? "Moderate" : metrics.fit >= 50 ? "Tentative" : "Unassessed";
  }
  function validateLayout(layout, ids) {
    if (layout === undefined) return;
    if (!isObject(layout)) fail("Layout must be an object.");
    for (const key of ["stablePositions", "seedPositions", "layoutPressure"]) {
      if (layout[key] === undefined) continue;
      if (!isObject(layout[key])) fail(`layout.${key} must be an object.`);
      Object.entries(layout[key]).forEach(([id, point]) => {
        if (!ids.has(id) || !isObject(point)) fail(`Invalid layout node: ${id}`);
        const fields = key === "layoutPressure" ? ["dx", "dy", "distance"] : ["x", "y"];
        fields.forEach((field) => { if (!Number.isFinite(point[field]) || Math.abs(point[field]) > 1000000) fail(`Invalid layout coordinate for ${id}.`); });
        if (key === "layoutPressure" && point.distance < 0) fail("Layout distance cannot be negative.");
      });
    }
  }
  function parseSnapshot(input, base) {
    const payload = typeof input === "string" ? JSON.parse(input) : copy(input);
    if (!isObject(payload)) fail("Choose a map JSON object.");
    checkSafeTree(payload);
    if (payload.schemaVersion !== undefined && payload.schemaVersion !== 2) fail("Unsupported map version.");
    if (!Array.isArray(payload.nodes) || !Array.isArray(payload.edges)) fail("The file must include nodes and relationships.");
    const legacy = payload.schemaVersion === undefined;
    if (!legacy && (!Array.isArray(payload.customNodeIds) || !isObject(payload.layout))) fail("Version 2 maps must include custom-piece IDs and layout.");
    const model = Object.fromEntries(modelKeys.map((key) => [key, copy(payload[key] === undefined && legacy ? base[key] : payload[key])]));
    validateModel(model);
    const customNodeIds = payload.customNodeIds || model.nodes.filter((n) => n.source?.includes("user-added")).map((n) => n.id);
    checkShape(customNodeIds, ["string"], "customNodeIds");
    const ids = new Set(model.nodes.map((n) => n.id));
    const baseIds = new Set(base.nodes.map((n) => n.id));
    if (new Set(customNodeIds).size !== customNodeIds.length || customNodeIds.some((id) => !ids.has(id) || baseIds.has(id))) fail("Invalid custom-piece IDs.");
    validateLayout(payload.layout, ids);
    return { model, customNodeIds, layout: payload.layout || {}, legacy };
  }
  function buildSnapshot(model, customNodeIds, layout, date = new Date()) {
    return { schemaVersion: 2, exportedAt: date.toISOString(), ...copy(model), customNodeIds: [...customNodeIds], layout: copy(layout) };
  }
  function readStorage(storage, base) {
    let warning = "";
    try {
      for (const key of [storageKey, backupKey]) {
        const saved = storage.getItem(key);
        if (!saved) continue;
        try {
          return { ...parseSnapshot(saved, base), warning: key === backupKey ? "Recovered the previous local save. Export a backup before making changes." : warning };
        } catch (error) { warning = `A local save could not be loaded: ${error.message} The damaged save is preserved.`; }
      }
      const old = storage.getItem(legacyKey);
      if (old) {
        try {
          const custom = JSON.parse(old);
          if (!Array.isArray(custom.nodes) || !Array.isArray(custom.edges)) fail("Invalid old save.");
          return { ...parseSnapshot({ ...base, nodes: base.nodes.concat(custom.nodes), edges: base.edges.concat(custom.edges) }, base), warning };
        } catch (error) { warning = `Old custom pieces could not be restored: ${error.message} The original map was loaded; the old save is preserved.`; }
      }
    } catch (error) { warning = `Local storage is unavailable: ${error.message} Changes stay in this session; export JSON to keep them.`; }
    if (warning && !warning.includes("original map was loaded")) warning += " The original map was loaded.";
    return { model: copy(base), customNodeIds: [], layout: {}, warning };
  }
  function writeStorage(storage, snapshot, base, previousSnapshot) {
    parseSnapshot(snapshot, base);
    if (previousSnapshot) parseSnapshot(previousSnapshot, base);
    const previous = storage.getItem(storageKey);
    let validPrevious = false;
    if (previous) {
      try { parseSnapshot(previous, base); validPrevious = true; }
      catch (_error) { storage.setItem(damagedKey, previous); }
    }
    if (previousSnapshot) storage.setItem(backupKey, JSON.stringify(previousSnapshot));
    else if (validPrevious) storage.setItem(backupKey, previous);
    storage.setItem(storageKey, JSON.stringify(snapshot));
  }
  function visibleNodes(nodes, activeTypes, search) {
    const query = search.trim().toLowerCase();
    return nodes.filter((node) => activeTypes.has(node.type) && (!query ||
      [node.label, node.summary, node.type, node.domain].join(" ").toLowerCase().includes(query)));
  }
  function findRoutes(nodes, edges, start, targetTypes = ["objective", "outcome", "process"], maxEdges = 4, limit = 5) {
    const ids = new Set(nodes.map((node) => node.id));
    if (!ids.has(start)) return [];
    const targets = new Set(nodes.filter((n) => n.id !== start && targetTypes.includes(n.type)).map((n) => n.id));
    const adjacency = new Map(nodes.map((n) => [n.id, []]));
    edges.forEach((edge) => { if (ids.has(edge.from) && ids.has(edge.to)) { adjacency.get(edge.from).push(edge.to); adjacency.get(edge.to).push(edge.from); } });
    const queue = [[start]], visited = new Set([start]), routes = [];
    for (let i = 0; i < queue.length && routes.length < limit; i++) {
      const route = queue[i], last = route[route.length - 1];
      if (route.length > 1 && targets.has(last)) { routes.push(route); continue; }
      if (route.length - 1 >= maxEdges) continue;
      adjacency.get(last).forEach((next) => { if (!visited.has(next)) { visited.add(next); queue.push(route.concat(next)); } });
    }
    return routes;
  }
  function deleteCustom(model, customNodeIds, id) {
    if (!customNodeIds.includes(id)) fail("Only custom pieces can be deleted.");
    const references = [["sourceAnchors", "nodes"], ["references", "nodeIds"], ["scenarios", "outcomes"],
      ["objectives", "nodeIds"], ["nextSteps", "nodeIds"], ["patternSets", "mapFocus"]];
    if (references.some(([key, field]) => model[key].some((item) => item[field].includes(id))) ||
      model.objectives.some((item) => item.risks.includes(id))) fail("This piece is referenced by a content card. Update that reference in the JSON before deleting it.");
    const next = copy(model);
    next.nodes = next.nodes.filter((n) => n.id !== id);
    next.edges = next.edges.filter((e) => e.from !== id && e.to !== id);
    return { model: validateModel(next), customNodeIds: customNodeIds.filter((x) => x !== id) };
  }
  return { storageKey, backupKey, damagedKey, legacyKey, modelKeys, validateModel, parseSnapshot, buildSnapshot, readStorage, writeStorage, visibleNodes, findRoutes, deleteCustom, fitLabel };
});
