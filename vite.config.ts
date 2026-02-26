import fs from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString()));
    req.on("error", reject);
  });
}

/**
 * Dev-only plugin: POST /api/save-positions updates node positions
 * directly in src/data/system.ts so layout changes persist across reloads.
 */
function savePositionsPlugin(): Plugin {
  return {
    name: "save-positions",
    configureServer(server) {
      server.middlewares.use(
        "/api/save-positions",
        async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end();
            return;
          }
          try {
            const body = await readBody(req);
            const positions: Record<string, { x: number; y: number }> =
              JSON.parse(body);
            const filePath = path.resolve(
              import.meta.dirname,
              "src/data/system.ts"
            );
            let src = await fs.readFile(filePath, "utf-8");
            for (const [nodeId, pos] of Object.entries(positions)) {
              // Escape any regex special characters in the node ID.
              const escaped = nodeId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
              // Match `id: "NODE_ID"` followed (lazily) by `position: { x: N, y: N }`.
              const re = new RegExp(
                `(id:\\s*"${escaped}"[\\s\\S]*?position:\\s*\\{\\s*x:\\s*)(-?[\\d.]+)(\\s*,\\s*y:\\s*)(-?[\\d.]+)(\\s*\\})`
              );
              src = src.replace(
                re,
                `$1${Math.round(pos.x)}$3${Math.round(pos.y)}$5`
              );
            }
            await fs.writeFile(filePath, src, "utf-8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("ok");
          } catch (err) {
            res.statusCode = 500;
            res.end(String(err));
          }
        }
      );
    },
  };
}

export default defineConfig({
  server: {
    watch: {
      // Exclude system.ts from the file watcher so programmatic position
      // saves don't trigger HMR and reset the Zustand store state.
      ignored: ["**/src/data/system.ts"],
    },
  },
  plugins: [
    savePositionsPlugin(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react({
      babel: {
        plugins: [
          // React Compiler must run first in the Babel pipeline.
          // Automatically memoizes components and hooks — memo(), useCallback(),
          // and useMemo() are no longer needed as manual optimizations.
          ["babel-plugin-react-compiler"],
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
