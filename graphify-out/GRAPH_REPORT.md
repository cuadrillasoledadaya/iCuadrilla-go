# Graph Report - iCuadrilla  (2026-06-11)

## Corpus Check
- 191 files · ~1,081,524 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 372 nodes · 958 edges · 24 communities (19 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7652d6e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 61 edges
2. `supabase` - 41 edges
3. `useToast()` - 35 edges
4. `Button` - 33 edges
5. `useUserRole()` - 29 edges
6. `Spinner` - 27 edges
7. `PageHeader()` - 25 edges
8. `Input` - 21 edges
9. `ConfirmDialog()` - 12 edges
10. `What You Must Do When Invoked` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Harness()` --calls--> `useToast()`  [EXTRACTED]
  __tests__/components/ui/toast.test.tsx → components/ui/toast.tsx
- `EditarAnuncio()` --calls--> `useToast()`  [INFERRED]
  app/(dashboard)/anuncios/[id]/editar/page.tsx → components/ui/toast.tsx
- `AltaCostalero()` --calls--> `useToast()`  [INFERRED]
  app/(dashboard)/costaleros/nuevo/page.tsx → components/ui/toast.tsx
- `EditarCostalero()` --calls--> `cn()`  [INFERRED]
  app/(dashboard)/cuadrilla/[id]/editar/page.tsx → lib/utils.ts
- `DatosPalioPage()` --calls--> `useToast()`  [EXTRACTED]
  app/(dashboard)/datos-palio/page.tsx → components/ui/toast.tsx

## Import Cycles
- None detected.

## Communities (24 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (40): Anuncio, BajaCostalero(), EditarAnuncio(), EditarCostalero(), EditarEvento(), formSchema, CostaleroRow, Costalero (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (23): inter, metadata, viewport, LayoutContext, LayoutContextType, LayoutProvider(), useLayout(), LayoutWrapper() (+15 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (27): DatosPalioPage(), PerfilTrabajadera, CandidateItem, Costalero, CostaleroInfoCard(), GestionIguala(), getAvailablePositions(), Iguala (+19 more)

### Community 3 - "Community 3"
Cohesion: 0.20
Nodes (10): CostaleroCard, CuadrillaList(), Costalero, useCuadrilla(), UseCuadrillaOptions, Evento, DropdownMenuContent, DropdownMenuItem (+2 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (15): Costalero, Evento, FetchOptions, UseFetchResult, buildCacheKey(), hashString(), addToSyncQueue(), AttendancePayload (+7 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (12): defaultTitleMap, iconColorMap, iconMap, styleMap, Harness(), ToastCard(), ToastContext, ToastContextValue (+4 more)

### Community 6 - "Community 6"
Cohesion: 0.22
Nodes (10): Aviso, DashboardPage(), Evento, Stats, useIsDesktop(), useMediaQuery(), formatDateDefault(), formatDateShort() (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (13): AgendaEventos(), useEventos(), Movimiento, Badge(), BadgeProps, BadgeVariant, badgeVariants, EmptyState() (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (24): AjustesPage(), TablonAnuncios(), checkIsMaster(), CostaleroInfo, EstadisticasContent(), TrabajaderaStat, useFetch(), Temporada (+16 more)

### Community 9 - "Community 9"
Cohesion: 0.24
Nodes (8): SessionTimeout(), GET(), rateLimit(), rateLimitMap, createClient(), GET(), Modal(), ModalProps

### Community 10 - "Community 10"
Cohesion: 0.40
Nodes (4): costaleroSchema, CostaleroValues, eventoSchema, EventoValues

### Community 15 - "Community 15"
Cohesion: 0.08
Nodes (23): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+15 more)

### Community 16 - "Community 16"
Cohesion: 0.25
Nodes (7): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 18 - "Community 18"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 19 - "Community 19"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 20 - "Community 20"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

## Knowledge Gaps
- **132 isolated node(s):** `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)`, `Step 1 - Ensure graphify is installed`, `Step 2 - Detect files` (+127 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 4`, `Community 5`, `Community 6`, `Community 7`, `Community 8`, `Community 9`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `supabase` connect `Community 0` to `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `createClient()` connect `Community 9` to `Community 0`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `cn()` (e.g. with `EditarCostalero()` and `EstadisticasContent()`) actually correct?**
  _`cn()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `useToast()` (e.g. with `EditarAnuncio()` and `EditarCostalero()`) actually correct?**
  _`useToast()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `useUserRole()` (e.g. with `EstadisticasContent()` and `DetalleEvento()`) actually correct?**
  _`useUserRole()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Usage`, `What graphify is for`, `Step 0 - GitHub repos and multi-path merge (only if a URL or several paths)` to the rest of the system?**
  _132 weakly-connected nodes found - possible documentation gaps or missing edges._