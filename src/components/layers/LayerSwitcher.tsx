import { motion, AnimatePresence } from "motion/react";
import {
  ScanSearch,
  PencilRuler,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayerStore } from "@/stores/layer-store";
import type { LayerId } from "@/data/types";

interface LayerConfig {
  id: LayerId;
  label: string;
  persona: string;
  icon: React.ElementType;
  accentClass: string;
  glowColor: string;
  description: string;
}

const layers: LayerConfig[] = [
  {
    id: "tracing",
    label: "Tracing",
    persona: "SWE",
    icon: ScanSearch,
    accentClass: "text-layer-tracing",
    glowColor: "oklch(0.78 0.15 200 / 0.15)",
    description: "Debug flows & errors",
  },
  {
    id: "building",
    label: "Building",
    persona: "PO / PM",
    icon: PencilRuler,
    accentClass: "text-layer-building",
    glowColor: "oklch(0.80 0.16 80 / 0.15)",
    description: "Design & backlog",
  },
  {
    id: "platform",
    label: "Platform",
    persona: "DevOps",
    icon: Gauge,
    accentClass: "text-layer-platform",
    glowColor: "oklch(0.77 0.15 165 / 0.15)",
    description: "Infra & health",
  },
];

function LayerCard({ layer, isActive, index, onClick }: {
  layer: LayerConfig;
  isActive: boolean;
  index: number;
  onClick: () => void;
}) {
  const Icon = layer.icon;

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        "relative w-full text-left rounded-lg border transition-colors duration-300 overflow-hidden group",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "border-white/10 bg-white/[0.04]"
          : "border-transparent bg-transparent hover:bg-white/[0.02] hover:border-white/5",
      )}
      initial={false}
      animate={{
        scale: isActive ? 1 : 0.96,
        y: isActive ? 0 : index === 0 ? -2 : index === 2 ? 2 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      whileHover={{ scale: isActive ? 1 : 0.98 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Active glow */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ boxShadow: `inset 0 0 30px ${layer.glowColor}` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      <div className="relative px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* Depth indicator — suggests z-axis */}
          <div className={cn(
            "relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-300",
            isActive ? "bg-white/[0.08]" : "bg-white/[0.03]",
          )}>
            <Icon className={cn(
              "w-4 h-4 transition-colors duration-300",
              isActive ? layer.accentClass : "text-muted-foreground",
            )} />
            {/* z-depth shadow layers */}
            <div className={cn(
              "absolute -bottom-[3px] left-[2px] right-[2px] h-[3px] rounded-b-sm transition-all duration-300",
              isActive ? "bg-white/[0.04]" : "bg-transparent",
            )} />
            <div className={cn(
              "absolute -bottom-[5px] left-[4px] right-[4px] h-[2px] rounded-b-sm transition-all duration-300",
              isActive ? "bg-white/[0.02]" : "bg-transparent",
            )} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[12px] font-semibold transition-colors duration-300",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}>
                {layer.label}
              </span>
              <span className={cn(
                "text-[9px] font-mono px-1.5 py-0 rounded-sm transition-all duration-300",
                isActive
                  ? `${layer.accentClass} bg-white/[0.06]`
                  : "text-muted-foreground/60 bg-transparent",
              )}>
                {layer.persona}
              </span>
            </div>
            <p className={cn(
              "text-[10px] transition-colors duration-300",
              isActive ? "text-muted-foreground" : "text-muted-foreground/50",
            )}>
              {layer.description}
            </p>
          </div>
        </div>
      </div>

      {/* Active accent line */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={cn("absolute left-0 top-2 bottom-2 w-[2px] rounded-full", layer.accentClass.replace("text-", "bg-"))}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function LayerSwitcher() {
  const activeLayer = useLayerStore((s) => s.activeLayer);
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer);

  return (
    <div className="absolute top-4 left-4 z-50 w-[200px]">
      <div className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-xl p-2 shadow-2xl shadow-black/30">
        {/* Title */}
        <div className="px-3 pt-1 pb-2">
          <h2 className="font-serif text-[13px] text-foreground/70 italic tracking-wide">Layers</h2>
        </div>

        {/* Layer cards */}
        <div className="space-y-1">
          {layers.map((layer, i) => (
            <LayerCard
              key={layer.id}
              layer={layer}
              isActive={activeLayer === layer.id}
              index={i}
              onClick={() => setActiveLayer(layer.id)}
            />
          ))}
        </div>

        {/* Depth visual hint */}
        <div className="mt-2 px-3 pb-1">
          <div className="flex items-center gap-1">
          {layers.map((layer) => (
            <motion.div
              key={layer.id}
              className={cn(
                  "h-[3px] flex-1 rounded-full transition-colors duration-500",
                  activeLayer === layer.id
                    ? layer.accentClass.replace("text-", "bg-")
                    : "bg-white/5",
                )}
                animate={{
                  scaleY: activeLayer === layer.id ? 1.5 : 1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            ))}
          </div>
          <p className="text-[8px] text-muted-foreground/40 text-center mt-1 font-mono tracking-wider uppercase">
            depth · {layers.findIndex((l) => l.id === activeLayer) + 1} / {layers.length}
          </p>
        </div>
      </div>
    </div>
  );
}
