# Existential Puzzle Mapper

Live site: https://tboy450.github.io/existential-puzzle-mapper/ (deployed from `dist/` on every push to `main`).

This folder contains a standalone exploratory mapping program generated from `Note 123.pdf`.

Open `index.html` in a browser. It links to the downloaded PDF and the extracted transcript, then keeps the optional references in a separate "Reference Lenses" section.

The site opens on the interactive map and includes a `Project` tab that defines the static website, its section boundaries, and the clean separation model.

The "Next Steps" tab is a separate action layer. Those entries are optional continuation moves, not source claims, final answers, or reference authorities.

The "Pattern Lab" tab is a future-facing workbench for non-standard pattern sets such as signal residue, contradiction knots, attractor basins, shadow options, negative-space traces, and other collection lenses. These are candidate data structures, not conclusions. Some pattern sets are families with multiple possible instances.

The "Term Key" tab defines the project's vocabulary and mapping technology with plain descriptions, intended use, and what each term should not be confused with.

Pattern and answer-vector fit uses an editorial scale: Unassessed, Tentative, Moderate, or Strong. The Pattern Lab and Term Key explain the rubric. These categories describe conceptual relevance; all bundled candidates have zero logged observations. The lab currently provides collection prompts and a schema; observation entry is future work.

The map supports content-aware Fit Map, extended zoom, wheel/trackpad panning, two-finger touch pan/pinch on the graph, and dynamic Pan X / Pan Y sliders matched to the graph contents. Fit Map can zoom below 12% when needed to show a wide layout on a small screen. Card actions center and zoom into their mapped piece for readable inspection without changing its stored coordinates.

The map uses provenance rings: the core signal is in the centre, then source puzzles and barriers, then reference lenses (dashed ring), then moves, outcomes, and risks, with added pieces outermost (the Rings legend in the map corner lists them). Distance from the centre means distance from the PDF source; within each ring, pieces sit near the pieces they connect to. Panning and zooming never move nodes. Dragging a piece pulls its connected pieces along, then the map settles and stops; Reset Layout restores the rings, and Fit Map shows the whole map.

Files:

- `index.html` - app shell
- `styles.css` - interface styling
- `data.js` - PDF-derived map data, objectives, scenarios, source anchors, and separated references
- `app.js` - graph, inspector, scenario, objective, next-step, export, and local custom-piece behavior
- `map-core.js` - shared model validation, routing, storage recovery, and snapshot helpers
- `Note 123.pdf` - source PDF downloaded from the Quick Share link
- `note_123_extracted.txt` - raw text extracted from the PDF

The complete current map and node positions are saved in browser local storage. Existing v1 custom pieces are restored automatically. Failed saves produce a visible message and preserve session changes; use Export JSON to keep them. The previous action is recoverable even after a reload, including the first change to a fresh map. A damaged save is retained under `existential-puzzle-map-v2-damaged` when replaced, while valid backups remain recoverable. Browser storage is tied to the site origin, so opening the local HTML and using a hosted copy use separate saves.

Export JSON includes the model, source anchors, types, all definition collections, custom-piece IDs, and layout diagnostics. Import JSON validates a snapshot before replacing the map and persists the imported model. The source PDF and transcript are separate files, not embedded in JSON. Older exports are accepted by filling their missing fields from this bundled map; the UI reports that fallback. Unsupported versions, duplicate IDs, missing references, invalid coordinates, and oversized files are rejected.

Use the inspector to edit or delete a custom piece. Use Connect Pieces to connect the selected node to another existing node; added connections can be removed in the inspector. Restore previous save recovers the previous action or saved snapshot. Restore original map resets the content and layout to the bundled version after confirmation. Original source nodes cannot be edited or deleted through the custom-piece controls. If an imported content card references a custom piece, deletion is blocked with an explanation; update those JSON references first to avoid erasing provenance.

Keyboard: use Left/Right, Home/End in the tab list, Tab to reach graph nodes and card buttons, and Enter/Space to select a node or open a card on the map. Drag nodes to position them, or drag empty graph space to pan. Search and layer filters apply to both the graph and Nearby Routes; routes show one shortest path per reachable target, up to five targets and four relationships deep.

Development requires Node.js 22 or later and no installed packages:

```sh
npm start          # http://127.0.0.1:4173
npm test           # validation, snapshots, routes, storage recovery, lifecycle tests
npm run build      # copy the root source files and source documents to dist/
npm run verify     # tests plus a check that dist/ matches the root sources
```

Edit root files only; `dist/` is the generated deployment copy used by Sites hosting. Run `npm run build` before publishing. The GitHub verification workflow rejects an out-of-date deployment copy. Building does not publish the site.
