## Ideas

The constant question: is it possible to not use a navbar item for this feature?
For everything regarding "customizing the experience" a navbar is acceptable but not encouraged.

### I1 - Version Control / Timeline + Relive Event

A draggable floating timeline panel accessible from a small button at the bottom of the viewport (icon: timeline/clock). Hovering the button expands it into a full timeline bar taking the bottom space. The bar is freely draggable anywhere on the viewport (unconstrained, like a pen-tool bar in note-taking apps). The timeline displays all system events: bugs, deployments, proposals. Hovering the edges of the timeline reveals a "search backwards" affordance; clicking moves the time range. Hovering an event shows a minimal tooltip. Clicking an event transitions the entire canvas into a historical snapshot of that moment — highlighting the event similarly to the tracing layer — and the timeline collapses back to button mode with an exit button beside it. Reopening the timeline while in snapshot mode also shows the exit button. Exiting snapshot mode returns the canvas to "live" state. "Live" replaces "tracing" as the default active layer.

**Relive mode**: When entering a snapshot for a traceable event (e.g. "place order"), the timeline doesn't just highlight affected components statically — it replays the event step-by-step. Edges light up sequentially following the actual request path (Gateway → Order Service → Payment Service → Notification Service), with a small animated dot traveling each hop. The timeline scrubber tracks the current step; dragging it moves forward/backward through the trace. Each step shows latency and status in a minimal overlay on the active edge. This turns the snapshot from a static highlight into a spatial, animated re-enactment of the request flow.

### I2 - Repo introspection

Using LLM to inspect and understand repo structure, with features and connections

### I3 - RBAC

Configuration happens through a **meta-canvas** — a dedicated spatial view that unpacks the platform's own functions into interactive elements. Every controllable surface in the UI becomes a button on this canvas. For example, the three layers from the top-left panel (Live, Building, Platform) each appear as a node; clicking one reveals a list of all teams/roles and their access level for that layer (view, edit, none). Same principle extends to other functions: timeline access, building toolbar actions (add/delete/connect nodes), runbook actions, environment switching, etc.

The meta-canvas approach keeps RBAC consistent with the product's spatial philosophy — you configure permissions the same way you navigate the system: by clicking things on a canvas, not by filling out a table in a settings page. Each "function node" on the meta-canvas could show a small badge with the count of teams that have access, and expanding it reveals the full permission matrix for that function.

Sanity check considerations:
- Scales well for small-to-medium orgs (< 20 teams). For larger orgs, grouping function-nodes by category (layers, actions, data) prevents clutter.
- The meta-canvas itself needs RBAC — only admins should see it. A simple "Admin" entry in the header dropdown (acceptable navbar use per the minimal UI rule since this is "customizing the experience").
- Edge case: cross-cutting permissions (e.g. "read-only everywhere") should be expressible as a role template that can be dragged onto multiple function-nodes at once, not configured one by one.

### I4 - Better zoom

Enter the details of a node just by zooming into it. Create a small cue at a certain zoom level to suggest that the node is about to expand, also following the cursor position (two components in the screen, follow the one where the cursor is hovering at, block if none). If continued zooming, the node will expand showing the details. For example showing the features are smaller nodes inside the microservice, or showing the singular kafka topics between two microservices that has more than one.

### I5 - Devops view

In the Infra layer, be able to see everything of the cluster, like namespaces, pods, kubelet etc.

### I6 - Universal search

Self-explanatory. cmd+k and be able to search ANYTHING

### I7 - Multi-collaboration

Multiple users, collaborating in real-time. Implement a chat feature to facilitate communication and collaboration among team members.

### I8 - Env Stacking (Diff between envs)

Components are the same, environments change. The challenge: how to make differences instantly visible without tab-switching or side-by-side layouts that break the spatial mental model.

**Z-axis stacking**: Environments are rendered as the same canvas stacked along the z-axis — like transparent layers in Photoshop or glass panes in physical space. The active environment sits at z=0 (full opacity, interactive). Other environments float behind it at increasing z-depth, slightly scaled down and faded (e.g. staging at z=-1 with 40% opacity, dev at z=-2 with 20%). A subtle parallax shift on mouse movement reinforces the depth illusion.

**Diff highlighting**: Nodes/edges that differ between the foreground env and any background env get a visual diff marker — a colored outline or glow (green = only in foreground, red = only in background, amber = present in both but different config/version). Hovering a diff-marked node shows a compact comparison tooltip (e.g. "prod: v2.3.1 / staging: v2.4.0-rc1, 2 replicas vs 3 replicas").

**Interaction**: Scroll-wheel on a dedicated axis control (or a small depth slider on the side) brings a background env forward to z=0, pushing the current one back. This feels like flipping through stacked cards. Pinching (trackpad) could also map to the z-axis for a natural "pull apart the stack" gesture. The transition animates smoothly — the canvases slide past each other with a slight blur during motion.

**Quick diff mode**: A toggle that collapses all environments to z=0 simultaneously, overlaying them with maximum transparency. Only the differences remain visible (identical nodes cancel out to solid, differences shimmer). This is the "instant answer" mode — glance and see every delta across all envs at once.

### I9 - Kargo Plugin

Autopromote or schedule autopromotions services, useful when inspecting the diff between envs.

### I10 - Blast Radius Simulation

Click any node and trigger a "what if this dies?" mode. Animated domino-effect cascades through dependent services — edges flash red sequentially following the dependency graph, downstream nodes dim one by one with a staggered delay. A small overlay tallies the blast: "4 services affected, ~12k users impacted." Inverts the typical post-mortem into a pre-mortem tool.

### I11 - Cost Flow Layer

A fourth layer (or sub-layer of Platform) where edge thickness represents dollar cost. Cloud spend flows visually through the graph like water — thick, bright edges are expensive paths, thin ones are cheap. Nodes show their monthly cost as a radial fill. Immediately answers "where is our money going?" without opening a billing console. Pairs naturally with env diff (I9).

### I12 - Ambient Sonification

Map system health to generative audio. Healthy = low warm drone, degraded = subtle dissonance, critical = percussive alert tones. Each node contributes a voice to the mix based on its metrics. Engineers can "listen" to their system in the background while coding — a degradation in the soundscape triggers attention before any dashboard. Toggle on/off from the header.

### I13 - Canvas Annotations / Sketch Layer

A freeform drawing layer over the canvas — pen strokes, arrows, text boxes, sticky notes. Persisted per-layer and per-snapshot. During incident reviews, draw directly on the affected path. During architecture discussions, sketch proposed changes on top of the live topology. Annotations are first-class objects: searchable, timestamped, attributable to a user.

### I14 - Spatial Bookmarks (Viewpoints)

Save the current camera position + layer + focus state + timeline position as a named "viewpoint." Jump between viewpoints instantly. Share them as deep links. Use cases: "Payment debug view" (zoomed into payment cluster, live layer, focus on Payment Service), "Sprint 12 proposals" (building layer, zoomed out, timeline at proposal date). Essentially browser bookmarks for the system's spatial state.

### I15 - AI Narrator (System Storytelling)

An LLM watches the metric stream and generates a running natural-language narrative in a small aside panel: "Order Service latency spiked 3x following the Payment Service deploy at 14:15. The spike correlates with the new retry policy — see edge Order→Payment for details." Click any sentence and the canvas navigates to the relevant nodes/edges. Turns raw metrics into a readable incident log. Pairs with timeline (I1) and relive mode.

### I16 - Ownership Territories

Color-fill convex hulls around node clusters by team ownership. The canvas becomes a territory map — you instantly see team boundaries, shared dependencies crossing territory lines, and orphaned services with no owner. Hovering a territory highlights all its edges (internal = solid, cross-team = dashed).

### I17 - Runbook Actions (Canvas as Control Plane)

Right-click a node → contextual actions: restart pod, scale replicas, toggle feature flag, trigger deploy, rollback. The canvas isn't just a viewer — it's a control surface. Actions are gated by RBAC (I3) and produce timeline events (I1). Confirmation dialogs show blast radius (I11). Collapses the observe→decide→act loop into a single spatial interface.

### I18 - Project List (Canvas of Canvases)

Each project is a canvas. The question: how do you navigate between them?

**Zoom-out transition**: From within a project canvas, zooming out past a threshold (e.g. below 0.15x zoom) triggers a smooth transition to a grid view where each project appears as a miniaturized, live-thumbnail canvas tile. The tiles show a simplified rendering of the topology (just node dots and edge lines, no labels) with a health-status glow (green/amber/red border). Zooming into any tile transitions back into that project's full canvas.

UX considerations:
- The zoom-out approach is natural for spatial interfaces (Google Maps does this — zoom out from street to city to country) and consistent with I4's semantic zoom philosophy.
- Risk: accidental zoom-out. Mitigate with a clear "threshold zone" — at ~0.2x zoom, show a subtle vignette or label ("zoom out more to see all projects") so the user knows they're approaching the transition, and can stop if unintentional.
- Alternative entry: cmd+P or a small "projects" icon in the header for keyboard-first users who don't want to zoom-dance.
- Each tile could show a one-line status summary (e.g. "3 critical, 1 deploying") and the project name.
- The grid itself could be spatial — projects that share infrastructure or teams are placed closer together, creating an org-level topology.

## Design choices

- SRD as representation of a resource node. Deployments too fine grained.
- Divide SRD resources by project / environment.
- Inputs:
  - db: link to an already deployed greptime db, self-deployed by us if not provided
  - collector: optional, requires config from the user to set a new destination for the telemetries
  - link to org for LLM inspection (?)

## Open questions

- Layout: auto or manual?
  - auto, with manual intervention in building layer
- Plugins?
  Nop. Conflicts with business model. This actually simplifies design. But it does not mean to build a stupid unscalable monolith

### Performance: ReactFlow ceiling and radical alternatives

ReactFlow renders every node and edge as a DOM element (React component). Each node is a `<div>` with full React lifecycle overhead. CSS shadows, gradients, animations compound the cost. DOM rendering is locked to the main thread. Practical limit: hundreds of nodes before needing heavy optimization. React Flow v12 (`@xyflow/react`) improved perf and added a framework-agnostic core (`@xyflow/system`), but **did not change the underlying DOM rendering architecture**. No public roadmap for Canvas/WebGL rendering.

**What tools like Figma, Miro, tldraw use:**
- Figma: C++/WASM compiled to WebGL, now migrating to WebGPU. React only for panels/toolbar. Tile-based GPU renderer with custom GLSL shaders.
- Miro: Canvas 2D / WebGL (proprietary) + React UI shell.
- tldraw: SVG + Canvas with React. Centralized culling system, direct DOM manipulation for perf. Reduces subscription overhead from O(N) to O(1).
- Common pattern: **React for UI chrome, custom renderer for the canvas**. None render canvas content as DOM elements.

**Upgrade path (ordered by effort):**

1. **Optimize ReactFlow** (days) — Memoize nodes/edges, `React.memo`, simplify CSS, lazy-render off-screen nodes. Gets to ~500-1000 nodes. Sufficient for the current POC.

2. **Switch to WebGL graph library** (weeks) — Sigma.js v3 (WebGL, handles ~100k edges), PixiJS + custom graph layer, or GoJS (Canvas 2D, thousands of nodes <2s at 60fps). You lose ReactFlow's built-in interactions and need to reimplement drag, selection, minimap. Sigma.js is purpose-built for graphs.

3. **Hybrid: React shell + Canvas/WebGL engine** (months) — The Figma pattern. React handles timeline, layer controls, toolbars. A custom or library-based Canvas/WebGL renderer handles the node graph. Correct architecture for scaling to thousands of nodes with complex visual effects.

4. **Hybrid: React + Rust/WASM canvas via wgpu** (months, higher risk) — Same as above but the canvas engine is Rust compiled to WASM via wgpu (Rust's GPU abstraction, compiles to WebGPU or WebGL2 in browser). Maximum performance. Only justified if you need compute-heavy operations (real-time layout algorithms, physics simulations) alongside rendering. Figma, Adobe Photoshop (web), AutoCAD (web), 1Password all ship Rust/WASM in production.

5. **Tauri desktop app** (orthogonal) — Tauri v2 (stable since Oct 2024): 2.5-3MB bundle vs Electron's 80-120MB, 30-40MB idle RAM vs 200-300MB, <500ms startup. Could use wgpu natively (not through WASM) for full GPU access. But: uses OS WebView (inconsistent rendering across platforms), WebGPU support depends on OS WebView version, limits distribution to desktop — an IDP that needs browser access for sharing/collaboration loses a major benefit of being web-native.

**Rust/WASM framework landscape (Feb 2026):**
- Leptos 0.7: ~18.5k stars. Fine-grained reactivity, direct DOM (no VDOM). Most mature for web. Not yet 1.0.
- Dioxus 0.7: ~23k stars. Virtual DOM + signals. Strongest for desktop/mobile. Hot-patching of Rust at runtime.
- Yew 0.21: ~30.5k stars. Virtual DOM, React-like. Oldest, stable, but slower development pace.
- All are **DOM-based** — none render to Canvas/WebGL natively. For Canvas/WebGL you'd use wgpu or Bevy separately.

**WebGPU browser support (Jan 2026): full cross-browser.** Chrome/Edge since v113, Firefox Windows since v141, Safari macOS Tahoe 26 / iOS 26. ~70% global coverage. WebGL2 fallback path is trivial.

**JS-WASM boundary cost:** Not zero. Small frequent calls can be slower than pure JS. But at 50-500 nodes, passing the entire graph state as a single serialized buffer per update is microseconds — negligible. SharedArrayBuffer (near-zero overhead) requires COOP/COEP headers.

**Bottom line for Orray:** At 50-500 nodes ReactFlow is adequate with optimization (option 1). If the product scales to thousands of nodes or the animation/layer system hits DOM limits, the move is to option 2 (Sigma.js/PixiJS) or option 3 (Figma-pattern hybrid). Rust/WASM (option 4) is the nuclear option — technically correct at Figma scale, but overkill until node counts reach thousands with complex per-frame effects.

### Market situation

- current percentage of companies using k8s
- rate of adoption of k8s on new companies
- numbers of devs and services on companies p.a.
- numbers of companies using IDPs
- most common IDPs on the market
- most frustrating things about current IDPs
- the most used interaction medium for inspecting a platform: mouse, trackpad, touch, keyboard, pen.

# Market Research Report (Kubernetes + Internal Developer Platforms) — 2026-02-28

This report summarizes the best available, citable data for each point you listed. Where the industry does **not** have a clean, public metric, it’s explicitly called out.

---

## 1) Current percentage of companies using Kubernetes

There is **no single authoritative** “% of all companies worldwide using Kubernetes” because “company” is an ill-defined denominator (most companies have no software org, no containers, etc.). What *is* measured reliably is adoption **among container users / surveyed orgs**.

- **82% of container users run Kubernetes in production (2025)**  
  Source (CNCF announcement + report):  
  - https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/  
  - https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/

- **~80% of organizations run Kubernetes in production** (enterprise-focused survey)  
  Source (Komodor 2025 Enterprise Kubernetes Report PDF):  
  - https://komodor.com/wp-content/uploads/2025/09/Komodor-2025-Enterprise-Kubernetes-Report.pdf

**How to phrase this in your materials (accurately):**  
“Kubernetes is used in production by roughly **~80%+ of container-using organizations** in recent large surveys.”

---

## 2) Rate of adoption of Kubernetes in *new* companies

A clean “**new adopters per year**” metric is not commonly published publicly in a credible way.

What is available:
- **CNCF indicates new cloud native adoption is slowing** and that only a small share remains “early stage / not using” cloud native.  
  Source (CNCF announcement; cloud native broadly, not strictly k8s):  
  - https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/

**Best proxy metric you *can* cite:**  
Track the change over time in “% running Kubernetes in production” within a consistent survey population (e.g., CNCF year-over-year).

---

## 3) Number of devs and services in companies (per annum)

### 3a) Number of developers in companies p.a.
A generalized “devs per company per year” benchmark is not a standard public metric; it depends heavily on:
- industry, region
- company size distribution (median vs mean differs drastically)
- whether you count contractors, platform/SRE, etc.

Public survey demographics exist, but they are **not** a “per company per annum” benchmark:
- Stack Overflow Developer Survey (respondent-level data, not company-wide averages)  
  Source:  
  - https://survey.stackoverflow.co/2025/developers/

**Practical note:** For an IDP business case, you’ll get more defensible numbers by segmenting: e.g., “companies with 150+ developers” (like Port’s reports), or “mid-market SaaS 200–2000 employees.”

### 3b) Number of services (microservices) in companies p.a.
There is no broadly accepted public “average number of services per company” metric. What exists are:
- **case studies / research datasets** at specific large companies (not generalizable)
- vendor claims with unclear methodology

Example of a **real-world scale reference** (research, Alibaba system trace analysis):
- https://arxiv.org/pdf/2504.13141

**Recommendation:** treat service count as a **banded variable** (<50, 50–200, 200–1000, 1000+) and validate with interviews/telemetry in your target segment.

---

## 4) Number of companies using IDPs

The market measures this more often as “Internal Developer Portals” (Backstage-like portals), and the best public stats are survey-based (not a universal census).

- **50% already use an internal developer portal; 35% plan to in the next 12 months** (in Port’s 2024 sample of engineering leaders at companies with 150+ devs)  
  Sources:  
  - PDF: https://info.getport.io/hubfs/2024%20state%20of%20internal%20developer%20portals_edited.pdf  
  - Landing page: https://port.io/state-of-internal-developer-portals-2024

- Port’s 2025 report provides additional adoption/usage signals (including tool usage patterns and metadata approaches).  
  Source:  
  - https://www.port.io/state-of-internal-developer-portals

**Important caveat:** Port is a vendor; treat these as **survey insights**, not a definitive market census.

---

## 5) Most common IDPs on the market

### 5a) Most common framework (open ecosystem)
- **Backstage** is widely recognized as the dominant open-source framework for internal developer portals.
  - Port’s 2024 report shows “Backstage” as a major category in their sample.  
    Source (Port 2024 PDF):  
    - https://info.getport.io/hubfs/2024%20state%20of%20internal%20developer%20portals_edited.pdf

### 5b) Common commercial offerings (examples commonly referenced)
Based on ecosystem discussions and market visibility (not a neutral market-share ranking in the sources gathered):
- **Port**, **Cortex**, **OpsLevel**, **Roadie** (Backstage SaaS), plus other emerging vendors.

Ecosystem context source:
- https://tfir.io/survey-understanding-backstage-and-internal-developer-portals-in-2025

**Note:** A true “most common by market share” list generally comes from paid analyst research or proprietary usage data; I did not find a credible free/public market-share table in the sources gathered.

---

## 6) Most frustrating things about current IDPs

Strong, citable pain points from Port’s 2025 report (survey of 300 developers in US & Western Europe, organizations with 150+ developers), plus a media summary:

- **Tool sprawl**: average **7.4 tools** used for everyday operational tasks  
- **Productivity loss due to tool sprawl**: **75%** lose **6–15 hours weekly**  
- **Waiting on SRE/DevOps**: **78%** wait **a day or more** for assistance  
- **Self-service dissatisfaction**: **94%** experience dissatisfaction with self-service tools  
- **Low trust in platform metadata**: only **3%** report data quality is completely trustworthy; **50%** have doubts

Sources:
- Port report: https://www.port.io/state-of-internal-developer-portals  
- DevOps.com summary: https://devops.com/survey-increased-tool-sprawl-saps-developer-productivity/

**How these translate into design requirements for your “visual interpretation” platform:**
- reduce context switching (unify discovery + action)
- make ownership/dependencies obvious (service maps, blast radius)
- shorten the “ask platform team” loop (guardrailed self-service)
- make metadata provenance/freshness transparent (trust mechanics)

---

## 7) Most used interaction medium for inspecting a platform (mouse, trackpad, touch, keyboard, pen)

I did **not** find credible public research that directly answers:  
“for inspecting an internal platform UI, what % use mouse vs trackpad vs touch vs keyboard vs pen?”

What exists publicly:
- High-level workplace computing reports (often paywalled) that may include device/input trends, but not specifically “platform inspection” tasks.

Example (paywalled):
- https://www.forrester.com/report/end-user-computing-market-insights-2025/RES181968

**Best practical approach (and the one investors/buyers accept):**
- instrument your product and publish your own metrics:
  - pointer usage vs keyboard shortcut usage
  - session device class (desktop/laptop/tablet)
  - touch vs mouse/trackpad via Pointer Events (`pointerType`)
- complement telemetry with 10–20 targeted usability studies across roles (dev, SRE, EM).

---

## Appendix: Primary links (all in one place)

- CNCF Annual Cloud Native Survey announcement (82% in production among container users):  
  https://www.cncf.io/announcements/2026/01/20/kubernetes-established-as-the-de-facto-operating-system-for-ai-as-production-use-hits-82-in-2025-cncf-annual-cloud-native-survey/

- CNCF report landing page:  
  https://www.cncf.io/reports/the-cncf-annual-cloud-native-survey/

- Komodor 2025 Enterprise Kubernetes Report (PDF):  
  https://komodor.com/wp-content/uploads/2025/09/Komodor-2025-Enterprise-Kubernetes-Report.pdf

- Port 2024 State of Internal Developer Portals (PDF):  
  https://info.getport.io/hubfs/2024%20state%20of%20internal%20developer%20portals_edited.pdf

- Port State of Internal Developer Portals (2025):  
  https://www.port.io/state-of-internal-developer-portals

- DevOps.com coverage of Port survey results:  
  https://devops.com/survey-increased-tool-sprawl-saps-developer-productivity/

- Stack Overflow Developer Survey 2025:  
  https://survey.stackoverflow.co/2025/developers/

- Alibaba microservices trace analysis (research PDF):  
  https://arxiv.org/pdf/2504.13141

- Forrester end-user computing market insights 2025 (paywalled):  
  https://www.forrester.com/report/end-user-computing-market-insights-2025/RES181968
