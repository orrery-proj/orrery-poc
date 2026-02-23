# AGENTS.md — Meridian IDP PoC

Guidance for AI agents (Cursor, Claude Code, Gemini, Copilot, etc.) contributing to this repository.

---

## Project context

This is a **UI/UX Proof of Concept** — a throwaway prototype exploring spatial, layer-based interfaces for developer platforms. There is no backend, no real data, no production infrastructure. All data is hardcoded in `src/data/`. The codebase exists to test interaction models and design ideas, not to ship a product.

**Before touching any code, read `README.md`** to understand the philosophy and the scope.

---

## Non-negotiable constraints

1. **Never introduce a backend.** No API calls, no WebSocket clients, no server-side code. If something needs real data, hardcode it in `src/data/system.ts`.
2. **Never break the data/UI separation.** Mock data lives exclusively in `src/data/`. Components must not embed hardcoded strings, colors, or topology inline — those belong in data or config objects.
3. **Never use `any`.** This is a strict TypeScript project. Use proper generics, narrowing, or `unknown` with guards.
4. **Never suppress TypeScript errors with `@ts-ignore` or `@ts-expect-error`** unless there is a documented upstream limitation with a comment explaining why.
5. **The build must pass clean.** Run `bun run build` before considering any task complete. Zero TypeScript errors, zero unused imports.

---

## Architecture

```
src/
├── data/           # All mock data and type definitions. Never import from components.
├── stores/         # Zustand stores. One concern per store.
├── components/
│   ├── canvas/     # React Flow canvas, nodes, edges
│   ├── panels/     # Floating UI (detail panel, toolbars)
│   └── ui/         # shadcn/ui primitives only — do not put logic here
├── hooks/          # Reusable React hooks
└── routes/         # TanStack Router file-based routes
```

### Data flow (one direction only)

```
src/data/types.ts        → type contracts, no dependencies
src/data/system.ts       → mock data, imports from types only
src/stores/layer-store.ts → reads data, exposes reactive state
src/components/**        → reads from store, never from data directly
```

Components must **never** import from `src/data/` directly. They read from the store.

---

## TypeScript

- Strict mode is on (`strict: true`, `noUnusedLocals`, `noUnusedParameters`). Satisfy all of these.
- Use `type` imports for type-only symbols: `import type { Foo } from "./foo"`.
- Prefer explicit return types on exported functions and hooks.
- When extending React Flow generics, wrap data types in the React Flow wrapper:

```typescript
// ✅ Correct — wraps your data type in the RF Node wrapper
type SystemNodeType = Node<SystemNodeData>;
export const MyNode = memo(({ data }: NodeProps<SystemNodeType>) => { ... });

// ❌ Wrong — passes raw data type directly to NodeProps
export const MyNode = memo(({ data }: NodeProps<SystemNodeData>) => { ... });
```

- Extend `SystemNodeData` / `SystemEdgeData` in `src/data/types.ts` when adding new fields. Add the index signature `[key: string]: unknown` only if React Flow requires it (it does for node/edge data).

---

## React patterns

- All components must be **function components**. No class components.
- **Do not use `memo()`, `useCallback()`, or `useMemo()` as manual performance optimizations.** The React Compiler (`babel-plugin-react-compiler`) is enabled and handles all memoization automatically during the build. Adding them manually is redundant noise and will trigger a compiler warning.
- **Hooks rules**: keep hooks at the top level; no conditional hooks; extract multi-line hook logic into `src/hooks/`.
- Keep components **single-responsibility**. If a component file exceeds ~250 lines, it's doing too much — split it.
- Colocate sub-components in the same file only if they are never used elsewhere. Otherwise, give them their own file.
- Prefer named function declarations for exported components (`export function Foo`) over `export const Foo = () =>` — the compiler and stack traces both benefit from the explicit name.

```typescript
// ✅ Good — named function declaration, typed props
export function NodeDetailPanel({
  node,
  onClose,
}: {
  node: Node<SystemNodeData>;
  onClose: () => void;
}) { ... }

// ❌ Bad — memo() is redundant with the React Compiler active
export const NodeDetailPanel = memo(function NodeDetailPanel({ ... }) { ... });

// ❌ Bad — anonymous arrow function, untyped props
export const NodeDetailPanel = ({ node, onClose }: any) => { ... };
```

---

## Layer system

Every new visual feature must be **layer-aware**. The three layers are `"tracing"`, `"building"`, and `"platform"`. Read the active layer from the store:

```typescript
const activeLayer = useLayerStore((s) => s.activeLayer);
```

Conditional rendering per layer follows this pattern:

```typescript
{activeLayer === "tracing" && <TracingOverlay data={data} />}
{activeLayer === "building" && <BuildingOverlay data={data} />}
{activeLayer === "platform" && <PlatformOverlay data={data} />}
```

**Never hard-code a layer name as a string outside of `src/data/types.ts`.** Use the `LayerId` type.

When adding a new layer:
1. Add it to the `LayerId` union in `src/data/types.ts`.
2. Add its data fields to `SystemNodeData` / `SystemEdgeData`.
3. Add mock data to `src/data/system.ts`.
4. Add the layer config entry in `CanvasHeader.tsx`.
5. Add the overlay component to `SystemNode.tsx`.
6. Add edge styling logic to `DataFlowEdge.tsx`.

---

## React Flow conventions

- `nodeTypes` and `edgeTypes` must be defined **outside the component** (stable reference). Defining them inside the component causes React Flow to remount on every render.
- Use the `Node<Data>` / `Edge<Data>` wrapper types — do not pass raw data types directly to React Flow generics.
- Custom node components must render `<Handle type="target" ... />` and `<Handle type="source" ... />`.
- For animated edges, use CSS `@keyframes` defined in `index.css`, not inline `style` animations.
- The `proOptions={{ hideAttribution: true }}` prop is already set. Do not remove it.

```typescript
// ✅ Stable reference — defined outside component
const nodeTypes = { system: SystemNodeComponent };

function MyCanvas() {
  return <ReactFlow nodeTypes={nodeTypes} ... />;
}

// ❌ Causes remount on every render
function MyCanvas() {
  const nodeTypes = { system: SystemNodeComponent }; // ← BAD
  return <ReactFlow nodeTypes={nodeTypes} ... />;
}
```

---

## Styling

- **Tailwind CSS 4** with `@theme inline` tokens in `src/index.css`. Use design tokens (`text-layer-tracing`, `bg-layer-error`, etc.) — never hardcode color values in components.
- Use the `cn()` utility from `src/lib/utils.ts` for conditional class composition. Never use string concatenation for class names.
- React Flow overrides belong in `src/index.css` under the `/* React Flow overrides */` section. Never override React Flow styles in component files.
- Motion/animation: use `motion/react` for enter/exit and spring transitions. Use CSS `@keyframes` for continuous loops (trace flow animation, error pulse). Do not mix both for the same element.
- `oklch()` color space is used throughout. Match the existing format: `oklch(L C H)` or `oklch(L C H / alpha)`.

```typescript
// ✅ Use design tokens
<div className="text-layer-tracing bg-layer-error/10" />

// ❌ Never hardcode colors in components
<div className="text-[oklch(0.78_0.15_200)]" />
```

---

## State management

- One Zustand store per domain concern. Currently: `src/stores/layer-store.ts`.
- Selectors must be granular — subscribe to the minimum slice of state needed:

```typescript
// ✅ Granular — only re-renders when activeLayer changes
const activeLayer = useLayerStore((s) => s.activeLayer);

// ❌ Subscribes to entire store — re-renders on any state change
const store = useLayerStore();
```

- Never call `useLayerStore.getState()` inside components. Use the selector hook.
- Zustand actions that derive values from other state slices must use `get()`, not the stale closure approach.

---

## Mock data

When extending `src/data/system.ts`:

- Every node must have data for **all three layers** (`tracing`, `building`, `platform`) even if that layer doesn't display it — this ensures switching layers never crashes on undefined access.
- Node IDs must be `kebab-case` and globally unique.
- Edge IDs follow the pattern `{sourceId}-{targetId}` (e.g. `gw-us` for gateway → user-service).
- Draft nodes belong in the `draftNodes` array, not `systemNodes`. Draft edges belong in `draftEdges`.
- Platform `health` must use the `HealthStatus` type. Do not use ad-hoc strings.

---

## Adding a new node kind

1. Add the kind to the `NodeKind` union in `src/data/types.ts`.
2. Add a `kindConfig` entry in `src/components/canvas/nodes/SystemNode.tsx` (icon, accent color, background accent color).
3. Add the kind to the `kindIcons` map in `src/components/panels/NodeDetailPanel.tsx`.
4. Add mock nodes to `src/data/system.ts`.

---

## Commit conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```
<type>(<scope>): <subject>

[optional body]
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`.

Scope examples: `canvas`, `nodes`, `edges`, `layers`, `data`, `store`, `ui`, `routing`.

```
feat(nodes): add external-service node kind with third-party icon
fix(edges): prevent ghost edge label from rendering outside canvas bounds
refactor(store): extract focused node state into dedicated selector
docs: update README with semantic zoom roadmap section
```

- **One logical change per commit.** Do not bundle unrelated changes.
- Commit message subject is imperative, present tense, lowercase, no trailing period.

---

## What NOT to do

| Do not | Because |
|---|---|
| Use `memo()`, `useCallback()`, or `useMemo()` for performance | The React Compiler handles all memoization automatically |
| Add a backend, server, or API client | This is a hardcoded PoC by design |
| Import from `src/data/` inside components | Violates the data/UI separation contract |
| Define `nodeTypes` / `edgeTypes` inside a component | Causes React Flow to remount all nodes on every render |
| Use `any` type | Defeats the strict TypeScript setup |
| Add a `console.log` to committed code | Use proper error boundaries or explicit error states |
| Create a new `shadcn/ui` component for application logic | `src/components/ui/` is for primitives only |
| Hardcode layer-specific colors directly in components | Use the `--color-layer-*` design tokens |
| Add CSS in component files | All styles go in `index.css` or Tailwind classes |
| Use `useEffect` to sync state that can be derived | Derive it in the store or with `useMemo` |
| Write a long component and justify it as "for now" | Split it immediately |
