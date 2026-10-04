# Existential Puzzle Mapper

This folder contains a standalone exploratory mapping program generated from `Note 123.pdf`.

Open `index.html` in a browser. It links to the downloaded PDF and the extracted transcript, then keeps the optional references in a separate "Reference Lenses" section.

The site opens on the interactive map and includes a `Project` tab that defines the static website, its section boundaries, and the clean separation model.

The "Next Steps" tab is a separate action layer. Those entries are optional continuation moves, not source claims, final answers, or reference authorities.

The "Pattern Lab" tab is a future-facing workbench for non-standard pattern sets such as signal residue, contradiction knots, attractor basins, shadow options, negative-space traces, and other collection lenses. These are candidate data structures, not conclusions. Some pattern sets are families with multiple possible instances.

The "Term Key" tab defines the project's vocabulary and mapping technology with plain descriptions, intended use, and what each term should not be confused with.

Pattern percentages are current map-fit estimates, not proof. Entry counts are actual logged examples and start at zero until future observations are collected.

The map supports content-aware Fit Map, extended zoom, wheel/trackpad panning, two-finger touch pan/pinch on the graph, and dynamic Pan X / Pan Y sliders matched to the graph contents.

Node positions are frozen after a deterministic force-layout pass so zooming and panning do not change the map. The optional Motion Trace overlay and per-node Layout Pressure readout preserve the old movement as a diagnostic, not as proof of correlation or causality.

Files:

- `index.html` - app shell
- `styles.css` - interface styling
- `data.js` - PDF-derived map data, objectives, scenarios, source anchors, and separated references
- `app.js` - graph, inspector, scenario, objective, next-step, export, and local custom-piece behavior
- `Note 123.pdf` - source PDF downloaded from the Quick Share link
- `note_123_extracted.txt` - raw text extracted from the PDF

Custom pieces are stored in browser local storage. Use "Export JSON" to save a portable copy of the current map data.
