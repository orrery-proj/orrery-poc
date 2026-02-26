## Ideas

### I1 - Version Control / Timeline:

A draggable floating timeline panel accessible from a small button at the bottom of the viewport (icon: timeline/clock). Hovering the button expands it into a full timeline bar taking the bottom space. The bar is freely draggable anywhere on the viewport (unconstrained, like a pen-tool bar in note-taking apps). The timeline displays all system events: bugs, deployments, proposals. Hovering the edges of the timeline reveals a "search backwards" affordance; clicking moves the time range. Hovering an event shows a minimal tooltip. Clicking an event transitions the entire canvas into a historical snapshot of that moment — highlighting the event similarly to the tracing layer — and the timeline collapses back to button mode with an exit button beside it. Reopening the timeline while in snapshot mode also shows the exit button. Exiting snapshot mode returns the canvas to "live" state. "Live" replaces "tracing" as the default active layer.

### I2 - Repo introspection

Using LLM to inspect and understand repo structure, with features and connections

### I3 - Minimal UI:

The constant question: is it possible to not use a navbar item for this feature?

For everything regarding "customizing the experience" a navbar is acceptable.
Example:

- RBAC
- Profile config

### I4 - Better zoom

Enter the details of a node just by zooming into it. Create a small cue at a certain zoom level to suggest that the node is about to expand, also following the cursor position (two components in the screen, follow the one where the cursor is hovering at, block if none). If continued zooming, the node will expand showing the details. For example showing the features are smaller nodes inside the microservice, or showing the singular kafka topics between two microservices that has more than one.

### I5 - Relive event

In the tracing layer, identify the components and connections related to a certain event (e.g. place order), highlight them and let it be able to re-live them using a timeline that could appear as a panel in the bottom.

### I6 - Devops view

In the Infra layer, be able to see everything of the cluster, like namespaces, pods, kubelet etc.

### I7 - Universal search

Self-explanatory. cmd+k and be able to search ANYTHING

### I8 - Multi-collaboration

Multiple users, collaborating in real-time. Implement a chat feature to facilitate communication and collaboration among team members.

### I9 - Diff between envs

Components are the same, environments changes. Quick and intuitive diff between SRD.

### I10 - Kargo Plugin

Autopromote or schedule autopromotions services, useful when inspecting the the diff between envs.

## Design choices

- SRD as representation of a resource node. Deployments to fine grained. 
- Divide SRD resources by project / environment.
- Inputs:
  - db: link to an already deployed greptime db, self-deployed by us if not provided
  - collector: optional, requires config from the user to set a new destination for the telemetries
  - link to org for LLM inspection (?)

## Open questions

- Layout: auto or manual?
- How to massively improve performance
- Plugins? Conflicts with business model

### Market situation

- current percentage of companies using k8s
- rate of adoption of k8s on new companies
- numbers of devs and services on companies p.a.
- numbers of companies using IDPs
- most common IDPs on the market
- most frustrating things about current IDPs
