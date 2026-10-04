const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");
const core = require("../map-core.js");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../data.js"), "utf8"), context);
const base = JSON.parse(JSON.stringify(context.window.MAP_DATA));
const clone = (value) => JSON.parse(JSON.stringify(value));
const snapshot = () => core.buildSnapshot(base, [], {
  stablePositions: { signal: { x: 120, y: -40 } },
  seedPositions: { signal: { x: 0, y: 0 } },
  layoutPressure: { signal: { dx: 110, dy: -20, distance: Math.hypot(110, -20) } }
}, new Date("2026-10-04T12:00:00Z"));
const customNode = { id: "custom_test", label: "New piece", summary: "A saved observation", type: "custom", weight: 5, domain: "user", source: ["user-added"], questions: [] };
function memoryStorage(values = {}) {
  const entries = new Map(Object.entries(values));
  return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), entries };
}

test("bundled map has unique IDs, valid references, and bounded layout inputs", () => {
  assert.equal(core.validateModel(base), base);
  const ids = new Set(base.nodes.map((n) => n.id));
  for (const objective of base.objectives) for (const risk of objective.risks) assert.ok(ids.has(risk));
  assert.equal(base.patternSets.length, 8);
});

test("snapshot round trip preserves every model field and manual/automatic layout separately", () => {
  const exported = snapshot();
  const restored = core.parseSnapshot(JSON.stringify(exported), base);
  assert.deepEqual(restored.model, base);
  assert.deepEqual(restored.layout, exported.layout);
  for (const field of core.modelKeys) assert.ok(Object.hasOwn(exported, field), field);
  assert.equal(restored.legacy, false);
  assert.deepEqual(restored.customNodeIds, []);
  assert.notEqual(restored.layout.stablePositions.signal.x, restored.layout.layoutPressure.signal.dx);
});

test("legacy exports restore missing provenance and definition collections", () => {
  const old = snapshot();
  for (const field of ["schemaVersion", "customNodeIds", "sourceAnchors", "types", "nextStepDefinitions"]) delete old[field];
  old.nodes.push(clone(customNode));
  old.edges.push({ from: "signal", to: customNode.id, label: "added", kind: "custom", strength: 2 });
  const restored = core.parseSnapshot(old, base);
  assert.equal(restored.legacy, true);
  assert.deepEqual(restored.model.sourceAnchors, base.sourceAnchors);
  assert.deepEqual(restored.model.nextStepDefinitions, base.nextStepDefinitions);
  assert.deepEqual(restored.customNodeIds, [customNode.id]);
});

test("invalid imports reject duplicates, dangling edges, missing fields, unsafe keys, and unsupported versions", () => {
  const edits = [
    (s) => s.nodes.push(clone(s.nodes[0])),
    (s) => s.edges.push({ from: "signal", to: "missing", label: "bad" }),
    (s) => s.edges.push({ ...s.edges[0], from: s.edges[0].to, to: s.edges[0].from }),
    (s) => delete s.sourceAnchors,
    (s) => delete s.customNodeIds,
    (s) => delete s.layout,
    (s) => { s.sourceAnchors[0].nodes.push("missing"); },
    (s) => { s.objectives[0].risks.push("missing"); },
    (s) => { s.answerSignals.vectors.push(clone(s.answerSignals.vectors[0])); },
    (s) => { s.patternSets[0].metrics.entries = -1; },
    (s) => { s.patternSets[0].metrics.fitLabel = "Certain"; },
    (s) => { s.nodes[0].weight = 1000000; },
    (s) => { s.nodes[0].type = "missing"; },
    (s) => { s.schemaVersion = 999; },
    (s) => { s.customNodeIds = ["signal"]; }
  ];
  for (const edit of edits) { const s = snapshot(); edit(s); assert.throws(() => core.parseSnapshot(s, base)); }
  assert.throws(() => core.parseSnapshot('{"__proto__":{"polluted":true},"nodes":[],"edges":[]}', base), /reserved/);
  assert.equal({}.polluted, undefined);
  assert.deepEqual(base.nodes[0], context.window.MAP_DATA.nodes[0] && clone(context.window.MAP_DATA.nodes[0]));
});

test("invalid saved coordinates are rejected before applying a map", () => {
  for (const value of [Infinity, NaN, 2000000, "120"]) {
    const s = snapshot(); s.layout.stablePositions.signal.x = value;
    assert.throws(() => core.parseSnapshot(s, base), /coordinate/);
  }
  const s = snapshot(); s.layout.stablePositions.missing = { x: 0, y: 0 };
  assert.throws(() => core.parseSnapshot(s, base), /layout node/);
});

test("routes use only visible nodes and edges and return shortest paths without cycles", () => {
  const nodes = [{ id: "a", type: "core" }, { id: "b", type: "lens" }, { id: "c", type: "process" }, { id: "d", type: "outcome" }];
  const edges = [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d" }, { from: "a", to: "d" }];
  assert.deepEqual(core.findRoutes(nodes, edges, "a"), [["a", "d"], ["a", "b", "c"]]);
  assert.deepEqual(core.findRoutes(nodes.filter((n) => n.id !== "b"), edges, "a"), [["a", "d"]]);
  assert.deepEqual(core.findRoutes(nodes.filter((n) => n.id !== "a"), edges, "a"), []);
  assert.deepEqual(core.findRoutes(nodes, edges.slice(0, 2), "a", undefined, 1), []);
  assert.deepEqual(core.findRoutes(nodes, edges.slice(0, 2), "a", undefined, 2), [["a", "b", "c"]]);
});

test("search and layers combine consistently for the rendered graph and route inputs", () => {
  const layers = new Set(base.types);
  assert.deepEqual(core.visibleNodes(base.nodes, layers, "  "), base.nodes);
  assert.deepEqual(core.visibleNodes(base.nodes, new Set(), ""), []);
  assert.deepEqual(core.visibleNodes(base.nodes, layers, "no-match-for-this-string"), []);
  const signal = base.nodes.find((node) => node.id === "signal");
  assert.ok(core.visibleNodes(base.nodes, layers, "  SIGNAL  ").includes(signal));
  assert.ok(core.visibleNodes(base.nodes, layers, signal.domain.toUpperCase()).includes(signal));
  layers.delete(signal.type);
  const filtered = core.visibleNodes(base.nodes, layers, "signal");
  assert.equal(filtered.includes(signal), false);
  assert.deepEqual(core.findRoutes(filtered, base.edges, signal.id), []);
  assert.deepEqual(base.nodes.find((node) => node.id === "signal"), signal);
});

test("v1 local custom pieces migrate without losing the original save", () => {
  const old = JSON.stringify({ nodes: [customNode], edges: [{ from: "signal", to: customNode.id, label: "added", kind: "custom" }] });
  const storage = memoryStorage({ [core.legacyKey]: old });
  const restored = core.readStorage(storage, base);
  assert.equal(restored.model.nodes.length, base.nodes.length + 1);
  assert.deepEqual(restored.customNodeIds, [customNode.id]);
  assert.equal(storage.getItem(core.legacyKey), old);
});

test("damaged local save recovers a valid backup without changing stored evidence", () => {
  const backup = JSON.stringify(snapshot());
  const storage = memoryStorage({ [core.storageKey]: "{broken", [core.backupKey]: backup });
  const restored = core.readStorage(storage, base);
  assert.deepEqual(restored.model, base);
  assert.match(restored.warning, /Recovered/);
  assert.equal(storage.getItem(core.storageKey), "{broken");
  assert.equal(storage.getItem(core.backupKey), backup);
});

test("unrecoverable or inaccessible storage returns a usable baseline and warning", () => {
  const damaged = memoryStorage({ [core.storageKey]: "null", [core.legacyKey]: '{"nodes":[null],"edges":[]}' });
  const restored = core.readStorage(damaged, base);
  assert.deepEqual(restored.model, base);
  assert.ok(restored.warning);
  const denied = core.readStorage({ getItem() { throw new Error("SecurityError"); } }, base);
  assert.deepEqual(denied.model, base);
  assert.match(denied.warning, /unavailable/);
});

test("saving retains a recoverable prior map and does not overwrite a valid backup with corrupt data", () => {
  const storage = memoryStorage();
  const first = snapshot();
  core.writeStorage(storage, first, base);
  const second = snapshot(); second.nodes[0].summary = "Changed";
  core.writeStorage(storage, second, base);
  assert.deepEqual(JSON.parse(storage.getItem(core.backupKey)), first);
  storage.setItem(core.storageKey, "broken");
  core.writeStorage(storage, second, base);
  assert.deepEqual(JSON.parse(storage.getItem(core.backupKey)), first);
  assert.equal(storage.getItem(core.damagedKey), "broken");
});

test("the first action keeps a previous snapshot recoverable after reload", () => {
  const storage = memoryStorage();
  const before = snapshot();
  const after = snapshot(); after.nodes[0].summary = "First edit";
  core.writeStorage(storage, after, base, before);
  assert.deepEqual(JSON.parse(storage.getItem(core.backupKey)), before);
  assert.equal(core.readStorage(storage, base).model.nodes[0].summary, "First edit");
  assert.deepEqual(core.parseSnapshot(storage.getItem(core.backupKey), base).model, base);
});

test("invalid snapshots cannot replace either the save or backup", () => {
  const storage = memoryStorage({ [core.storageKey]: JSON.stringify(snapshot()), [core.backupKey]: "backup" });
  const before = [...storage.entries];
  const invalid = snapshot(); invalid.nodes[0].type = "not-a-layer";
  assert.throws(() => core.writeStorage(storage, invalid, base));
  assert.deepEqual([...storage.entries], before);
});

test("backup write failure does not replace the current map", () => {
  const original = JSON.stringify(snapshot());
  const storage = memoryStorage({ [core.storageKey]: original });
  const set = storage.setItem;
  storage.setItem = (key, value) => {
    if (key === core.backupKey) throw new Error("QuotaExceededError");
    set(key, value);
  };
  assert.throws(() => core.writeStorage(storage, snapshot(), base), /Quota/);
  assert.equal(storage.getItem(core.storageKey), original);
});

test("storage write failures propagate so the UI can report unsaved changes", () => {
  const storage = { getItem: () => null, setItem() { throw new Error("QuotaExceededError"); } };
  assert.throws(() => core.writeStorage(storage, snapshot(), base), /Quota/);
});

test("deleting a custom piece removes its incident connections and protects source pieces", () => {
  const model = clone(base);
  model.nodes.push(clone(customNode));
  model.edges.push({ from: "signal", to: customNode.id, label: "added", kind: "custom" });
  const result = core.deleteCustom(model, [customNode.id], customNode.id);
  assert.deepEqual(result.model, base);
  assert.deepEqual(result.customNodeIds, []);
  assert.equal(model.nodes.length, base.nodes.length + 1);
  assert.throws(() => core.deleteCustom(model, [customNode.id], "signal"), /Only custom/);
  model.sourceAnchors[0].nodes.push(customNode.id);
  assert.throws(() => core.deleteCustom(model, [customNode.id], customNode.id), /referenced/);
});

test("editorial ratings remain qualitative, including legacy conversion", () => {
  assert.equal(core.fitLabel({ fit: 84 }), "Strong");
  assert.equal(core.fitLabel({ fit: 76 }), "Moderate");
  assert.equal(core.fitLabel({ fit: 58 }), "Tentative");
  assert.equal(core.fitLabel({}), "Unassessed");
  for (const item of [...base.patternSets.map((p) => p.metrics), ...base.answerSignals.vectors]) {
    assert.ok(["Tentative", "Moderate", "Strong"].includes(item.fitLabel));
    assert.equal(item.entries, 0);
    assert.equal(Object.hasOwn(item, "fit"), false);
  }
});
