const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".pdf": "application/pdf", ".txt": "text/plain" };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || pathname.split("/").some((part) => part.startsWith("."))) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, content) => {
    if (error) {
      res.writeHead(error.code === "ENOENT" || error.code === "EISDIR" ? 404 : 500).end("Unable to read file");
      if (error.code !== "ENOENT" && error.code !== "EISDIR") console.error(error);
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }).end(content);
  });
}).listen(4173, "127.0.0.1", () => console.log("Mapper available at http://127.0.0.1:4173"));
