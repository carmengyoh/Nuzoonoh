const { createServer } = require("node:http");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const contentPath = path.join(__dirname, "..", "data", "portfolio.json");
const publicPath = path.join(__dirname, "..", "public");
const port = Number(process.env.PORT) || 3000;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

const server = createServer(async (request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405, { "Content-Type": "application/json; charset=utf-8", Allow: "GET" });
    response.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (url.pathname === "/api/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (url.pathname === "/api/content") {
    try {
      const content = await readFile(contentPath, "utf8");
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      response.end(content);
    } catch {
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Could not load portfolio content" }));
    }
    return;
  }

  let filePath;
  try {
    const pathname = decodeURIComponent(url.pathname);
    filePath = path.resolve(publicPath, `.${pathname === "/" ? "/index.html" : pathname}`);
  } catch {
    response.writeHead(400);
    response.end();
    return;
  }

  if (!filePath.startsWith(`${publicPath}${path.sep}`)) {
    response.writeHead(403);
    response.end();
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(file);
    return;
  } catch {
  }

  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Portfolio API listening on http://localhost:${port}`);
});