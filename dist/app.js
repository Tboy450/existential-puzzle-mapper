(function () {
  "use strict";

  const data = window.MAP_DATA;
  const storageKey = "existential-puzzle-custom-v1";
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
    zoom: 1,
    panX: 0,
    panY: 0,
    graphBounds: { minX: -600, maxX: 600, minY: -450, maxY: 450 },
    panBounds: { minX: -900, maxX: 900, minY: -900, maxY: 900 },
    needsInitialFit: true,
    showMotionTrace: false,
    nodes: [],
    edges: [],
    positions: new Map(),
    layoutOrigins: new Map(),
    layoutMotion: new Map(),
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
    toggleMotionTrace: document.getElementById("toggleMotionTrace"),
    panX: document.getElementById("panX"),
    panY: document.getElementById("panY"),
    centerMap: document.getElementById("centerMap"),
    exportMap: document.getElementById("exportMap"),
    pieceForm: document.getElementById("pieceForm"),
    pieceTitle: document.getElementById("pieceTitle"),
    pieceSummary: document.getElementById("pieceSummary"),
    pieceType: document.getElementById("pieceType")
  };

  function loadCustom() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        nodes: Array.isArray(saved.nodes) ? saved.nodes : [],
        edges: Array.isArray(saved.edges) ? saved.edges : []
      };
    } catch (_err) {
      return { nodes: [], edges: [] };
    }
  }

  function saveCustom(customNodes, customEdges) {
    localStorage.setItem(storageKey, JSON.stringify({ nodes: customNodes, edges: customEdges }));
  }

  function initialNodePosition(node, index, count) {
    const angle = (index / Math.max(1, count)) * Math.PI * 2;
    const radius = 190 + (node.weight || 5) * 8;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0
    };
  }

  function recordLayoutMotion() {
    state.layoutMotion.clear();
    state.nodes.forEach((node) => {
      const origin = state.layoutOrigins.get(node.id);
      const p = state.positions.get(node.id);
      if (!origin || !p) return;
      const dx = p.x - origin.x;
      const dy = p.y - origin.y;
      state.layoutMotion.set(node.id, {
        dx,
        dy,
        distance: Math.hypot(dx, dy)
      });
      p.vx = 0;
      p.vy = 0;
    });
  }

  function hydrateState() {
    const custom = loadCustom();
    state.nodes = data.nodes.concat(custom.nodes);
    state.edges = data.edges.concat(custom.edges);
    state.positions.clear();
    state.layoutOrigins.clear();
    state.layoutMotion.clear();
    state.nodes.forEach((node, index) => {
      const p = initialNodePosition(node, index, state.nodes.length);
      state.positions.set(node.id, p);
      state.layoutOrigins.set(node.id, { x: p.x, y: p.y });
    });
    tickLayout(state.nodes, state.edges, 96);
    recordLayoutMotion();
  }

  function nodeById(id) {
    return state.nodes.find((node) => node.id === id);
  }

  function edgeTouches(edge, id) {
    return edge.from === id || edge.to === id;
  }

  function activeNodes() {
    const q = state.search.trim().toLowerCase();
    return state.nodes.filter((node) => {
      if (!state.activeTypes.has(node.type)) return false;
      if (!q) return true;
      return [node.label, node.summary, node.type, node.domain].join(" ").toLowerCase().includes(q);
    });
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
      button.className = "chip is-active";
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
        renderAll();
      });
      els.filters.appendChild(button);
    });
  }

  function switchView(viewName) {
    els.tabs.forEach((tab) => {
      const isActive = tab.dataset.view === viewName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    Object.entries(els.views).forEach(([name, view]) => {
      if (!view) return;
      const isActive = name === viewName;
      view.classList.toggle("is-active", isActive);
      view.hidden = !isActive;
    });
    if (viewName === "map") {
      requestAnimationFrame(renderGraph);
    }
  }

  function svgPoint(event) {
    const rect = els.svg.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    const viewWidth = width / state.zoom;
    const viewHeight = height / state.zoom;
    return {
      x: state.panX - viewWidth / 2 + ((event.clientX - rect.left) / width) * viewWidth,
      y: state.panY - viewHeight / 2 + ((event.clientY - rect.top) / height) * viewHeight
    };
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
      const labelWidth = Math.min(230, longestLine * 7.4);
      const labelHeight = Math.max(18, lines.length * 15);
      minX = Math.min(minX, p.x - size - 80);
      maxX = Math.max(maxX, p.x + size + labelWidth + 90);
      minY = Math.min(minY, p.y - size - 80);
      maxY = Math.max(maxY, p.y + size + labelHeight + 80);
    });
    if (!Number.isFinite(minX)) {
      return { minX: -600, maxX: 600, minY: -450, maxY: 450 };
    }
    return { minX, maxX, minY, maxY };
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
    state.zoom = Math.min(5, Math.max(0.12, fitZoom));
    state.panX = (bounds.minX + bounds.maxX) / 2;
    state.panY = (bounds.minY + bounds.maxY) / 2;
  }

  function tickLayout(nodes, edges, iterations = 1) {
    const visible = new Set(nodes.map((node) => node.id));
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      for (let step = 0; step < 4; step += 1) {
        for (let i = 0; i < nodes.length; i += 1) {
          const a = state.positions.get(nodes[i].id);
          for (let j = i + 1; j < nodes.length; j += 1) {
            const b = state.positions.get(nodes[j].id);
            const dx = a.x - b.x || 0.01;
            const dy = a.y - b.y || 0.01;
            const distSq = Math.max(90, dx * dx + dy * dy);
            const force = 5200 / distSq;
            const fx = dx * force;
            const fy = dy * force;
            a.vx += fx;
            a.vy += fy;
            b.vx -= fx;
            b.vy -= fy;
          }
        }

        edges.forEach((edge) => {
          if (!visible.has(edge.from) || !visible.has(edge.to)) return;
          const a = state.positions.get(edge.from);
          const b = state.positions.get(edge.to);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const ideal = 150 - (edge.strength || 1) * 14;
          const force = (dist - ideal) * 0.012;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        });

        nodes.forEach((node) => {
          const p = state.positions.get(node.id);
          const typeOffset = data.types.indexOf(node.type) - 4;
          p.vx += (-p.x + typeOffset * 22) * 0.004;
          p.vy += -p.y * 0.004;
          p.vx *= 0.72;
          p.vy *= 0.72;
          p.x += p.vx;
          p.y += p.vy;
        });
      }
    }
  }

  function appendMotionTraceLayer(nodes) {
    if (!state.showMotionTrace) return;
    const motionLayer = createSvg("g", { class: "motion-traces" });
    nodes.forEach((node) => {
      const origin = state.layoutOrigins.get(node.id);
      const p = state.positions.get(node.id);
      const motion = state.layoutMotion.get(node.id);
      if (!origin || !p || !motion || motion.distance < 4) return;
      const isSelected = node.id === state.selectedId;
      const line = createSvg("line", {
        class: `motion-trace ${isSelected ? "is-selected" : ""}`,
        x1: origin.x,
        y1: origin.y,
        x2: p.x,
        y2: p.y
      });
      const title = createSvg("title");
      title.textContent = `${node.label}: layout pressure ${Math.round(motion.distance)} units`;
      line.appendChild(title);
      motionLayer.appendChild(line);
      motionLayer.appendChild(createSvg("circle", {
        class: `motion-origin ${isSelected ? "is-selected" : ""}`,
        cx: origin.x,
        cy: origin.y,
        r: isSelected ? 4.5 : 3
      }));
    });
    els.svg.appendChild(motionLayer);
  }

  function renderGraph() {
    const nodes = activeNodes();
    const edges = activeEdges(nodes);

    const rect = els.svg.getBoundingClientRect();
    const width = Math.max(rect.width, 600);
    const height = Math.max(rect.height, 420);
    state.graphBounds = graphContentBounds(nodes);
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

    appendMotionTraceLayer(nodes);

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
        role: "button"
      });
      group.dataset.id = node.id;
      group.appendChild(createSvg("circle", {
        r: size,
        fill: colorByType[node.type] || colorByType.custom
      }));

      const label = createSvg("text", {
        x: size + 7,
        y: -4
      });
      wrapLabel(node.label, 22).forEach((line, index) => {
        const tspan = createSvg("tspan", {
          x: size + 7,
          dy: index === 0 ? 0 : 14
        });
        tspan.textContent = line;
        label.appendChild(tspan);
      });
      group.appendChild(label);

      group.addEventListener("pointerdown", (event) => {
        state.dragging = node.id;
        state.selectedId = node.id;
        group.setPointerCapture(event.pointerId);
        renderInspector();
        renderRoutes();
        renderGraph();
      });
      group.addEventListener("pointermove", (event) => {
        if (state.dragging !== node.id) return;
        const point = svgPoint(event);
        p.x = point.x;
        p.y = point.y;
        p.vx = 0;
        p.vy = 0;
        renderGraph();
      });
      group.addEventListener("pointerup", () => {
        state.dragging = null;
      });
      group.addEventListener("click", () => {
        state.selectedId = node.id;
        renderInspector();
        renderRoutes();
        renderGraph();
      });
      group.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          state.selectedId = node.id;
          renderInspector();
          renderRoutes();
          renderGraph();
        }
      });
      nodeLayer.appendChild(group);
    });
    els.svg.appendChild(nodeLayer);

    els.stats.textContent = `${nodes.length} nodes, ${edges.length} relations`;
    els.zoomLabel.textContent = `${Math.round(state.zoom * 100)}%`;
    syncPanControls();
    syncMotionTraceButton();
  }

  function vectorDirection(dx, dy) {
    const horizontal = dx < -12 ? "west" : dx > 12 ? "east" : "";
    const vertical = dy < -12 ? "north" : dy > 12 ? "south" : "";
    if (vertical && horizontal) return `${vertical}-${horizontal}`;
    return vertical || horizontal || "minimal";
  }

  function layoutPressureBlock(node) {
    const motion = state.layoutMotion.get(node.id);
    if (!motion) return null;
    const section = document.createElement("section");
    section.className = "detail-block pressure-readout";
    const distance = Math.round(motion.distance);
    section.innerHTML = `
      <h3>Layout Pressure</h3>
      <p><strong>${escapeHtml(distance)}</strong> units ${escapeHtml(vectorDirection(motion.dx, motion.dy))}</p>
      <p class="microcopy">A frozen force-layout diagnostic from graph relations and starting position; not proof of causality or outside correlation.</p>
    `;
    return section;
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

    const pressure = layoutPressureBlock(node);
    if (pressure) els.inspector.appendChild(pressure);

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

    const targets = new Set(
      state.nodes
        .filter((candidate) => ["objective", "outcome", "process"].includes(candidate.type) && candidate.id !== node.id)
        .map((candidate) => candidate.id)
    );
    const routes = findRoutes(node.id, targets, 4).slice(0, 5);
    if (!routes.length) {
      els.routes.innerHTML = `<p class="microcopy">No route from this piece with the active map.</p>`;
      return;
    }
    routes.forEach((route) => {
      const div = document.createElement("div");
      div.className = "route-item";
      div.textContent = route.map((id) => nodeById(id)?.label || id).join(" -> ");
      els.routes.appendChild(div);
    });
  }

  function findRoutes(start, targets, maxDepth) {
    const routes = [];
    const queue = [[start]];
    while (queue.length && routes.length < 12) {
      const route = queue.shift();
      const last = route[route.length - 1];
      if (route.length > 1 && targets.has(last)) {
        routes.push(route);
        continue;
      }
      if (route.length > maxDepth) continue;
      state.edges.forEach((edge) => {
        let next = null;
        if (edge.from === last) next = edge.to;
        if (edge.to === last) next = edge.from;
        if (!next || route.includes(next)) return;
        queue.push(route.concat(next));
      });
    }
    return routes;
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
      card.addEventListener("click", () => {
        const first = scenario.outcomes.find((id) => nodeById(id));
        if (first) {
          state.selectedId = first;
          switchView("map");
          renderAll();
        }
      });
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
      card.addEventListener("click", () => {
        const first = objective.nodeIds.find((id) => nodeById(id));
        if (first) {
          state.selectedId = first;
          switchView("map");
          renderAll();
        }
      });
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
      card.addEventListener("click", () => {
        const first = step.nodeIds.find((id) => nodeById(id));
        if (first) {
          state.selectedId = first;
          switchView("map");
          renderAll();
        }
      });
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
      const metrics = pattern.metrics || { fit: 0, entries: 0, mapLinks: pattern.mapFocus.length, basis: "" };
      const card = document.createElement("article");
      card.className = "data-card pattern-card";
      card.innerHTML = `
        <div class="tag-row">
          <span class="tag pattern-tag">${escapeHtml(pattern.family)}</span>
          <span class="tag">${escapeHtml(pattern.status)}</span>
        </div>
        <div class="metric-heading">
          <h3>${escapeHtml(pattern.title)}</h3>
          <span>${escapeHtml(metrics.fit)}%</span>
        </div>
        <div class="meter" aria-label="${escapeHtml(pattern.title)} fit ${escapeHtml(metrics.fit)} percent">
          <span style="width: ${Math.max(0, Math.min(100, Number(metrics.fit) || 0))}%"></span>
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
      card.addEventListener("click", () => {
        const first = pattern.mapFocus.find((id) => nodeById(id));
        if (first) {
          state.selectedId = first;
          switchView("map");
          renderAll();
        }
      });
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
                <span>${escapeHtml(vector.fit)}%</span>
              </div>
              <div class="meter" aria-label="${escapeHtml(vector.title)} fit ${escapeHtml(vector.fit)} percent">
                <span style="width: ${Math.max(0, Math.min(100, Number(vector.fit) || 0))}%"></span>
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

  function serializeMotionMap() {
    return Array.from(state.layoutMotion.entries()).reduce((acc, [id, motion]) => {
      acc[id] = {
        dx: Math.round(motion.dx * 100) / 100,
        dy: Math.round(motion.dy * 100) / 100,
        distance: Math.round(motion.distance * 100) / 100
      };
      return acc;
    }, {});
  }

  function exportMap() {
    const payload = {
      exportedAt: new Date().toISOString(),
      source: data.source,
      project: data.project,
      nodes: state.nodes,
      edges: state.edges,
      layout: {
        note: "Stable positions are the frozen graph coordinates. Layout pressure is the force-layout displacement from deterministic seed positions; it is a navigation diagnostic, not evidence of causality.",
        stablePositions: serializePointMap(state.positions),
        seedPositions: serializePointMap(state.layoutOrigins),
        layoutPressure: serializeMotionMap()
      },
      scenarios: data.scenarios,
      objectives: data.objectives,
      nextSteps: data.nextSteps,
      patternDefinitions: data.patternDefinitions,
      patternSets: data.patternSets,
      patternDatasetTemplate: data.patternDatasetTemplate,
      answerSignals: data.answerSignals,
      termKey: data.termKey,
      references: data.references
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "existential-puzzle-map.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function addPiece(event) {
    event.preventDefault();
    const title = els.pieceTitle.value.trim();
    const summary = els.pieceSummary.value.trim();
    const type = els.pieceType.value;
    if (!title || !summary) return;

    const id = `custom_${Date.now().toString(36)}`;
    const node = {
      id,
      label: title,
      type,
      domain: "user",
      weight: 5,
      summary,
      source: ["user-added"],
      questions: ["What does this piece connect or clarify?"]
    };
    const edge = {
      from: state.selectedId || "signal",
      to: id,
      label: "receives added piece",
      kind: "custom",
      strength: 2
    };
    const saved = loadCustom();
    saved.nodes.push(node);
    saved.edges.push(edge);
    saveCustom(saved.nodes, saved.edges);
    hydrateState();
    state.selectedId = id;
    els.pieceForm.reset();
    renderAll();
  }

  function resetPositions() {
    state.positions.clear();
    state.panX = 0;
    state.panY = 0;
    state.needsInitialFit = true;
    hydrateState();
    renderGraph();
  }

  function setZoom(nextZoom) {
    state.zoom = Math.min(5, Math.max(0.12, nextZoom));
    renderGraph();
  }

  function fitCurrentMap() {
    const rect = els.svg.getBoundingClientRect();
    const width = Math.max(rect.width, 600);
    const height = Math.max(rect.height, 420);
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

  function syncMotionTraceButton() {
    if (!els.toggleMotionTrace) return;
    els.toggleMotionTrace.classList.toggle("is-active", state.showMotionTrace);
    els.toggleMotionTrace.setAttribute("aria-pressed", String(state.showMotionTrace));
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
    state.zoom = Math.min(5, Math.max(0.12, state.touchPan.zoom * zoomRatio));
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

  function bindEvents() {
    els.tabs.forEach((tab) => {
      tab.addEventListener("click", () => switchView(tab.dataset.view));
    });
    els.search.addEventListener("input", () => {
      state.search = els.search.value;
      renderAll();
    });
    els.reset.addEventListener("click", resetPositions);
    els.zoomOut.addEventListener("click", () => setZoom(state.zoom / 1.18));
    els.zoomIn.addEventListener("click", () => setZoom(state.zoom * 1.18));
    els.zoomReset.addEventListener("click", () => setZoom(1));
    els.fitMap.addEventListener("click", fitCurrentMap);
    els.toggleMotionTrace.addEventListener("click", () => {
      state.showMotionTrace = !state.showMotionTrace;
      renderGraph();
    });
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
    els.panX.addEventListener("input", () => setPan(Number(els.panX.value), state.panY));
    els.panY.addEventListener("input", () => setPan(state.panX, Number(els.panY.value)));
    els.centerMap.addEventListener("click", fitCurrentMap);
    els.exportMap.addEventListener("click", exportMap);
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

  hydrateState();
  renderFilters();
  bindEvents();
  switchView("map");
  renderAll();
})();
