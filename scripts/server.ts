import { createServer } from "node:http";
import { request } from "node:https";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { stripTypeScriptTypes } from "node:module";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const types: Record<string, string> = {
  ".html": "text/html",
  ".ts": "text/javascript",
  ".png": "image/png",
};
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
  if (pathname === "/tiles/map.pmtiles") {
    const upstream = request(
      "https://transportsapp-cdn-1.arno.cl/protomaps/map.pmtiles",
      {
        headers: req.headers.range ? { range: req.headers.range } : {},
      },
      (response) => {
        res.writeHead(response.statusCode ?? 502, response.headers);
        response.pipe(res);
      },
    );
    upstream.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end();
    });
    upstream.end();
    return;
  }
  const path = resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!path.startsWith(root + sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(path);
    res.writeHead(200, {
      "content-type": types[extname(path)] || "application/octet-stream",
    });
    res.end(
      extname(path) === ".ts" ? stripTypeScriptTypes(data.toString()) : data,
    );
  } catch {
    res.writeHead(404).end();
  }
});
server.listen(4178, "127.0.0.1", () => console.log("http://127.0.0.1:4178"));
