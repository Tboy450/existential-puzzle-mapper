(function () {
  "use strict";

  const engine = window.SimulationCore;
  const storageKey = "existential-puzzle-simulation-v1";
  const fieldNames = ["seed", "runs", "budget", "access", "difficulty", "cooperation", "insight", "comparison"];

  function mount({ escapeHtml: esc, openMapNode, addFinding, openView }) {
    const el = (name) => document.getElementById(`simulation${name}`);
    const fields = Object.fromEntries(fieldNames.map((key) => [key, el(key[0].toUpperCase() + key.slice(1))]));
    let result = null, busy = false, dirty = false;
    const title = (cohort) => `${engine.strategies.find((s) => s.id === cohort.strategy).title} / ${cohort.access}% gated clues`;
    const rate = (count, total) => total ? `${count}/${total} (${Number((100 * count / total).toFixed(1))}%)` : "Not applicable (0 cases)";
    const status = (message, error = false) => {
      el("Status").textContent = message;
      el("Status").classList.toggle("is-error", error);
    };
    function syncControls() {
      el("Fields").disabled = busy;
      el("Run").disabled = busy;
      el("Import").disabled = busy;
      el("Export").disabled = busy || dirty || !result;
      el("Pin").disabled = busy || dirty || !result;
      fields.access.disabled = fields.comparison.value === "access";
      el("AccessNote").textContent = fields.comparison.value === "access"
        ? "Polarized comparison overrides gated clues with 0% and 100%; all other settings stay fixed."
        : "Every policy uses the same synthetic worlds and action-keyed random draws.";
      el("Results").setAttribute("aria-busy", String(busy));
    }
    function readConfig() {
      const values = Object.fromEntries(fieldNames.map((key) => [key,
        ["insight", "comparison"].includes(key) ? fields[key].value : Number(fields[key].value)]));
      return engine.validateConfig(values);
    }
    function setConfig(config) {
      for (const key of fieldNames) fields[key].value = String(config[key]);
      const preset = engine.presets.find((p) => ["access", "difficulty", "cooperation"].every((key) => p[key] === config[key]));
      el("Preset").value = preset ? preset.id : "custom";
      syncControls();
    }
    function markDirty() {
      dirty = true;
      syncControls();
      status(result ? "Settings changed. Run again before exporting or adding a finding; the results below still show the previous recipe." : "Settings ready. Run comparison to produce synthetic results.");
    }
    const table = (headers, rows) => `<table><thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((cells) => `<tr>${cells.map((cell, i) => i ? `<td data-label="${esc(headers[i])}">${cell}</td>` : `<th scope="row">${cell}</th>`).join("")}</tr>`).join("")}</tbody></table>`;

    function renderResults() {
      const { config, cohorts } = result;
      el("Results").hidden = false;
      el("Recipe").textContent = `Engine v${result.engineVersion} | seed ${config.seed} | ${config.runs} cases per policy | ${config.budget} actions |
        insight: ${config.insight} | failure ${config.difficulty}% | cooperation ${config.cooperation}% |
        ${config.comparison === "access" ? "access: 0% vs 100%" : `access: ${config.access}%`}.`;
      el("Table").innerHTML = table(
        ["Policy / access", "Verified gain", "Shared outcome", "Monomyth-like", "Hierarchy", "Both", "Neither"],
        cohorts.map((cohort, i) => {
          const { counts: c, total: n } = cohort.summary;
          return [`<button type="button" data-cohort="${i}">${esc(title(cohort))}</button>`,
            ...["verified", "shared", "monomyth", "hierarchy", "both", "neither"].map((key) => esc(rate(c[key], n)))];
        }));
      el("Conditional").innerHTML = table(
        ["Policy / access", "Hierarchy among inside cases", "Hierarchy among outside cases"],
        cohorts.map((cohort) => [esc(title(cohort)), ...["hierarchyInside", "hierarchyOutside"].map((key) => {
          const group = cohort.summary[key];
          return esc(rate(group.count, group.total));
        })]));
      const candidates = cohorts.filter((c) => c.strategy !== "standard");
      const mostVariantOnly = candidates.reduce((best, c) => c.paired.variantOnly > best.paired.variantOnly ? c : best);
      el("Process").textContent = `${title(mostVariantOnly)} produced a shared outcome in ${mostVariantOnly.paired.variantOnly} paired cases where the standard policy at the same access did not;
        the reverse happened in ${mostVariantOnly.paired.baselineOnly}. This is a comparison to investigate, not a recommended worldview.
        Inspect both kinds of case, change one assumption, and repeat with another seed before treating a difference as stable.`;
      el("Cohort").innerHTML = cohorts.map((c, i) => `<option value="${i}">${esc(title(c))}</option>`).join("");
      el("Filter").value = "all";
      renderCases();
    }

    function selectedCohort() {
      return result.cohorts[Number(el("Cohort").value)];
    }
    function renderCases() {
      if (!result) return;
      const cohort = selectedCohort();
      const filter = el("Filter").value;
      const cases = cohort.runs.filter((run) => {
        const inside = run.matches.monomyth.length > 0, hierarchy = run.matches.hierarchy.length > 0;
        return filter === "all" || (filter === "inside" && inside) || (filter === "outside" && !inside) ||
          (filter === "hierarchy" && hierarchy) || (filter === "neither" && !inside && !hierarchy) ||
          (filter === "shared" && run.outcome.shared) || (filter === "unfinished" && !run.outcome.shared);
      });
      el("Case").innerHTML = cases.map((run) => `<option value="${run.case - 1}">Case ${run.case}: ${run.outcome.shared ? "shared outcome" : "unfinished"} / ${run.matches.monomyth.length ? "inside" : "outside"}</option>`).join("");
      el("Case").disabled = !cases.length;
      const p = cohort.paired, s = cohort.summary;
      el("Paired").textContent = `Paired shared outcomes against standard at the same access: both ${p.both}; standard only ${p.baselineOnly}; this policy only ${p.variantOnly}; neither ${p.neither}.
        Alternative signatures: distributed gain ${rate(s.counts.distributed, s.total)}; gain before call ${rate(s.counts.gainBeforeCall, s.total)}; revision ${rate(s.counts.revision, s.total)}.
        Insight placement enacted: ${result.config.insight} in ${s.insightRoles[result.config.insight]}/${s.total} cases (an assigned placement, not an independently discovered frequency).`;
      if (cases.length) renderTrace();
      else el("Trace").innerHTML = "<p>No cases match this filter. The comparison still includes all cases.</p>";
    }

    function renderTrace() {
      const cohort = selectedCohort();
      const run = cohort.runs[Number(el("Case").value)];
      const baseline = result.cohorts.find((c) => c.strategy === "standard" && c.access === cohort.access).runs[run.case - 1];
      const names = { monomyth: "Monomyth-like sequence", hierarchy: "Access hierarchy", distributed: "Distributed gain",
        gainBeforeCall: "Gain before call", revision: "Revision after rejection" };
      const marked = new Set(Object.values(run.matches).flat());
      el("Trace").innerHTML = `
        <h4>Case ${run.case}: ${esc(title(cohort))}</h4>
        <p>${run.outcome.actions}/${result.config.budget} actions used; ${run.outcome.clues}/3 clues obtained.
          ${run.outcome.verified ? "Verified gain acquired." : "No verified gain."}
          ${run.outcome.shared ? "Shared acceptance criterion met." : "Shared acceptance criterion not met within the budget."}
          Standard counterpart: ${baseline.outcome.shared ? "shared outcome" : "unfinished"}.</p>
        <ul class="plain-list">${Object.entries(names).map(([key, name]) => `<li><strong>${esc(name)}:</strong>
          ${run.matches[key].length ? `matched at steps ${run.matches[key].join(", ")}` : "not matched in this bounded trace"}</li>`).join("")}</ul>
        <details><summary>Synthetic oracle and world settings (not visible to participants)</summary>
          <p>Solution: ${run.world.truth}. Required access levels for clues 1, 2, 3: ${run.world.ranks.join(", ")}.
            Participants retain candidates ${run.outcome.candidates.join(", ")}.</p></details>
        <ol class="simulation-timeline">${run.events.map((event) => `<li class="${marked.has(event.step) ? "is-evidence" : ""}">
          <strong>Step ${event.step} / ${esc(event.actor)} / ${esc(event.type)}</strong>
          ${event.roles.length ? `<span class="tag">${esc(event.roles.join(" + "))}</span>` : ""}
          ${event.insightRole ? `<span class="tag">insight placement: ${esc(event.insightRole)}</span>` : ""}
          <p>${esc(event.detail)}</p></li>`).join("")}</ol>`;
    }

    async function runExperiment(config, message = "Comparison complete.") {
      if (busy) return;
      busy = true;
      syncControls();
      status("Running the same synthetic worlds through each policy...");
      try {
        await new Promise((resolve) => setTimeout(resolve, 0));
        const next = engine.compare(config);
        result = next;
        dirty = false;
        setConfig(config);
        renderResults();
        try {
          const previous = localStorage.getItem(storageKey);
          if (previous) {
            try { engine.parseExperiment(previous); }
            catch (_error) { localStorage.setItem(`${storageKey}-damaged`, previous); }
          }
          localStorage.setItem(storageKey, JSON.stringify({ format: "puzzle-simulation", engineVersion: engine.version, config }));
          status(`${message} Last recipe saved in this browser; no data was sent anywhere.`);
        } catch (error) {
          status(`${message} Local save failed: ${error.message} Export the experiment to keep it.`, true);
        }
      } catch (error) {
        status(`Simulation failed: ${error.message} Previous results have not been replaced.`, true);
      } finally {
        busy = false;
        syncControls();
      }
    }

    el("Definitions").innerHTML = [...engine.definitions.map((d) => `<h4>${esc(d.title)}</h4><p>${esc(d.text)}</p>`),
      ...engine.strategies.map((s) => `<h4>${esc(s.title)}</h4><p>${esc(s.rule)}</p>`)].join("");
    el("Form").addEventListener("submit", (event) => {
      event.preventDefault();
      try { runExperiment(readConfig()); }
      catch (error) { status(error.message, true); }
    });
    for (const key of fieldNames) fields[key].addEventListener("input", () => {
      if (["access", "difficulty", "cooperation"].includes(key)) el("Preset").value = "custom";
      markDirty();
    });
    el("Preset").addEventListener("change", () => {
      const preset = engine.presets.find((p) => p.id === el("Preset").value);
      if (preset) for (const key of ["access", "difficulty", "cooperation"]) fields[key].value = preset[key];
      markDirty();
    });
    el("Export").addEventListener("click", () => {
      if (!result || dirty || busy) return;
      const blob = new Blob([JSON.stringify(engine.exportExperiment(result), null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `puzzle-simulation-${result.config.seed}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status("Exported the versioned recipe, definitions, counts, and paired comparisons. Import & replay reconstructs every event trace.");
    });
    el("Import").addEventListener("click", () => el("File").click());
    el("File").addEventListener("change", async () => {
      const file = el("File").files[0];
      if (!file) return;
      try {
        if (file.size > 1024 * 1024) throw new Error("Choose an experiment recipe smaller than 1 MB.");
        const config = engine.parseExperiment(await file.text());
        await runExperiment(config, "Experiment replayed from its recipe. Reported counts were recomputed.");
      } catch (error) {
        status(`Import failed: ${error.message} Current settings and results are unchanged.`, true);
      } finally { el("File").value = ""; }
    });
    el("Cohort").addEventListener("change", renderCases);
    el("Filter").addEventListener("change", renderCases);
    el("Case").addEventListener("change", renderTrace);
    el("Table").addEventListener("click", (event) => {
      const button = event.target.closest("[data-cohort]");
      if (!button) return;
      el("Cohort").value = button.dataset.cohort;
      renderCases();
      el("Cohort").focus();
    });
    el("Pin").addEventListener("click", () => {
      if (!result || dirty || busy) return;
      const cohort = selectedCohort(), c = cohort.summary.counts, config = result.config;
      try {
        addFinding({
          label: `Synthetic: ${engine.strategies.find((s) => s.id === cohort.strategy).title}`,
          summary: `Synthetic model v${engine.version}, seed ${config.seed}, access ${cohort.access}%. Shared ${c.shared}/${config.runs}; monomyth-like ${c.monomyth}/${config.runs}; hierarchy ${c.hierarchy}/${config.runs}; both ${c.both}/${config.runs}. Not real observations or evidence of an ideology.`,
          questions: [
            `Reproduce in Simulations using this recipe: ${JSON.stringify(config)}`,
            `Selected policy: ${cohort.strategy}; gated clues: ${cohort.access}%.`,
            "Which rule produced the difference? Inspect failures, vary one assumption, and repeat with another seed.",
            "This result is not evidence about the source PDF or a private experience."
          ]
        });
        status("Added a labeled synthetic finding to the map. Experiment recipes and map exports remain separate.");
      } catch (error) { status(`Could not add finding: ${error.message}`, true); }
    });
    document.querySelectorAll("[data-open-simulations]").forEach((button) => button.addEventListener("click", () => openView("simulations")));
    document.querySelectorAll("[data-simulation-node]").forEach((button) => button.addEventListener("click", () => {
      if (!openMapNode(button.dataset.simulationNode)) status("That node is not present in this imported map.", true);
    }));
    setConfig(engine.defaults);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const config = engine.parseExperiment(saved);
        setConfig(config);
        runExperiment(config, "Restored and replayed the last completed recipe.");
      }
    } catch (error) {
      status(`Previous recipe could not be loaded: ${error.message} The saved data is untouched. Export any needed browser data before running a replacement.`, true);
    }
  }

  window.SimulationWorkbench = { mount };
})();
