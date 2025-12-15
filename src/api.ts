/**
 * Simple Node.js API server for the Verto Engine
 * Provides REST endpoints for the browser UI
 */

import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import { getAvailableNodeTypes, createNode } from "./nodes/index";
import { Graph } from "./graph/Graph";

const PORT = 8080;

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (req.url === "/api/nodes" && req.method === "GET") {
    const nodeTypes = getAvailableNodeTypes();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(nodeTypes));
    return;
  }

  if (req.url?.startsWith("/api/create-node/") && req.method === "GET") {
    const nodeType = decodeURIComponent(req.url.split("/").pop() || "");
    const node = createNode(nodeType);
    if (node) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(node.toJSON()));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Node type not found" }));
    }
    return;
  }

  // Serve static files
  let filePath = (req.url === "/" || !req.url) ? "/index.html" : req.url;
  filePath = path.join(__dirname, "public", filePath);

  // Prevent directory traversal
  const normalizedPath = path.normalize(filePath);
  const publicDir = path.join(__dirname, "public");
  if (!normalizedPath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  // Try to read file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath);
    const contentTypes: { [key: string]: string } = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".json": "application/json",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
    };

    const contentType = contentTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Verto Engine API server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
