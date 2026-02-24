## Ideas

### I1 - Version Control:

use version control from deployment repo to show the version history of the system

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

