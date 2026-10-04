const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const files = ["index.html", "styles.css", "data.js", "map-core.js", "simulation-core.js", "simulation-ui.js", "app.js", "README.md", "Note 123.pdf", "note_123_extracted.txt"];
const check = process.argv.includes("--check");
let drift = false;
if (!check) fs.mkdirSync(path.join(root, "dist"), { recursive: true });
for (const file of files) {
  const source = path.join(root, file), target = path.join(root, "dist", file);
  if (check) {
    if (!fs.existsSync(target) || !fs.readFileSync(source).equals(fs.readFileSync(target))) {
      console.error(`dist/${file} is missing or out of date. Run npm run build.`);
      drift = true;
    }
  } else fs.copyFileSync(source, target);
}
if (drift) process.exitCode = 1;
else console.log(check ? "Deployment files match their sources." : "Built dist from the root source files.");
