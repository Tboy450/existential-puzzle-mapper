(function () {
  "use strict";

  const core = window.MapCore;
  const LAYOUT_VERSION = 4;
  const baseData = JSON.parse(JSON.stringify(window.MAP_DATA));
  let data = JSON.parse(JSON.stringify(baseData));
  const colorByType = {
    core: "#2e6f95",
    barrier: "#a34737",
    puzzle: "#5f5c8a",
    lens: "#49745d",
    process: "#a66f1f",
    objective: "#306b5c",
    outcome: "#7a5d28",
    risk: "#7d3d35",
    custom: "#4f6570"
  };

  const state = {
    activeTypes: new Set(data.types),
    search: "",
    selectedId: "signal",
    activeView: "map",
    customNodeIds: [],
    editingId: null,
    previousSnapshot: null,
    zoom: 1,
    panX: 0,
    panY: 0,
    graphBounds: { minX: -600, maxX: 600, minY: -450, maxY: 450 },
    panBounds: { minX: -900, maxX: 900, minY: -900, maxY: 900 },
    needsInitialFit: true,
    nodes: [],
    edges: [],
    positions: new Map(),
    sim: { frame: 0, alpha: 0 },
    dragging: null,
    touchPan: null,
    timer: null
  };

  const els = {
    tabs: Array.from(document.querySelectorAll(".tab")),
    views: {
      map: document.getElementById("mapView"),
      project: document.getElementById("projectView"),
      scenarios: document.getElementById("scenariosView"),
      simulations: document.getElementById("simulationsView"),
      objectives: document.getElementById("objectivesView"),
      nextSteps: document.getElementById("nextStepsView"),
      patternLab: document.getElementById("patternLabView"),
      termKey: document.getElementById("termKeyView"),
      sources: document.getElementById("sourcesView")
    },
    search: document.getElementById("searchInput"),
    filters: document.getElementById("typeFilters"),
    svg: document.getElementById("graphSvg"),
    inspector: document.getElementById("inspector"),
    routes: document.getElementById("routeList"),
    stats: document.getElementById("mapStats"),
    projectSummary: document.getElementById("projectSummary"),
    scenarioGrid: document.getElementById("scenarioGrid"),
    objectiveGrid: document.getElementById("objectiveGrid"),
    nextStepDefinitions: document.getElementById("nextStepDefinitions"),
    nextStepGrid: document.getElementById("nextStepGrid"),
    patternDefinitions: document.getElementById("patternDefinitions"),
    patternAnswerSignals: document.getElementById("patternAnswerSignals"),
    patternSetGrid: document.getElementById("patternSetGrid"),
    patternSchema: document.getElementById("patternSchema"),
    termKeyGrid: document.getElementById("termKeyGrid"),
    anchors: document.getElementById("sourceAnchors"),
    references: document.getElementById("referenceList"),
    reset: document.getElementById("resetView"),
    zoomOut: document.getElementById("zoomOut"),
    zoomIn: document.getElementById("zoomIn"),
    zoomReset: document.getElementById("zoomReset"),
    zoomLabel: document.getElementById("zoomLabel"),
    fitMap: document.getElementById("fitMap"),
    panX: document.getElementById("panX"),
    panY: document.getElementById("panY"),
    centerMap: document.getElementById("centerMap"),
    exportMap: document.getElementById("exportMap"),
    importMap: document.getElementById("importMap"),
    importFile: document.getElementById("importFile"),
    status: document.getElementById("mapStatus"),
    restorePrevious: document.getElementById("restorePrevious"),
    resetMap: document.getElementById("resetMap"),
    connectionForm: document.getElementById("connectionForm"),
    connectionTarget: document.getElementById("connectionTarget"),
    connectionLabel: document.getElementById("connectionLabel"),
    savePiece: document.getElementById("savePiece"),
    cancelPieceEdit: document.getElementById("cancelPieceEdit"),
    pieceFormTitle: document.getElementById("pieceFormTitle"),
    pieceForm: document.getElementById("pieceForm"),
    pieceTitle: document.getElementById("pieceTitle"),
    pieceSummary: document.getElementById("pieceSummary"),
    pieceType: document.getElementById("pieceType")
  };

  function showStatus(message, error = false) {
    els.status.textContent = message;
    els.status.classList.toggle("is-error", error);
  }

  function rememberPrevious() {
    state.previousSnapshot = currentSnapshot();
  }

  function persist(message = "Map saved in this browser.") {
    try {
      core.writeStorage(localStorage, currentSnapshot(), baseData, state.previousSnapshot);
      showStatus(message);
    } catch (error) {
      showStatus(`Changes are available in this session, but could not be saved locally: ${error.message} Export JSON to keep them.`, true);
    }
  }

  function hydrateState(layout = {}) {
    stopSimulation();
    state.nodes = data.nodes;
    state.edges = data.edges;
    state.positions.clear();
    ringLayout(state.nodes, state.edges);
    // Older saved layouts used a force layout with no positional meaning; rebuild them as rings.
    if (layout.version !== LAYOUT_VERSION) return;
    Object.entries(layout.stablePositions || {}).forEach(([id, point]) => {
      if (state.positions.has(id)) Object.assign(state.positions.get(id), point, { vx: 0, vy: 0 });
    });
  }

  function nodeById(id) {
    return state.nodes.find((node) => node.id === id);
  }

  function edgeTouches(edge, id) {
    return edge.from === id || edge.to === id;
  }

  function activeNodes() {
    return core.visibleNodes(state.nodes, state.activeTypes, state.search);
  }

  function activeEdges(nodes) {
    const ids = new Set(nodes.map((node) => node.id));
    return state.edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to));
  }

  function relationIds(id) {
    const ids = new Set([id]);
    state.edges.forEach((edge) => {
      if (edge.from === id) ids.add(edge.to);
      if (edge.to === id) ids.add(edge.from);
    });
    return ids;
  }

  function renderFilters() {
    els.filters.innerHTML = "";
    data.types.forEach((type) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `chip ${state.activeTypes.has(type) ? "is-active" : ""}`;
      button.setAttribute("aria-pressed", String(state.activeTypes.has(type)));
      button.dataset.type = type;
      button.textContent = type;
      button.addEventListener("click", () => {
        if (state.activeTypes.has(type)) {
          state.activeTypes.delete(type);
          button.classList.remove("is-active");
        } else {
          state.activeTypes.add(type);
          button.classList.add("is-active");
        }
        button.setAttribute("aria-pressed", String(state.activeTypes.has(type)));
        renderGraph();
        renderRoutes();
      });
      els.filters.appendChild(button);
    });
  }

  function switchView(viewName) {
    state.activeView = viewName;
    document.querySelector(".workspace").classList.toggle("is-simulating", viewName === "simulations");
    els.tabs.forEach((tab) => {
      const isActive = tab.dataset.view === viewName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("role", "tab");
      tab.id = `tab-${tab.dataset.view}`;
      tab.tabIndex = isActive ? 0 : -1;
    });
    Object.entries(els.views).forEach(([name, view]) => {
      if (!view) return;
      const isActive = name === viewName;
      view.classList.toggle("is-active", isActive);
      view.hidden = !isActive;
      view.setAttribute("role", "tabpanel");
      view.setAttribute("aria-labelledby", `tab-${name}`);
      view.tabIndex = 0;
    });
    if (viewName === "map") {
      requestAnimationFrame(renderGraph);
    }
  }

  function svgPoint(event) {
    const point = els.svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    return point.matrixTransform(els.svg.getScreenCTM().inverse());
  }

  function createSvg(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs || {}).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function wrapLabel(text, maxChars) {
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";
    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function graphContentBounds(nodes) {
    if (!nodes.length) {
      return { minX: -600, maxX: 600, minY: -450, maxY: 450 };
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    nodes.forEach((node) => {
      const p = state.positions.get(node.id);
      if (!p) return;
      const size = 11 + (node.weight || 5) * 1.6;
      const lines = wrapLabel(node.label, 22);
      const longestLine = Math.max(...lines.map((item) => item.length), 8);
      const labelWidth = Math.min(230, longestLine * 7.4) * 2.2;
      const labelHeight = Math.max(18, lines.length * 15) * 2.2;
      const leftSide = p.x < -20;
      minX = Math.min(minX, p.x - size - 30 - (leftSide ? labelWidth : 0));
      maxX = Math.max(maxX, p.x + size + 30 + (leftSide ? 0 : labelWidth));
      minY = Math.min(minY, p.y - size - 75);
      maxY = Math.max(maxY, p.y + size + labelHeight + 30);
    });
    if (!Number.isFinite(minX)) {
      return { minX: -600, maxX: 600, minY: -450, maxY: 450 };
    }
    const outerRing = Math.max(0, ...(state.ringRadii || []).filter(Boolean)) + 40;
    return {
      minX: Math.min(minX, -outerRing),
      maxX: Math.max(maxX, outerRing),
      minY: Math.min(minY, -outerRing - 20),
      maxY: Math.max(maxY, outerRing)
    };
  }

  function updatePanBounds(viewWidth, viewHeight) {
    const bounds = state.graphBounds;
    const extraX = Math.max(viewWidth * 0.65, 260);
    const extraY = Math.max(viewHeight * 0.65, 220);
    state.panBounds = {
      minX: Math.floor(bounds.minX + viewWidth / 2 - extraX),
      maxX: Math.ceil(bounds.maxX - viewWidth / 2 + extraX),
      minY: Math.floor(bounds.minY + viewHeight / 2 - extraY),
      maxY: Math.ceil(bounds.maxY - viewHeight / 2 + extraY)
    };
    if (state.panBounds.minX > state.panBounds.maxX) {
      const center = (bounds.minX + bounds.maxX) / 2;
      state.panBounds.minX = Math.floor(center - extraX);
      state.panBounds.maxX = Math.ceil(center + extraX);
    }
    if (state.panBounds.minY > state.panBounds.maxY) {
      const center = (bounds.minY + bounds.maxY) / 2;
      state.panBounds.minY = Math.floor(center - extraY);
      state.panBounds.maxY = Math.ceil(center + extraY);
    }
  }

  function fitMapToBounds(width, height, bounds) {
    const graphWidth = Math.max(1, bounds.maxX - bounds.minX);
    const graphHeight = Math.max(1, bounds.maxY - bounds.minY);
    const fitZoom = Math.min(width / graphWidth, height / graphHeight, 1.25);
    state.zoom = fitZoom;
    state.panX = (bounds.minX + bounds.maxX) / 2;
    state.panY = (bounds.minY + bounds.maxY) / 2;
  }

  function minimumZoom() {
    const rect = els.svg.getBoundingClientRect();
    const bounds = state.graphBounds;
    return Math.min(0.12, Math.max(rect.width, 1) / Math.max(bounds.maxX - bounds.minX, 1),
      Math.max(rect.height, 1) / Math.max(bounds.maxY - bounds.minY, 1));
  }

  const RINGS = [
    { types: ["core"], label: "Source signal" },
    { types: ["barrier", "puzzle"], label: "Source puzzle and barriers" },
    { types: ["lens"], label: "Reference lenses", lens: true },
    { types: ["process", "objective", "outcome", "risk"], label: "Moves, outcomes, and risks" },
    { types: [], label: "Added pieces" }
  ];

  function ringIndex(node) {
    if (state.customNodeIds.includes(node.id)) return RINGS.length - 1;
    const index = RINGS.findIndex((ring) => ring.types.includes(node.type));
    return index === -1 ? RINGS.length - 1 : index;
  }

  function circularMean(angles) {
    if (!angles.length) return null;
    const x = angles.reduce((sum, a) => sum + Math.cos(a), 0);
    const y = angles.reduce((sum, a) => sum + Math.sin(a), 0);
    return Math.hypot(x, y) < 1e-6 ? angles[0] : Math.atan2(y, x);
  }

  function ringLayout(nodes, edges) {
    const groups = RINGS.map(() => []);
    nodes.forEach((node) => groups[ringIndex(node)].push(node));
    const neighbours = new Map(nodes.map((node) => [node.id, []]));
    edges.forEach((edge) => {
      if (neighbours.has(edge.from) && neighbours.has(edge.to)) {
        neighbours.get(edge.from).push(edge.to);
        neighbours.get(edge.to).push(edge.from);
      }
    });
    const angles = new Map();
    const radii = [];
    let radius = 0;
    groups.forEach((group, index) => {
      const needed = (group.length * 165) / (Math.PI * 2);
      radius = index === 0 ? (group.length > 1 ? Math.max(150, needed) : 0) : Math.max(radius + 230, needed);
      radii.push(radius);
    });
    const placeRing = (group, useAll) => {
      if (!group.length) return;
      const desired = group.map((node, i) => {
        const linked = neighbours.get(node.id)
          .filter((id) => angles.has(id) && (useAll || ringIndex(nodeById(id)) < ringIndex(node)))
          .map((id) => angles.get(id));
        const mean = circularMean(linked);
        return { node, angle: mean === null ? (i / group.length) * Math.PI * 2 : mean };
      }).sort((a, b) => a.angle - b.angle || a.node.id.localeCompare(b.node.id));
      const step = (Math.PI * 2) / desired.length;
      const offset = circularMean(desired.map((item, i) => item.angle - i * step)) || 0;
      desired.forEach((item, i) => angles.set(item.node.id, offset + i * step));
    };
    groups.forEach((group) => placeRing(group, false));
    for (let pass = 0; pass < 2; pass += 1) groups.forEach((group, index) => { if (index > 0) placeRing(group, true); });
    groups.forEach((group, index) => group.forEach((node) => {
      const angle = angles.get(node.id) - Math.PI / 2;
      state.positions.set(node.id, { x: Math.cos(angle) * radii[index], y: Math.sin(angle) * radii[index], vx: 0, vy: 0 });
    }));
    state.ringRadii = radii.map((r, index) => (groups[index].length ? r : null));
  }

  function labelScale() {
    return Math.min(2.4, Math.max(1, 0.85 / state.zoom));
  }

  function appendRingGuides() {
    const layer = createSvg("g", { class: "ring-guides", "aria-hidden": "true" });
    (state.ringRadii || []).forEach((radius, index) => {
      if (!radius) return;
      layer.appendChild(createSvg("circle", { class: `ring-guide ${RINGS[index].lens ? "is-lens" : ""}`, r: radius, cx: 0, cy: 0 }));
    });
    els.svg.appendChild(layer);
  }

  function stopSimulation() {
    if (state.sim.frame) cancelAnimationFrame(state.sim.frame);
    state.sim = { frame: 0, alpha: 0 };
  }

  function startSimulation(dragId) {
    if (!state.sim.rest) {
      const anchors = new Map();
      state.positions.forEach((p, id) => anchors.set(id, { x: p.x, y: p.y }));
      const rest = state.edges.map((edge) => {
        const a = state.positions.get(edge.from);
        const b = state.positions.get(edge.to);
        return { edge, length: a && b ? Math.hypot(b.x - a.x, b.y - a.y) : 0 };
      });
      state.sim = { frame: 0, alpha: 1, anchors, rest };
    }
    state.sim.dragId = dragId;
    state.sim.linked = relationIds(dragId);
    state.sim.alpha = 1;
    if (!state.sim.frame) state.sim.frame = requestAnimationFrame(stepSimulation);
  }

  function stepSimulation() {
    const sim = state.sim;
    sim.frame = 0;
    const nodes = activeNodes();
    const visible = new Set(nodes.map((node) => node.id));
    sim.rest.forEach(({ edge, length }) => {
      if (!visible.has(edge.from) || !visible.has(edge.to)) return;
      const a = state.positions.get(edge.from);
      const b = state.positions.get(edge.to);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const force = (dist - length) * 0.04 * sim.alpha;
      a.vx += (dx / dist) * force;
      a.vy += (dy / dist) * force;
      b.vx -= (dx / dist) * force;
      b.vy -= (dy / dist) * force;
    });
    for (let i = 0; i < nodes.length; i += 1) {
      const a = state.positions.get(nodes[i].id);
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = state.positions.get(nodes[j].id);
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist >= 70) continue;
        const push = ((70 - dist) / dist) * 0.1 * sim.alpha;
        a.vx += dx * push;
        a.vy += dy * push;
        b.vx -= dx * push;
        b.vy -= dy * push;
      }
    }
    let energy = 0;
    nodes.forEach((node) => {
      const p = state.positions.get(node.id);
      if (node.id === sim.dragId) {
        p.vx = 0;
        p.vy = 0;
        return;
      }
      const home = sim.anchors.get(node.id);
      if (home) {
        const hold = sim.linked && sim.linked.has(node.id) ? 0.006 : 0.08;
        p.vx += (home.x - p.x) * hold * sim.alpha;
        p.vy += (home.y - p.y) * hold * sim.alpha;
      }
      p.vx *= 0.6;
      p.vy *= 0.6;
      p.x += p.vx;
      p.y += p.vy;
      energy += Math.abs(p.vx) + Math.abs(p.vy);
    });
    if (!sim.dragId) sim.alpha *= 0.94;
    renderGraph();
    if (sim.dragId || (sim.alpha > 0.02 && energy > 0.02)) {
      sim.frame = requestAnimationFrame(stepSimulation);
    } else {
      state.positions.forEach((p) => { p.vx = 0; p.vy = 0; });
      state.sim = { frame: 0, alpha: 0 };
      persist("Piece positions saved. Reset Layout restores the provenance rings.");
    }
  }

  function renderGraph() {
    if (state.activeView !== "map") return;
    const focusedNode = document.activeElement?.closest?.(".node")?.dataset.id;
    const nodes = activeNodes();
    const edges = activeEdges(nodes);

    const rect = els.svg.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    if (!state.sim.alpha) state.graphBounds = graphContentBounds(nodes);
    if (state.needsInitialFit) {
      fitMapToBounds(width, height, state.graphBounds);
      state.needsInitialFit = false;
    }
    const viewWidth = width / state.zoom;
    const viewHeight = height / state.zoom;
    updatePanBounds(viewWidth, viewHeight);
    state.panX = Math.min(state.panBounds.maxX, Math.max(state.panBounds.minX, state.panX));
    state.panY = Math.min(state.panBounds.maxY, Math.max(state.panBounds.minY, state.panY));
    els.svg.setAttribute("viewBox", `${state.panX - viewWidth / 2} ${state.panY - viewHeight / 2} ${viewWidth} ${viewHeight}`);
    els.svg.innerHTML = "";

    appendRingGuides();

    const near = relationIds(state.selectedId);
    const edgeLayer = createSvg("g", { class: "edges" });
    edges.forEach((edge) => {
      const a = state.positions.get(edge.from);
      const b = state.positions.get(edge.to);
      const line = createSvg("line", {
        class: `edge ${edgeTouches(edge, state.selectedId) ? "is-near" : ""}`,
        x1: a.x,
        y1: a.y,
        x2: b.x,
        y2: b.y
      });
      const title = createSvg("title");
      title.textContent = `${nodeById(edge.from)?.label || edge.from} ${edge.label} ${nodeById(edge.to)?.label || edge.to}`;
      line.appendChild(title);
      edgeLayer.appendChild(line);
    });
    els.svg.appendChild(edgeLayer);

    const nodeLayer = createSvg("g", { class: "nodes" });
    nodes.forEach((node) => {
      const p = state.positions.get(node.id);
      const size = 11 + (node.weight || 5) * 1.6;
      const group = createSvg("g", {
        class: [
          "node",
          node.id === state.selectedId ? "is-selected" : "",
          state.search || near.has(node.id) ? "" : "is-muted"
        ].join(" ").trim(),
        transform: `translate(${p.x}, ${p.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${node.label}: ${node.type}`,
        "aria-pressed": String(node.id === state.selectedId)
      });
      group.dataset.id = node.id;
      group.appendChild(createSvg("circle", {
        r: size,
        fill: colorByType[node.type] || colorByType.custom
      }));

      const scale = labelScale();
      const leftSide = p.x < -20;
      const labelX = leftSide ? -(size + 7) : size + 7;
      const label = createSvg("text", {
        x: labelX,
        y: -4,
        "text-anchor": leftSide ? "end" : "start",
        style: `font-size:${12 * scale}px;stroke-width:${5 * scale}px`
      });
      wrapLabel(node.label, 22).forEach((line, index) => {
        const tspan = createSvg("tspan", {
          x: labelX,
          dy: index === 0 ? 0 : 14 * scale
        });
        tspan.textContent = line;
        label.appendChild(tspan);
      });
      group.appendChild(label);
      const tip = createSvg("title");
      tip.textContent = `${node.label} (${node.type})${node.summary ? ` — ${node.summary}` : ""}`;
      group.appendChild(tip);

      group.addEventListener("click", () => selectNode(node.id));
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectNode(node.id);
        }
      });
      nodeLayer.appendChild(group);
    });
    els.svg.appendChild(nodeLayer);
    if (focusedNode) focusNode(focusedNode);

    els.stats.textContent = `${nodes.length} nodes, ${edges.length} relations`;
    const percent = state.zoom * 100;
    els.zoomLabel.textContent = `${percent < 10 ? Number(percent.toPrecision(2)) : Math.round(percent)}%`;
    syncPanControls();
  }

  function focusNode(id) {
    Array.from(els.svg.querySelectorAll(".node")).find((node) => node.dataset.id === id)?.focus({ preventScroll: true });
  }

  function selectNode(id, reveal = false) {
    const node = nodeById(id);
    if (!node) return;
    if (reveal) {
      state.search = "";
      els.search.value = "";
      state.activeTypes.add(node.type);
      renderFilters();
      switchView("map");
      const point = state.positions.get(id);
      state.panX = point.x;
      state.panY = point.y;
      state.zoom = Math.max(state.zoom, 0.65);
    }
    state.selectedId = id;
    renderInspector();
    renderRoutes();
    renderGraph();
    if (reveal) focusNode(id);
  }

  function mapCardAction(card, title, ids) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Open on map";
    button.setAttribute("aria-label", `Open ${title} on map`);
    if (!ids.some((id) => nodeById(id))) {
      button.disabled = true;
      button.textContent = "No mapped pieces";
    }
    button.addEventListener("click", () => {
      const first = ids.find((id) => nodeById(id));
      if (first) selectNode(first, true);
    });
    card.appendChild(button);
  }

  function renderInspector() {
    const node = nodeById(state.selectedId) || state.nodes[0];
    if (!node) return;
    const relatedEdges = state.edges.filter((edge) => edgeTouches(edge, node.id));
    const sourceAnchors = data.sourceAnchors.filter((anchor) => anchor.nodes.includes(node.id));
    const references = data.references.filter((ref) => ref.nodeIds.includes(node.id));
    els.inspector.innerHTML = "";

    const head = document.createElement("section");
    head.className = "detail-block";
    head.innerHTML = `
      <span class="node-type">${escapeHtml(node.type)} / ${escapeHtml(node.domain || "general")}</span>
      <h2>${escapeHtml(node.label)}</h2>
      <p class="summary">${escapeHtml(node.summary)}</p>
    `;
    els.inspector.appendChild(head);

    els.inspector.appendChild(blockList("Working Questions", node.questions || []));
    els.inspector.appendChild(blockList("Relations", relatedEdges.map((edge) => {
      const otherId = edge.from === node.id ? edge.to : edge.from;
      const other = nodeById(otherId);
      const direction = edge.from === node.id ? edge.label : `is linked by ${edge.label}`;
      return `${direction}: ${other ? other.label : otherId}`;
    })));

    if (sourceAnchors.length) {
      els.inspector.appendChild(blockList("PDF Anchors", sourceAnchors.map((anchor) => `pp. ${anchor.pages}: ${anchor.title}`), "source-tag"));
    }
    if (references.length) {
      els.inspector.appendChild(blockList("Separate Reference Lenses", references.map((ref) => ref.title), "reference-tag"));
    }
    if (["monomyth", "gatekeepers", "pattern_lab", "pressure_test", "next_question"].includes(node.id)) {
      const simulate = document.createElement("button");
      simulate.type = "button";
      simulate.textContent = "Compare synthetic scenarios";
      simulate.addEventListener("click", () => switchView("simulations"));
      els.inspector.appendChild(simulate);
    }
    if (state.customNodeIds.includes(node.id)) {
      const actions = document.createElement("div");
      actions.className = "custom-actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.textContent = "Edit piece";
      edit.addEventListener("click", () => editPiece(node.id));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Delete piece";
      remove.addEventListener("click", () => deletePiece(node.id));
      actions.append(edit, remove);
      els.inspector.appendChild(actions);
    }
    const removableEdges = relatedEdges.filter((edge) => edge.kind === "custom" &&
      !baseData.edges.some((original) => original.from === edge.from && original.to === edge.to));
    if (removableEdges.length) {
      const actions = document.createElement("section");
      actions.className = "detail-block connection-actions";
      removableEdges.forEach((edge) => {
        const button = document.createElement("button");
        button.type = "button";
        const other = nodeById(edge.from === node.id ? edge.to : edge.from);
        button.textContent = `Remove connection to ${other.label}`;
        button.addEventListener("click", () => {
          rememberPrevious();
          data.edges = data.edges.filter((candidate) => candidate !== edge);
          state.edges = data.edges;
          persist("Connection removed. Restore previous save can undo this.");
          renderAll();
        });
        actions.appendChild(button);
      });
      els.inspector.appendChild(actions);
    }
    renderConnectionTargets();
  }

  function blockList(title, items, tagClass) {
    const section = document.createElement("section");
    section.className = "detail-block";
    const content = items.length
      ? `<ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<p class="microcopy">No entries yet.</p>`;
    section.innerHTML = `<h3>${escapeHtml(title)}</h3>${content}`;
    if (tagClass) {
      section.querySelectorAll("li").forEach((li) => {
        li.classList.add("tag", tagClass);
      });
      const list = section.querySelector("ul");
      if (list) {
        list.className = "tag-row";
      }
    }
    return section;
  }

  function renderRoutes() {
    const node = nodeById(state.selectedId);
    els.routes.innerHTML = "";
    if (!node) return;

    const visibleNodes = activeNodes();
    const routes = core.findRoutes(visibleNodes, activeEdges(visibleNodes), node.id);
    if (!routes.length) {
      els.routes.innerHTML = `<p class="microcopy">${visibleNodes.some((candidate) => candidate.id === node.id)
        ? "No route from this piece with the active map. Try showing more layers or clearing search."
        : "The selected piece is hidden by the current filters. Clear search or show its layer to explore routes."}</p>`;
      return;
    }
    routes.forEach((route) => {
      const div = document.createElement("div");
      div.className = "route-item";
      div.textContent = route.map((id) => nodeById(id)?.label || id).join(" -> ");
      els.routes.appendChild(div);
    });
  }

  function renderProject() {
    const project = data.project;
    els.projectSummary.innerHTML = "";
    if (!project) return;

    const overview = document.createElement("section");
    overview.className = "project-card project-wide";
    overview.innerHTML = `
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.purpose)}</p>
      <p>${escapeHtml(project.method)}</p>
    `;
    els.projectSummary.appendChild(overview);

    const principles = document.createElement("section");
    principles.className = "project-card";
    principles.innerHTML = `
      <h3>Operating Principles</h3>
      <ul class="plain-list">${project.principles.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    `;
    els.projectSummary.appendChild(principles);

    const sections = document.createElement("section");
    sections.className = "project-card";
    sections.innerHTML = `
      <h3>Site Sections</h3>
      <div class="definition-list">
        ${project.sections.map((section) => `
          <article>
            <strong>${escapeHtml(section.title)}</strong>
            <p>${escapeHtml(section.role)}</p>
          </article>
        `).join("")}
      </div>
    `;
    els.projectSummary.appendChild(sections);

    const separation = document.createElement("section");
    separation.className = "project-card project-wide";
    separation.innerHTML = `
      <h3>Clean Separation</h3>
      <div class="separation-grid">
        ${project.separation.map((entry) => `
          <article>
            <strong>${escapeHtml(entry.label)}</strong>
            <p>${escapeHtml(entry.definition)}</p>
          </article>
        `).join("")}
      </div>
    `;
    els.projectSummary.appendChild(separation);
  }

  function renderScenarios() {
    els.scenarioGrid.innerHTML = "";
    data.scenarios.forEach((scenario) => {
      const card = document.createElement("article");
      card.className = "data-card";
      card.innerHTML = `
        <h3>${escapeHtml(scenario.title)}</h3>
        <p>${escapeHtml(scenario.premise)}</p>
        ${miniList("Assumptions", scenario.assumptions)}
        ${miniList("Moves", scenario.moves)}
        ${miniTags("Possible outcomes", scenario.outcomes)}
      `;
      mapCardAction(card, scenario.title, scenario.outcomes);
      els.scenarioGrid.appendChild(card);
    });
  }

  function renderObjectives() {
    els.objectiveGrid.innerHTML = "";
    data.objectives.forEach((objective) => {
      const card = document.createElement("article");
      card.className = "data-card";
      card.innerHTML = `
        <h3>${escapeHtml(objective.title)}</h3>
        <p>${escapeHtml(objective.definition)}</p>
        ${miniList("First moves", objective.firstMoves)}
        ${miniList("Signals", objective.signals)}
        ${miniTags("Mapped nodes", objective.nodeIds)}
      `;
      mapCardAction(card, objective.title, objective.nodeIds);
      els.objectiveGrid.appendChild(card);
    });
  }

  function renderNextSteps() {
    els.nextStepGrid.innerHTML = "";
    (data.nextSteps || []).forEach((step) => {
      const card = document.createElement("article");
      card.className = "data-card next-step-card";
      card.innerHTML = `
        <div class="tag-row">
          <span class="tag direction-tag">${escapeHtml(step.mode)}</span>
          <span class="tag">${escapeHtml(step.tempo)}</span>
        </div>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.orientation)}</p>
        <p><strong>Different because:</strong> ${escapeHtml(step.whyDifferent)}</p>
        ${miniList("Try this", step.actions)}
        ${miniTags("Map focus", step.nodeIds)}
      `;
      mapCardAction(card, step.title, step.nodeIds);
      els.nextStepGrid.appendChild(card);
    });
  }

  function renderNextStepDefinitions() {
    els.nextStepDefinitions.innerHTML = "";
    (data.nextStepDefinitions || []).forEach((entry) => {
      const item = document.createElement("article");
      item.className = "definition-item";
      item.innerHTML = `
        <h3>${escapeHtml(entry.term)}</h3>
        <p>${escapeHtml(entry.definition)}</p>
      `;
      els.nextStepDefinitions.appendChild(item);
    });
  }

  function renderPatternLab() {
    els.patternDefinitions.innerHTML = "";
    (data.patternDefinitions || []).forEach((entry) => {
      const item = document.createElement("article");
      item.className = "definition-item";
      item.innerHTML = `
        <h3>${escapeHtml(entry.term)}</h3>
        <p>${escapeHtml(entry.definition)}</p>
      `;
      els.patternDefinitions.appendChild(item);
    });

    renderAnswerSignals();

    els.patternSetGrid.innerHTML = "";
    (data.patternSets || []).forEach((pattern) => {
      const metrics = pattern.metrics || { fitLabel: "Unassessed", entries: 0, mapLinks: pattern.mapFocus.length, basis: "" };
      const card = document.createElement("article");
      card.className = "data-card pattern-card";
      card.innerHTML = `
        <div class="tag-row">
          <span class="tag pattern-tag">${escapeHtml(pattern.family)}</span>
          <span class="tag">${escapeHtml(pattern.status)}</span>
        </div>
        <div class="metric-heading">
          <h3>${escapeHtml(pattern.title)}</h3>
          <span class="fit-rating">${escapeHtml(core.fitLabel(metrics))}</span>
        </div>
        <div class="metric-row">
          <span>entries ${escapeHtml(metrics.entries)}</span>
          <span>map links ${escapeHtml(metrics.mapLinks)}</span>
        </div>
        <p>${escapeHtml(pattern.premise)}</p>
        <p class="metric-basis">${escapeHtml(metrics.basis)}</p>
        ${miniList("Collects", pattern.collects)}
        ${pattern.instances ? miniList("Possible instances", pattern.instances) : ""}
        ${miniList("Pattern questions", pattern.patternQuestions)}
        ${miniTags("Map focus", pattern.mapFocus)}
      `;
      mapCardAction(card, pattern.title, pattern.mapFocus);
      els.patternSetGrid.appendChild(card);
    });

    const template = data.patternDatasetTemplate;
    if (!template) {
      els.patternSchema.innerHTML = "";
      return;
    }
    els.patternSchema.innerHTML = `
      <section class="schema-card">
        <div>
          <h3>${escapeHtml(template.title)}</h3>
          <p>${escapeHtml(template.rule)}</p>
        </div>
        <pre>${escapeHtml(JSON.stringify(template.fields, null, 2))}</pre>
      </section>
    `;
  }

  function renderAnswerSignals() {
    const answerSignals = data.answerSignals;
    if (!answerSignals) {
      els.patternAnswerSignals.innerHTML = "";
      return;
    }
    els.patternAnswerSignals.innerHTML = `
      <section class="answer-signal-card">
        <div class="answer-signal-intro">
          <h3>Answer Signals</h3>
          <p>${escapeHtml(answerSignals.note)}</p>
        </div>
        <div class="answer-vector-grid">
          ${(answerSignals.vectors || []).map((vector) => `
            <article class="answer-vector">
              <div class="metric-heading">
                <h4>${escapeHtml(vector.title)}</h4>
                <span class="fit-rating">${escapeHtml(core.fitLabel(vector))}</span>
              </div>
              <div class="metric-row">
                <span>entries ${escapeHtml(vector.entries)}</span>
                <span>patterns ${escapeHtml(vector.linkedPatterns)}</span>
              </div>
              <p>${escapeHtml(vector.claim)}</p>
              ${miniList("Supports", vector.supports)}
              <p class="metric-basis"><strong>Raises:</strong> ${escapeHtml(vector.wouldRaise)}</p>
              <p class="metric-basis"><strong>Lowers:</strong> ${escapeHtml(vector.wouldLower)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }

  function renderTermKey() {
    els.termKeyGrid.innerHTML = "";
    (data.termKey || []).forEach((group) => {
      const section = document.createElement("section");
      section.className = "term-group";
      section.innerHTML = `
        <h3>${escapeHtml(group.category)}</h3>
        <div class="term-list">
          ${(group.terms || []).map((item) => `
            <article class="term-item">
              <h4>${escapeHtml(item.term)}</h4>
              <p>${escapeHtml(item.definition)}</p>
              <dl>
                <dt>Used for</dt>
                <dd>${escapeHtml(item.usedFor)}</dd>
                <dt>Not</dt>
                <dd>${escapeHtml(item.not)}</dd>
              </dl>
            </article>
          `).join("")}
        </div>
      `;
      els.termKeyGrid.appendChild(section);
    });
  }

  function renderSources() {
    els.anchors.innerHTML = "";
    data.sourceAnchors.forEach((anchor) => {
      const item = document.createElement("article");
      item.className = "anchor-item";
      item.innerHTML = `
        <h3>pp. ${escapeHtml(anchor.pages)} - ${escapeHtml(anchor.title)}</h3>
        <p>${escapeHtml(anchor.note)}</p>
        ${miniTags("Nodes", anchor.nodes, "source-tag")}
      `;
      els.anchors.appendChild(item);
    });

    els.references.innerHTML = "";
    data.references.forEach((ref) => {
      const item = document.createElement("article");
      item.className = "reference-item";
      item.innerHTML = `
        <h3>${escapeHtml(ref.title)}</h3>
        <p>${escapeHtml(ref.use)}</p>
        ${miniTags(ref.category, ref.nodeIds, "reference-tag")}
      `;
      els.references.appendChild(item);
    });
  }

  function miniList(title, items) {
    return `
      <section>
        <div class="section-title">${escapeHtml(title)}</div>
        <ul class="plain-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    `;
  }

  function miniTags(title, ids, extraClass) {
    return `
      <section>
        <div class="section-title">${escapeHtml(title)}</div>
        <div class="tag-row">
          ${ids.map((id) => `<span class="tag ${extraClass || ""}">${escapeHtml(nodeById(id)?.label || id)}</span>`).join("")}
        </div>
      </section>
    `;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function serializePointMap(pointMap) {
    return Array.from(pointMap.entries()).reduce((acc, [id, point]) => {
      acc[id] = {
        x: Math.round(point.x * 100) / 100,
        y: Math.round(point.y * 100) / 100
      };
      return acc;
    }, {});
  }

  function currentLayout() {
    return {
      version: LAYOUT_VERSION,
      note: "Provenance rings: distance from the centre is distance from the PDF source (core, source puzzle and barriers, reference lenses, moves and outcomes, custom pieces). Positions within a ring are arranged near connected pieces.",
      stablePositions: serializePointMap(state.positions)
    };
  }

  function currentSnapshot() {
    return core.buildSnapshot(data, state.customNodeIds, currentLayout());
  }

  function exportMap() {
    const payload = currentSnapshot();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "existential-puzzle-map.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus("Map exported with source anchors, definitions, custom pieces, and layout. Source PDF and transcript are separate files.");
  }

  function applySnapshot(snapshot) {
    data = snapshot.model;
    state.customNodeIds = snapshot.customNodeIds;
    state.selectedId = data.nodes.some((node) => node.id === "signal") ? "signal" : data.nodes[0].id;
    state.activeTypes = new Set(data.types);
    state.search = "";
    els.search.value = "";
    state.dragging = null;
    state.touchPan = null;
    state.needsInitialFit = true;
    els.pieceType.replaceChildren();
    data.types.forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      els.pieceType.appendChild(option);
    });
    cancelEdit();
    hydrateState(snapshot.layout);
    renderFilters();
    renderAll();
  }

  async function importMap(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose a JSON file smaller than 5 MB.");
      const snapshot = core.parseSnapshot(await file.text(), baseData);
      rememberPrevious();
      applySnapshot(snapshot);
      persist(snapshot.legacy ? "Imported an older export. Missing source anchors and definitions were restored from the bundled map."
        : "Map imported and saved. Restore previous save can undo this.");
    } catch (error) {
      showStatus(`Import failed: ${error.message} The current map is unchanged.`, true);
    } finally {
      event.target.value = "";
    }
  }

  function renderConnectionTargets() {
    const previous = els.connectionTarget.value;
    els.connectionTarget.replaceChildren();
    state.nodes.filter((node) => node.id !== state.selectedId).forEach((node) => {
      const option = document.createElement("option");
      option.value = node.id;
      option.textContent = node.label;
      els.connectionTarget.appendChild(option);
    });
    if (Array.from(els.connectionTarget.options).some((option) => option.value === previous)) els.connectionTarget.value = previous;
  }

  function cancelEdit() {
    state.editingId = null;
    els.pieceForm.reset();
    if (data.types.includes("custom")) els.pieceType.value = "custom";
    els.pieceFormTitle.textContent = "Add Piece";
    els.savePiece.textContent = "Attach to selected";
    els.cancelPieceEdit.hidden = true;
  }

  function editPiece(id) {
    const node = nodeById(id);
    if (!node || !state.customNodeIds.includes(id)) return;
    state.editingId = id;
    els.pieceTitle.value = node.label;
    els.pieceSummary.value = node.summary;
    els.pieceType.value = node.type;
    if (!els.pieceType.value) {
      const option = document.createElement("option");
      option.value = node.type;
      option.textContent = node.type;
      els.pieceType.appendChild(option);
      els.pieceType.value = node.type;
    }
    els.pieceFormTitle.textContent = "Edit Piece";
    els.savePiece.textContent = "Save changes";
    els.cancelPieceEdit.hidden = false;
    els.pieceTitle.focus();
  }

  function deletePiece(id) {
    if (!window.confirm(`Delete “${nodeById(id)?.label}” and its connections? You can restore the previous save.`)) return;
    try {
      const next = core.deleteCustom(data, state.customNodeIds, id);
      const layout = currentLayout();
      rememberPrevious();
      data = next.model;
      state.customNodeIds = next.customNodeIds;
      state.selectedId = data.nodes[0].id;
      if (state.editingId === id) cancelEdit();
      hydrateState(layout);
      persist("Custom piece deleted. Restore previous save can undo this.");
      renderAll();
    } catch (error) { showStatus(error.message, true); }
  }

  function restorePrevious() {
    try {
      const saved = state.previousSnapshot || localStorage.getItem(core.backupKey);
      if (!saved) { showStatus("There is no previous save yet."); return; }
      const snapshot = core.parseSnapshot(saved, baseData);
      rememberPrevious();
      applySnapshot(snapshot);
      persist("Previous map restored.");
    } catch (error) { showStatus(`Could not restore the previous save: ${error.message}`, true); }
  }

  function restoreOriginal() {
    if (!window.confirm("Restore the original map and remove your custom pieces and added connections? Export JSON first if you want a separate backup. The previous save remains recoverable.")) return;
    rememberPrevious();
    applySnapshot({ model: JSON.parse(JSON.stringify(baseData)), customNodeIds: [], layout: {} });
    persist("Original map restored. Restore previous save can undo this.");
  }

  function addConnection(event) {
    event.preventDefault();
    const to = els.connectionTarget.value;
    const label = els.connectionLabel.value.trim();
    if (!label || !to) { showStatus("Choose a target piece and enter a relationship.", true); return; }
    const next = { ...data, edges: data.edges.concat({ from: state.selectedId, to, label, kind: "custom", strength: 2 }) };
    try { core.validateModel(next); }
    catch (error) { showStatus(error.message, true); return; }
    rememberPrevious();
    data = next;
    state.edges = data.edges;
    persist("Connection added. Reset Layout re-arranges the rings around its new relationships.");
    renderAll();
  }

  function addPiece(event) {
    event.preventDefault();
    const title = els.pieceTitle.value.trim();
    const summary = els.pieceSummary.value.trim();
    const type = els.pieceType.value;
    if (!title || !summary) { showStatus("Enter a piece name and summary, not just whitespace.", true); return; }

    if (state.editingId) {
      rememberPrevious();
      const node = nodeById(state.editingId);
      Object.assign(node, { label: title, summary, type });
      state.activeTypes.add(type);
      state.selectedId = node.id;
      cancelEdit();
      renderFilters();
      persist("Piece updated.");
      renderAll();
      return;
    }
    try {
      insertCustomPiece({ label: title, summary, type, domain: "user", source: ["user-added"],
        questions: ["What does this piece connect or clarify?"] });
    } catch (error) { showStatus(error.message, true); }
  }

  function insertCustomPiece(piece, anchorId = state.selectedId) {
    if (state.nodes.length >= 250) throw new Error("This map has reached its 250-piece limit.");
    const id = `custom_${crypto.randomUUID ? crypto.randomUUID() : `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`}`;
    const node = {
      id,
      weight: 5,
      ...piece
    };
    const edge = {
      from: anchorId,
      to: id,
      label: "receives added piece",
      kind: "custom",
      strength: 2
    };
    const next = { ...data, nodes: data.nodes.concat(node), edges: data.edges.concat(edge) };
    core.validateModel(next);
    const layout = currentLayout();
    rememberPrevious();
    data = next;
    state.customNodeIds.push(id);
    state.activeTypes.add(piece.type);
    hydrateState(layout);
    state.selectedId = id;
    state.search = "";
    els.search.value = "";
    cancelEdit();
    renderFilters();
    persist("Piece added and saved.");
    renderAll();
    return id;
  }

  function resetPositions() {
    rememberPrevious();
    state.positions.clear();
    state.panX = 0;
    state.panY = 0;
    state.needsInitialFit = true;
    hydrateState();
    persist("Layout reset and saved.");
    renderGraph();
    renderInspector();
  }

  function setZoom(nextZoom) {
    state.zoom = Math.min(5, Math.max(minimumZoom(), nextZoom));
    renderGraph();
  }

  function fitCurrentMap() {
    const rect = els.svg.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    state.graphBounds = graphContentBounds(activeNodes());
    fitMapToBounds(width, height, state.graphBounds);
    renderGraph();
  }

  function setPan(nextX, nextY) {
    state.panX = Math.min(state.panBounds.maxX, Math.max(state.panBounds.minX, nextX));
    state.panY = Math.min(state.panBounds.maxY, Math.max(state.panBounds.minY, nextY));
    renderGraph();
  }

  function syncPanControls() {
    if (els.panX) {
      els.panX.min = String(Math.floor(state.panBounds.minX));
      els.panX.max = String(Math.ceil(state.panBounds.maxX));
      els.panX.value = String(Math.round(state.panX));
    }
    if (els.panY) {
      els.panY.min = String(Math.floor(state.panBounds.minY));
      els.panY.max = String(Math.ceil(state.panBounds.maxY));
      els.panY.value = String(Math.round(state.panY));
    }
  }

  function touchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  function touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function handleTouchStart(event) {
    if (event.touches.length !== 2) return;
    finishDrag();
    const center = touchCenter(event.touches);
    state.touchPan = {
      x: center.x,
      y: center.y,
      distance: touchDistance(event.touches),
      zoom: state.zoom
    };
  }

  function handleTouchMove(event) {
    if (event.touches.length !== 2 || !state.touchPan) return;
    event.preventDefault();
    const center = touchCenter(event.touches);
    const dx = center.x - state.touchPan.x;
    const dy = center.y - state.touchPan.y;
    const distance = touchDistance(event.touches);
    const zoomRatio = state.touchPan.distance > 0 ? distance / state.touchPan.distance : 1;
    state.zoom = Math.min(5, Math.max(minimumZoom(), state.touchPan.zoom * zoomRatio));
    setPan(state.panX - dx / state.zoom, state.panY - dy / state.zoom);
    state.touchPan.x = center.x;
    state.touchPan.y = center.y;
    state.touchPan.distance = distance;
    state.touchPan.zoom = state.zoom;
  }

  function handleTouchEnd(event) {
    if (event.touches.length < 2) {
      state.touchPan = null;
    }
  }

  function beginDrag(event) {
    if (event.button !== 0 || event.isPrimary === false || state.touchPan) return;
    const id = event.target.closest(".node")?.dataset.id;
    const point = svgPoint(event);
    state.dragging = {
      id, pointerId: event.pointerId, x: event.clientX, y: event.clientY,
      startPoint: point, startPosition: id ? { ...state.positions.get(id) } : null,
      startPanX: state.panX, startPanY: state.panY, moved: false,
      before: id ? currentSnapshot() : null
    };
    els.svg.setPointerCapture(event.pointerId);
    if (id) selectNode(id);
  }

  function moveDrag(event) {
    const drag = state.dragging;
    if (!drag || drag.pointerId !== event.pointerId || state.touchPan) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 3) return;
    drag.moved = true;
    if (drag.id) {
      const point = svgPoint(event);
      const position = state.positions.get(drag.id);
      position.x = drag.startPosition.x + point.x - drag.startPoint.x;
      position.y = drag.startPosition.y + point.y - drag.startPoint.y;
      startSimulation(drag.id);
      renderGraph();
    } else {
      setPan(drag.startPanX - (event.clientX - drag.x) / state.zoom, drag.startPanY - (event.clientY - drag.y) / state.zoom);
    }
  }

  function finishDrag(event) {
    const drag = state.dragging;
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    state.dragging = null;
    if (els.svg.hasPointerCapture(drag.pointerId)) els.svg.releasePointerCapture(drag.pointerId);
    if (drag.id && drag.moved) {
      state.previousSnapshot = drag.before;
      if (state.sim.alpha > 0) {
        state.sim.dragId = null;
        state.sim.anchors.set(drag.id, { x: state.positions.get(drag.id).x, y: state.positions.get(drag.id).y });
      } else {
        persist("Piece position saved. Reset Layout restores the provenance rings.");
      }
    }
  }

  function bindEvents() {
    els.tabs.forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
      tab.addEventListener("keydown", (event) => {
        const index = els.tabs.indexOf(tab);
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % els.tabs.length;
        if (event.key === "ArrowLeft") next = (index + els.tabs.length - 1) % els.tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = els.tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        switchView(els.tabs[next].dataset.view);
        els.tabs[next].focus();
      });
    });
    els.search.addEventListener("input", () => {
      state.search = els.search.value;
      renderGraph();
      renderRoutes();
    });
    els.reset.addEventListener("click", resetPositions);
    els.zoomOut.addEventListener("click", () => setZoom(state.zoom / 1.18));
    els.zoomIn.addEventListener("click", () => setZoom(state.zoom * 1.18));
    els.zoomReset.addEventListener("click", () => setZoom(1));
    els.fitMap.addEventListener("click", fitCurrentMap);
    els.svg.addEventListener("wheel", (event) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        setZoom(event.deltaY > 0 ? state.zoom / 1.12 : state.zoom * 1.12);
      } else {
        setPan(state.panX + event.deltaX / state.zoom, state.panY + event.deltaY / state.zoom);
      }
    }, { passive: false });
    els.svg.addEventListener("touchstart", handleTouchStart, { passive: true });
    els.svg.addEventListener("touchmove", handleTouchMove, { passive: false });
    els.svg.addEventListener("touchend", handleTouchEnd);
    els.svg.addEventListener("touchcancel", handleTouchEnd);
    els.svg.addEventListener("pointerdown", beginDrag);
    els.svg.addEventListener("pointermove", moveDrag);
    els.svg.addEventListener("pointerup", finishDrag);
    els.svg.addEventListener("pointercancel", finishDrag);
    els.svg.addEventListener("lostpointercapture", finishDrag);
    els.panX.addEventListener("input", () => setPan(Number(els.panX.value), state.panY));
    els.panY.addEventListener("input", () => setPan(state.panX, Number(els.panY.value)));
    els.centerMap.addEventListener("click", fitCurrentMap);
    els.exportMap.addEventListener("click", exportMap);
    els.importMap.addEventListener("click", () => els.importFile.click());
    els.importFile.addEventListener("change", importMap);
    els.cancelPieceEdit.addEventListener("click", cancelEdit);
    els.connectionForm.addEventListener("submit", addConnection);
    els.restorePrevious.addEventListener("click", restorePrevious);
    els.resetMap.addEventListener("click", restoreOriginal);
    els.pieceForm.addEventListener("submit", addPiece);
    window.addEventListener("resize", renderGraph);
  }

  function renderAll() {
    renderGraph();
    renderProject();
    renderInspector();
    renderRoutes();
    renderScenarios();
    renderObjectives();
    renderNextStepDefinitions();
    renderNextSteps();
    renderPatternLab();
    renderTermKey();
    renderSources();
  }

  let restored;
  try { restored = core.readStorage(localStorage, baseData); }
  catch (_error) { restored = { model: data, customNodeIds: [], layout: {}, warning: "Local storage is unavailable. Export JSON to keep session changes." }; }
  bindEvents();
  switchView("map");
  applySnapshot(restored);
  showStatus(restored.warning || "Changes save in this browser. Export JSON for a portable backup.", Boolean(restored.warning));
  window.SimulationWorkbench.mount({
    escapeHtml,
    openView: switchView,
    openMapNode(id) {
      if (!nodeById(id)) return false;
      selectNode(id, true);
      return true;
    },
    addFinding(finding) {
      const type = data.types.includes("process") ? "process" : data.types[0];
      const id = insertCustomPiece({ ...finding, type, domain: "simulation", source: ["user-added", "synthetic"] },
        nodeById("pattern_lab") ? "pattern_lab" : state.selectedId);
      selectNode(id, true);
    }
  });
  if (location.hash === "#simulations") switchView("simulations");
})();
