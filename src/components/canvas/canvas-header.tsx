import { Gauge, PencilRuler, ScanSearch } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { LayerId } from "@/data/types";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/stores/layer-store";

interface LayerConfig {
  accentClass: string;
  colorClass: string;
  description: string;
  glowColor: string;
  icon: React.ElementType;
  id: LayerId;
  key: string;
  label: string;
  persona: string;
}

const layers: LayerConfig[] = [
  {
    id: "tracing",
    label: "Tracing",
    persona: "SWE",
    icon: ScanSearch,
    accentClass: "text-layer-tracing",
    colorClass: "bg-layer-tracing",
    glowColor: "oklch(0.78 0.15 200 / 0.12)",
    description: "Debug flows & errors",
    key: "1",
  },
  {
    id: "building",
    label: "Building",
    persona: "PO / PM",
    icon: PencilRuler,
    accentClass: "text-layer-building",
    colorClass: "bg-layer-building",
    glowColor: "oklch(0.80 0.16 80 / 0.12)",
    description: "Design & backlog",
    key: "2",
  },
  {
    id: "platform",
    label: "Platform",
    persona: "DevOps",
    icon: Gauge,
    accentClass: "text-layer-platform",
    colorClass: "bg-layer-platform",
    glowColor: "oklch(0.77 0.15 165 / 0.12)",
    description: "Infra & health",
    key: "3",
  },
];

export function CanvasHeader() {
  const activeLayer = useLayerStore((s) => s.activeLayer);
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeConfig = layers.find((l) => l.id === activeLayer) ?? layers[0];
  const ActiveIcon = activeConfig.icon;

  function enter() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpen(true);
  }

  function leave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 250);
  }

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: hover-group delegation; interactive children are proper buttons
    // biome-ignore lint/a11y/noStaticElementInteractions: same rationale — outer div is a non-interactive hover zone
    <div
      className="absolute top-4 left-4 z-50"
      onMouseEnter={enter}
      onMouseLeave={leave}
      ref={containerRef}
    >
      {/* Pill trigger */}
      <button
        className="flex cursor-default select-none items-center gap-2.5 rounded-full border border-border/30 bg-card/70 py-2 pr-3 pl-3.5 shadow-black/20 shadow-lg backdrop-blur-xl transition-colors hover:border-border/50"
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <h1 className="font-serif text-[15px] text-foreground/60 italic leading-none tracking-wide">
          Orray
        </h1>
        <div className="h-4 w-px bg-border/40" />
        <div className="flex items-center gap-1.5">
          <ActiveIcon className={cn("h-3.5 w-3.5", activeConfig.accentClass)} />
          <AnimatePresence mode="wait">
            <motion.span
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "font-medium font-mono text-[11px] uppercase tracking-wider",
                activeConfig.accentClass
              )}
              exit={{ opacity: 0, y: -4 }}
              initial={{ opacity: 0, y: 4 }}
              key={activeLayer}
              transition={{ duration: 0.15 }}
            >
              {activeConfig.label}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="ml-0.5 flex items-center gap-1">
          {layers.map((l) => (
            <kbd
              className={cn(
                "rounded border px-1 py-0.5 font-mono text-[9px] leading-none transition-colors duration-200",
                activeLayer === l.id
                  ? `${l.accentClass} border-white/10 bg-white/[0.06]`
                  : "border-border/15 bg-transparent text-muted-foreground/30"
              )}
              key={l.key}
            >
              {l.key}
            </kbd>
          ))}
        </div>
      </button>

      {/* Dropdown layer picker */}
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-2 w-[240px] rounded-xl border border-border/40 bg-card/80 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl"
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            {layers.map((layer) => {
              const Icon = layer.icon;
              const isActive = activeLayer === layer.id;

              return (
                <button
                  className={cn(
                    "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "bg-white/[0.05]" : "hover:bg-white/[0.03]"
                  )}
                  key={layer.id}
                  onClick={() => {
                    setActiveLayer(layer.id);
                    setOpen(false);
                  }}
                  type="button"
                >
                  {/* Active accent line */}
                  {isActive && (
                    <motion.div
                      className={cn(
                        "absolute top-2 bottom-2 left-0 w-[2px] rounded-full",
                        layer.colorClass
                      )}
                      layoutId="layer-accent"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}

                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors duration-200",
                      isActive ? "bg-white/[0.08]" : "bg-white/[0.03]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors duration-200",
                        isActive ? layer.accentClass : "text-muted-foreground"
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold text-[12px] transition-colors duration-200",
                          isActive ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        {layer.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-sm px-1.5 font-mono text-[9px] transition-colors duration-200",
                          isActive
                            ? `${layer.accentClass} bg-white/[0.06]`
                            : "text-muted-foreground/50"
                        )}
                      >
                        {layer.persona}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-[10px] transition-colors duration-200",
                        isActive
                          ? "text-muted-foreground"
                          : "text-muted-foreground/40"
                      )}
                    >
                      {layer.description}
                    </p>
                  </div>

                  <kbd
                    className={cn(
                      "shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] leading-none transition-colors duration-200",
                      isActive
                        ? `${layer.accentClass} border-white/10`
                        : "border-border/15 text-muted-foreground/30"
                    )}
                  >
                    {layer.key}
                  </kbd>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
