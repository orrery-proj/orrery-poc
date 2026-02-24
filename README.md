# Orray

> A visual-first Internal Developer Platform — exploring spatial interfaces for complex system management.

**This is a Proof of Concept.** There is no backend, no real data, no integrations. Every node, edge, metric, and trace is hardcoded. The sole purpose of this project is to test ideas about how developers, product managers, and platform engineers might interact with a system-as-a-map interface — and to serve as a starting point for design reasoning.

---

## Why this exists

Modern platforms are invisible. You interact with them through CLI commands, YAML files, dashboards split across a dozen tabs, and log aggregators that assume you already know where to look. The mental model of "the system" lives exclusively in people's heads, and it's different for every person.

This PoC asks a question: **what if the system was something you could see, all at once, laid out in space?**

## Philosophy

### Spatial reasoning over sequential navigation

Humans live in a 3D world and interact with 2D screens. We're wired to reason spatially — about proximity, flow, direction, containment. Traditional developer platforms ignore this entirely: they present systems as lists, tables, and trees, forcing users to reconstruct spatial relationships in their heads.

Orray places the entire system on a canvas. Services, databases, queues, and caches become objects with physical positions. Connections between them — data flows, API calls, event streams — become visible lines with direction. The topology isn't described; it's _drawn_.

This isn't about making things pretty. Spatial layout lets you answer questions that are hard to answer with text:

- What does this service depend on?
- Where does data flow after it leaves the gateway?
- Which services are clustered together? Which ones are isolated?
- Is the failure in the payment path or the notification path?

You can answer all of these by looking, not searching.

### Layers as a third dimension

Different people need different views of the same system. A developer debugging a production incident doesn't need to see deployment versions. A product manager planning the next quarter doesn't need CPU metrics. A platform engineer monitoring infrastructure doesn't need feature-level breakdowns.

Rather than building three separate dashboards, Orray introduces **layers** — conceptually stacked views of the same spatial canvas. The topology stays fixed (same nodes, same positions), but the information overlaid on it changes entirely:

| Layer        | Persona            | What you see                                                         |
| ------------ | ------------------ | -------------------------------------------------------------------- |
| **Tracing**  | Software Engineer  | Request paths, latency, error propagation, span IDs                  |
| **Building** | Product Owner / PM | Draft components, backlog items, team ownership, planned connections |
| **Platform** | DevOps / SRE       | CPU, memory, pod counts, health status, deployment versions, uptime  |

The key insight is that layers don't overlay each other. They replace each other completely, like peeling back pages of a blueprint. The spatial position of every component stays the same across layers — only the lens through which you view it changes. This avoids the visual noise of trying to show everything at once.

### Focus through reduction

Humans are bad at dealing with more than one thing at a time. Every additional piece of information on screen competes for attention. The core design principle is that **noise is the enemy**, and the interface should actively help you _not_ see things you don't need.

This manifests in several ways:

- **Layer switching** removes entire categories of information with a single action
- **Trace dimming** fades nodes that aren't part of the active trace, so the error path is visually obvious
- **Node selection** opens a detail panel for deep inspection without leaving the canvas
- **Semantic zoom** (not yet implemented) would let you "enter" a service and see its internal features, breaking down a complex node into its constituent parts

The goal is always the same: reduce cognitive load. Let the user focus on exactly what matters right now.

### Simplicity is the ultimate sophistication

Every design decision should earn its place. No decoration, no chrome that doesn't serve a purpose. Information density is good; visual noise is not. The difference is whether each element helps you make a decision.

---

## What this PoC demonstrates

### Interactive Canvas

A full-screen [React Flow](https://reactflow.dev) canvas with:

- **Custom nodes** for services, databases, queues, gateways, and caches — each with distinct iconography and a colored accent stripe indicating its type
- **Custom edges** with animated flow indicators showing data direction and protocol labels
- **Ghost nodes and edges** (building layer only) for planned but not-yet-built components
- Pan, zoom, minimap navigation

### Persona-Based Layers

Three layers switchable via the header dropdown or keyboard shortcuts (`1`, `2`, `3`):

**Tracing (SWE)** — Cyan accent. Edges animate to show data flow direction. Nodes on the active trace path are highlighted; everything else is dimmed. The Payment Service node pulses red with a 12-second timeout error. Error messages, latency values, and span IDs are surfaced directly on the nodes.

**Building (PO/PM)** — Amber accent. Two draft nodes appear (Recommendation Engine, Analytics Service) with dashed borders, representing planned additions. Each existing node gets edit/delete controls. A floating toolbar at the bottom offers spatial design tools: Select, Add Component, Connect, Label. Ghost edges show proposed data flows.

**Platform (DevOps)** — Teal accent. Every node displays CPU and memory utilization bars (color-coded green → amber → red by threshold), pod readiness counts, health status badges, version numbers, and last deploy timestamps. Edges show requests per second, error rates, and p99 latency.

### Node Detail Panel

Clicking any node opens a slide-in panel on the right with:

- Full metadata (type, team, description)
- Layer-specific deep info (trace details, infrastructure metrics, or building proposals)
- Feature breakdown with team ownership and per-feature health status

### Mock System Topology

An e-commerce platform with realistic complexity:

- **API Gateway** → User Service, Product Catalog, Order Service
- **Order Service** → Payment Service (error path), Inventory Service, Orders DB
- **Payment Service** → Event Bus → Notification Service
- Supporting infrastructure: 3 PostgreSQL databases, Redis cache, Kafka event bus
- Draft components: Recommendation Engine, Analytics Service

---

## Project structure

```
src/
├── data/                    # Mock data — completely decoupled from UI
│   ├── types.ts             # Type definitions for nodes, edges, layers, metrics
│   └── system.ts            # System topology, draft nodes/edges, all hardcoded data
├── stores/
│   └── layer-store.ts       # Zustand store — active layer, selection, computed node/edge sets
├── components/
│   ├── canvas/
│   │   ├── SystemCanvas.tsx  # Main React Flow canvas composition
│   │   ├── CanvasHeader.tsx  # Header pill with layer dropdown
│   │   ├── nodes/
│   │   │   └── SystemNode.tsx    # Universal node component adapting to kind + layer
│   │   └── edges/
│   │       ├── DataFlowEdge.tsx  # Animated edge with layer-aware styling
│   │       └── GhostEdge.tsx     # Dashed edge for draft connections
│   ├── panels/
│   │   ├── NodeDetailPanel.tsx   # Right-side detail inspector
│   │   └── BuildingToolbar.tsx   # Bottom toolbar for building layer
│   └── ui/                       # shadcn/ui primitives
├── hooks/
│   └── use-keyboard-shortcuts.ts
├── routes/                  # TanStack Router file-based routing
│   ├── __root.tsx
│   └── index.tsx
├── lib/utils.ts
├── main.tsx
└── index.css                # Theme tokens, React Flow overrides, animations
```

Design decisions:

- **Data layer is separate.** All mock data lives in `src/data/`. Swap it for API calls later without touching components.
- **One node component, many appearances.** `SystemNode` adapts its rendering based on `kind` (service, database, queue...) and the active layer. No separate node components per type — the data drives the visual.
- **Store drives the canvas.** The Zustand store computes which nodes and edges are visible per layer. Components read from the store and react.

---

## Tech stack

| Tool                                           | Purpose                                   |
| ---------------------------------------------- | ----------------------------------------- |
| [React 19](https://react.dev)                  | UI framework                              |
| [Vite 7](https://vite.dev)                     | Build tool                                |
| [TanStack Router](https://tanstack.com/router) | File-based routing                        |
| [React Flow](https://reactflow.dev)            | Canvas, nodes, edges, minimap             |
| [Tailwind CSS 4](https://tailwindcss.com)      | Styling via `@theme` tokens               |
| [shadcn/ui](https://ui.shadcn.com)             | UI primitives (badge, tooltip, dialog...) |
| [Zustand](https://zustand.docs.pmnd.rs)        | Lightweight state management              |
| [Motion](https://motion.dev)                   | Spring-based transitions                  |
| [Lucide](https://lucide.dev)                   | Icon library                              |
| [Bun](https://bun.sh)                          | Runtime and package manager               |

---

## Running locally

```bash
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

### Keyboard shortcuts

| Key   | Action                      |
| ----- | --------------------------- |
| `1`   | Switch to Tracing layer     |
| `2`   | Switch to Building layer    |
| `3`   | Switch to Platform layer    |
| `Esc` | Deselect node / close panel |

---

## What this is not

This is not a product. It is a sketch in code — a way to test whether spatial, layer-based interfaces feel right for developer platform management before investing in backend integration, real-time data pipelines, or production infrastructure.

Things that are intentionally missing or faked:

- No real data. Every metric, trace, and status is hardcoded in `src/data/system.ts`.
- No backend. No APIs, no WebSocket connections, no database.
- No auth, no multi-tenancy, no persistence.
- The building toolbar buttons don't actually create nodes (yet).
- Semantic zoom (entering a node to see its internals) is represented via the detail panel's feature list, not as a true canvas-level drill-down.
- No tests. This is throwaway exploration code.

The value is in the _interaction model_, not the implementation.

---

## Where this could go

If the spatial approach proves compelling, the next steps would be:

1. **Semantic zoom** — Double-click a service to enter it. The canvas transitions to show its internal features, endpoints, and dependencies as a nested graph. Breadcrumb navigation to go back up.
2. **Real-time data binding** — Connect to Kubernetes APIs, Prometheus, Jaeger/Tempo for live metrics, traces, and topology discovery.
3. **Collaborative canvas** — Multiple users viewing and annotating the same system map in real time (multiplayer cursors, comments, annotations).
4. **Topology auto-layout** — Derive node positions from service mesh data or OpenTelemetry traces instead of hardcoding positions.
5. **Time travel** — Scrub a timeline to see how the system looked at any point in the past (deployments, incidents, topology changes).
6. **Alerting integration** — Nodes light up in real time when PagerDuty/Opsgenie alerts fire, with the trace layer auto-focusing on the affected path.

---

_"Simplicity is the ultimate sophistication."_ — Leonardo da Vinci
