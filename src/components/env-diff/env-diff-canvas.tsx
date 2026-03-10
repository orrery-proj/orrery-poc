import { AnimatePresence, motion, useAnimate } from "motion/react";
import { useCallback, useEffect, useState } from "react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const GRAPH_NODES = [
  { id: "api", label: "API Gateway", x: 450, y: 60 },
  { id: "users", label: "User Service", x: 200, y: 200 },
  { id: "products", label: "Product Catalog", x: 700, y: 200 },
  { id: "orders", label: "Order Service", x: 450, y: 340 },
  { id: "payments", label: "Payment Service", x: 200, y: 480 },
  { id: "inventory", label: "Inventory", x: 700, y: 480 },
  { id: "notifications", label: "Notifications", x: 450, y: 620 },
] as const;

const GRAPH_EDGES = [
  { from: "api", to: "users" },
  { from: "api", to: "products" },
  { from: "api", to: "orders" },
  { from: "orders", to: "payments" },
  { from: "orders", to: "inventory" },
  { from: "inventory", to: "notifications" },
  { from: "payments", to: "notifications" },
] as const;

const SELECTED_IDS = ["api", "users", "orders", "payments"];

const UNSELECTED_NODES = GRAPH_NODES.filter(
  (n) => !SELECTED_IDS.includes(n.id)
);

const ENV_LINE_Y = 380;
const ENV_LINE: Record<string, { x: number; y: number }> = {
  api: { x: 130, y: ENV_LINE_Y },
  users: { x: 340, y: ENV_LINE_Y },
  orders: { x: 550, y: ENV_LINE_Y },
  payments: { x: 760, y: ENV_LINE_Y },
};

const ENV_VERSIONS: Record<
  string,
  Array<{ env: string; version: string; status: string; hue: number }>
> = {
  api: [
    { env: "prod", version: "v2.3.1", status: "stable", hue: 155 },
    { env: "staging", version: "v2.4.0-rc1", status: "testing", hue: 80 },
    { env: "dev", version: "v2.5.0-alpha", status: "building", hue: 200 },
  ],
  users: [
    { env: "prod", version: "v1.8.2", status: "stable", hue: 155 },
    { env: "staging", version: "v1.8.2", status: "in-sync", hue: 80 },
    { env: "dev", version: "v1.9.0-beta", status: "new features", hue: 200 },
  ],
  orders: [
    { env: "prod", version: "v3.1.0", status: "stable", hue: 155 },
    { env: "staging", version: "v3.2.0-rc2", status: "testing", hue: 80 },
    { env: "dev", version: "v3.3.0-alpha", status: "building", hue: 200 },
  ],
  payments: [
    { env: "prod", version: "v2.0.4", status: "stable", hue: 155 },
    { env: "staging", version: "v2.1.0-rc1", status: "hotfix", hue: 80 },
    { env: "dev", version: "v2.1.0-rc1", status: "same as stg", hue: 200 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nodeById(id: string) {
  return GRAPH_NODES.find((n) => n.id === id);
}

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Node style ──────────────────────────────────────────────────────────────

const SELECTED_STYLE = {
  background: "oklch(0.17 0.03 200)",
  borderColor: "oklch(0.38 0.1 200)",
  color: "oklch(0.85 0.06 200)",
  boxShadow: "0 0 16px oklch(0.5 0.15 200 / 0.2)",
} as const;

const UNSELECTED_STYLE = {
  background: "oklch(0.16 0.01 270)",
  borderColor: "oklch(0.26 0.02 270)",
  color: "oklch(0.58 0.02 270)",
  boxShadow: "0 2px 8px oklch(0 0 0 / 0.3)",
} as const;

// ─── Animation config ─────────────────────────────────────────────────────────

const ROT_OPTS = { duration: 0.85, ease: [0.3, 0, 0.7, 1] };
const SLIDE_OPTS = { duration: 0.5, ease: [0.4, 0, 0.15, 1] };

// ─── Main component ───────────────────────────────────────────────────────────

export function EnvDiffCanvas() {
  // Controls env card / line visibility
  const [phase, setPhase] = useState<"graph" | "env">("graph");
  // Controls selected node target positions (3-phase)
  const [nodeTarget, setNodeTarget] = useState<"graph" | "compressed" | "env">(
    "graph"
  );
  // Transition for the current node animation phase
  const [nodeTrans, setNodeTrans] = useState(ROT_OPTS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [scope, animate] = useAnimate();

  const isEnv = phase === "env";

  const handleToggle = useCallback(async () => {
    if (isAnimating) {
      return;
    }
    setIsAnimating(true);

    if (phase === "graph") {
      // Phase 1: Rotate graph surface 0→90° + compress selected nodes Y
      setNodeTrans(ROT_OPTS);
      setNodeTarget("compressed");
      await animate(scope.current, { rotateX: 90 }, ROT_OPTS);

      // Phase 2: Slide selected nodes X to evenly-spaced env positions
      setNodeTrans(SLIDE_OPTS);
      setNodeTarget("env");
      await wait(SLIDE_OPTS.duration * 1000);

      // Phase 3: Show env cards + dashed line
      setPhase("env");
    } else {
      // Phase 1: Hide env cards + dashed line
      setPhase("graph");
      await wait(200);

      // Phase 2: Slide selected nodes X back to graph positions
      setNodeTrans(SLIDE_OPTS);
      setNodeTarget("compressed");
      await wait(SLIDE_OPTS.duration * 1000);

      // Phase 3: Rotate graph back 90→0° + expand selected nodes Y
      setNodeTrans(ROT_OPTS);
      setNodeTarget("graph");
      await animate(scope.current, { rotateX: 0 }, ROT_OPTS);
    }

    setIsAnimating(false);
  }, [phase, isAnimating, animate, scope]);

  // Space to toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isAnimating) {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleToggle, isAnimating]);

  return (
    <div className="flex h-full w-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-border border-b px-6 py-3.5">
        <div>
          <h1 className="font-semibold text-sm tracking-tight">
            I8 — Env Diff PoC
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isEnv
              ? "Environment diff (X-Z plane) — Y axis rotated away"
              : "Graph view (X-Y plane) — preselected nodes highlighted"}
            <span className="ml-3 opacity-50">press Space to toggle</span>
          </p>
        </div>
        <button
          className="rounded-lg border border-border bg-secondary px-4 py-2 font-medium text-xs transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
          disabled={isAnimating}
          onClick={handleToggle}
          type="button"
        >
          {isEnv ? "Rotate to Graph" : "Rotate to Env Diff"}
        </button>
      </div>

      {/* 3D scene */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className="relative mx-auto h-full w-full max-w-[900px]"
          style={{ perspective: "1200px" }}
        >
          {/* ── Rotating layer: graph surface (edges + unselected nodes) ── */}
          {/* Rotates to 90° on forward, back to 0° on reverse.             */}
          {/* At 90° everything here is edge-on → naturally invisible.       */}
          <div className="pointer-events-none absolute inset-0" ref={scope}>
            {/* Graph edges */}
            <svg aria-hidden="true" className="absolute inset-0 h-full w-full">
              {GRAPH_EDGES.map((edge) => {
                const from = nodeById(edge.from);
                const to = nodeById(edge.to);
                if (!(from && to)) {
                  return null;
                }
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    stroke="oklch(0.32 0.02 270)"
                    strokeWidth={1.5}
                    x1={from.x}
                    x2={to.x}
                    y1={from.y}
                    y2={to.y}
                  />
                );
              })}
            </svg>

            {/* Unselected nodes — rotate with the surface */}
            {UNSELECTED_NODES.map((node) => (
              <div
                className="absolute -translate-x-1/2 -translate-y-1/2"
                key={node.id}
                style={{ left: node.x, top: node.y }}
              >
                <div
                  className="whitespace-nowrap rounded-lg border px-3.5 py-2 font-medium text-xs"
                  style={UNSELECTED_STYLE}
                >
                  {node.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Flat layer (never rotated) ── */}

          {/* Env-mode: horizontal dashed connector */}
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <motion.line
              animate={{ opacity: isEnv ? 1 : 0 }}
              stroke="oklch(0.28 0.02 270)"
              strokeDasharray="6 4"
              strokeWidth={1}
              transition={{ duration: 0.3 }}
              x1={130}
              x2={760}
              y1={ENV_LINE_Y}
              y2={ENV_LINE_Y}
            />
          </svg>

          {/* Selected nodes — 3-phase position animation:
              graph → compressed (Y to center, synced with rotation)
              compressed → env (X to evenly-spaced env positions)
              Reverse: env → compressed → graph */}
          {GRAPH_NODES.filter((n) => SELECTED_IDS.includes(n.id)).map(
            (node) => {
              const envPos = ENV_LINE[node.id];
              const targetX =
                nodeTarget === "env" && envPos ? envPos.x : node.x;
              const targetY = nodeTarget === "graph" ? node.y : ENV_LINE_Y;

              return (
                <motion.div
                  animate={{ left: targetX, top: targetY }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  key={node.id}
                  transition={{
                    duration: nodeTrans.duration,
                    ease: nodeTrans.ease,
                  }}
                >
                  <div
                    className="whitespace-nowrap rounded-lg border px-3.5 py-2 font-medium text-xs"
                    style={SELECTED_STYLE}
                  >
                    {node.label}
                  </div>
                </motion.div>
              );
            }
          )}

          {/* Env version cards ABOVE nodes (z-axis points up) */}
          <AnimatePresence>
            {isEnv &&
              SELECTED_IDS.map((id, i) => {
                const pos = ENV_LINE[id];
                if (!pos) {
                  return null;
                }
                const versions = ENV_VERSIONS[id] ?? [];
                const reversed = [...versions].reverse();
                const count = reversed.length;

                return (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute flex flex-col items-center"
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    initial={{ opacity: 0 }}
                    key={`env-col-${id}`}
                    style={{
                      left: pos.x,
                      top: 0,
                      height: pos.y - 20,
                      transform: "translateX(-50%)",
                    }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                  >
                    <div className="flex-1" />

                    <div className="flex flex-col gap-2.5">
                      {reversed.map((v, j) => (
                        <motion.div
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="w-[148px] rounded-lg border p-2.5"
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          key={v.env}
                          style={{
                            borderColor: `oklch(0.4 0.1 ${v.hue})`,
                            background: `oklch(0.14 0.025 ${v.hue})`,
                            boxShadow: `0 2px 12px oklch(0.3 0.1 ${v.hue} / 0.15)`,
                          }}
                          transition={{
                            delay: i * 0.04 + (count - 1 - j) * 0.1,
                            duration: 0.35,
                            ease: [0, 0, 0.2, 1],
                          }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className="font-bold text-[10px] uppercase tracking-wider"
                              style={{ color: `oklch(0.72 0.14 ${v.hue})` }}
                            >
                              {v.env}
                            </span>
                            <span className="truncate text-[9px] text-muted-foreground">
                              {v.status}
                            </span>
                          </div>
                          <div className="mt-1 font-mono text-foreground text-xs">
                            {v.version}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      animate={{ scaleY: 1 }}
                      className="mt-2 h-3 w-px origin-bottom"
                      initial={{ scaleY: 0 }}
                      style={{ background: "oklch(0.3 0.02 270)" }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* Axis labels */}
          <div className="absolute inset-x-0 bottom-4 text-center text-[10px] text-muted-foreground/50 uppercase tracking-[0.25em]">
            x axis
          </div>
          <AnimatePresence mode="wait">
            {isEnv ? (
              <motion.div
                animate={{ opacity: 0.5 }}
                className="absolute top-1/2 left-4 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="z"
                transition={{ duration: 0.3 }}
              >
                z axis (environments)
              </motion.div>
            ) : (
              <motion.div
                animate={{ opacity: 0.5 }}
                className="absolute top-1/2 left-4 -translate-y-1/2 -rotate-90 text-[10px] text-muted-foreground uppercase tracking-[0.25em]"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                key="y"
                transition={{ duration: 0.3 }}
              >
                y axis
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend (graph mode only) */}
          <motion.div
            animate={{ opacity: isEnv ? 0 : 1 }}
            className="absolute top-6 left-6 flex items-center gap-2 text-[10px] text-muted-foreground"
            transition={{ duration: 0.3 }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "oklch(0.6 0.15 200)" }}
            />
            preselected for env diff
          </motion.div>
        </div>
      </div>
    </div>
  );
}
