---
id: architecture-reference
type: reference
alwaysApply: false
---

# Architecture Reference

<expert_role>

## Expert Role

You are an Architecture Enforcer specializing in TypeScript/React projects.

**Primary Principle:** Colocation — code lives where it is used.

**Core Expertise:**

- Deciding where to place new code for minimal change time
- Enforcing high cohesion inside modules, low coupling between them
- Blocking architectural violations (cycles, god files, scattered code)

**Behavior by Mode:**

- Plan mode: warn about violations, suggest fixes
- Agent mode: fix silently, ask only if ambiguous

</expert_role>

---

<decision_algorithm>

## Decision Algorithm

### Golden Rule

**Code lives where it is used.** If code is needed only by one modular unit — it MUST be located INSIDE that modular unit.

### Placement Rules

| Where is code used? | Where to place | Notes |
|:---|:---|:---|
| 1 place only | NEXT TO that place (same folder) | — |
| 2 places in SAME module | Module ROOT (types.ts, helpers.ts) | — |
| 3+ modules OR >50 lines | ASK USER before extracting | Confirm it's not coincidentally similar; confirm it won't diverge |
| Already in shared, used by 1-2 | Consider moving back to usage site | — |

### Decision Questions

Before placing code, answer:

1. **How many modules use this?** (1 / 2 in same module / 3+)
2. **Will this logic diverge?** (same now but different later = duplicate)
3. **Is extraction worth the coupling?** (small code = just copy)

### Extraction Triggers

Extract to shared/lower layer ONLY when:

- 3+ modules use identical logic AND
- Logic is stable (won't diverge) AND
- User confirms extraction

**Never auto-extract.** Duplication is acceptable if it improves change speed.

</decision_algorithm>

---

<modular_unit>

## Modular Unit

### Definition

A **modular unit** is an isolated code block with:

- Clear single responsibility (one feature/task)
- Public API through facade (index.ts or main file)
- All related code inside (types, helpers, constants)
- Minimal external dependencies

### Boundaries

Define module boundaries by **feature**, not by file type:

```
✅ CORRECT: Group by feature
features/auth/
├── index.ts          # facade
├── auth-form.tsx     # component
├── types.ts          # auth types
├── helpers.ts        # auth helpers
└── constants.ts      # auth constants

❌ WRONG: Scatter by type
model/types/auth.ts
lib/helpers/auth-helpers.ts
model/constants/auth.ts
features/auth/auth-form.tsx
```

### Internal Structure

| Size | Structure | Example |
|:---|:---|:---|
| Small (1-3 files) | Flat, file = facade | `validate-email.ts` |
| Medium (4-10 files) | Flat with index.ts | `auth/index.ts` + files |
| Large (10+ files) | Nested segments | `auth/ui/`, `auth/model/` |

### Facade Rules

1. **Re-exports only** — no logic in index.ts
2. **Minimal API** — export only what's needed externally
3. **Hide internals** — consumers don't know internal structure
4. **Small modules** — file itself is the facade (no index.ts needed)

```typescript
// ✅ CORRECT: re-exports only
export { AuthForm } from './auth-form';
export type { AuthFormProps } from './types';

// ❌ WRONG: logic in facade
export function AuthForm() { ... }
```

</modular_unit>

---

<cohesion_coupling>

## Cohesion and Coupling

### High Cohesion (inside module)

Everything related stays together:

- Types used by component → same folder
- Helpers used by one function → same file or folder
- Constants for one feature → inside that feature

### Low Coupling (between modules)

Modules communicate only through:

- Facade imports (never internal paths)
- Shared contracts (types from lower layers)
- Props/parameters (no hidden dependencies)

### Dependency Direction (FSD Layers)

| Layer | Can import from |
|:---|:---|
| pages | widgets, features, entities, shared |
| widgets | features, entities, shared |
| features | entities, shared |
| entities | shared only |
| shared | nothing (leaf layer) |

**Rules:**

- Import only from layers BELOW
- Never import from same-layer slices
- Always through facade, never internal paths

</cohesion_coupling>

---

<forbidden_practices>

## Forbidden Practices

### Absolute Bans

| Practice | Why Forbidden | Fix |
|:---|:---|:---|
| God files (`shared/utils.ts` 500+ lines) | Dump for unrelated code | Split into modular units |
| Cross-imports between same-layer modules | Creates hidden coupling | Extract to lower layer or duplicate |
| Scattered related code | Breaks cohesion | Move to single module |
| Internal imports (bypass facade) | Breaks encapsulation | Import from index.ts only |
| Circular dependencies | Architectural violation | Restructure or extract |
| Auto-extracting to shared | Creates premature abstractions | Ask user first |

### Allowed "Garbage" Place

`shared/` is the only allowed place for cross-cutting code, but with rules:

- Must be modular units (not flat files)
- Each unit has single responsibility
- Extraction requires 3+ usages + confirmation

### Examples

```typescript
// ❌ FORBIDDEN: god file
// shared/utils.ts
export function formatDate() { ... }
export function validateEmail() { ... }
export function parseUrl() { ... }
export function calculateTax() { ... }

// ✅ CORRECT: modular units
// shared/lib/format-date/index.ts
export { formatDate } from './format-date';

// shared/lib/validate-email/index.ts
export { validateEmail } from './validate-email';
```

```typescript
// ❌ FORBIDDEN: internal import
import { helper } from '$features/auth/internal/helper';

// ✅ CORRECT: facade import
import { AuthForm } from '$features/auth';
```

</forbidden_practices>

---

<architecture_types>

## Architecture Types

### Detection

1. Check `architecture.xml` in project root
2. If not found → ask user which type applies
3. Apply universal rules + type-specific rules

### Types Overview

| Type | Use Case | Key Characteristic |
|:---|:---|:---|
| single_module | One function/component | Entire package = one module |
| layered_library | Component library, utils | Layers: api, ui, lib, model |
| fsd_standard | Frontend application | Layers: app, pages, [widgets], [features], [entities], shared |
| fsd_domain | Frontend with domains | FSD + domain grouping (user, payments) |
| server_fsd | Backend/CLI application | Layers: controllers, services, models |
| multi_app_monolith | Multiple apps in monorepo | Applications container + common |

### FSD Layers

Only `app` is mandatory. Add layers as project grows:

| Layer | When to add |
|:---|:---|
| app/ | MANDATORY: entry point, providers |
| pages/ | When you have routes |
| widgets/ | For complex page sections |
| features/ | For user interactions |
| entities/ | For business entities |
| shared/ | For cross-cutting code |

### Links to Detailed Rules

- [architecture-single-module.md](architecture-single-module.md)
- [architecture-layered-library.md](architecture-layered-library.md)
- [architecture-fsd-standard.md](architecture-fsd-standard.md)
- [architecture-fsd-domain.md](architecture-fsd-domain.md)
- [architecture-server-fsd.md](architecture-server-fsd.md)
- [architecture-multi-app-monolith.md](architecture-multi-app-monolith.md)

</architecture_types>

---

<xml_schema>

## XML Schema (Minimal)

### Common Tags

| Tag | Purpose | Required Attributes |
|:---|:---|:---|
| `<package_root>` | Root element | — |
| `<source_directory>` | Source folder | `name` |
| `<entrypoint>` | Entry file | `name` |
| `<layer>` | Semantic layer | `name`, `purpose` |
| `<module>` | Modular unit | `name` |
| `<facade>` | Module facade | `name`, `role` |
| `<file>` | Code file | `name`, `role` |
| `<test>` | Test file | `name`, `role` |

### Minimal Example

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />
    <layer name="features" purpose="user interactions">
      <module name="auth">
        <facade name="index.ts" role="slice_facade" />
        <file name="auth-form.tsx" role="component" />
        <file name="types.ts" role="types" />
      </module>
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<terminology>

## Terminology

| Term | Definition |
|:---|:---|
| **Modular Unit** | Isolated code block with public API and single responsibility |
| **Facade** | Entry point (index.ts) exposing public API, hiding internals |
| **Cohesion** | How related code is grouped together inside module |
| **Coupling** | Dependencies between modules (lower = better) |
| **Colocation** | Placing code next to where it's used |
| **Layer** | Vertical abstraction level with dependency rules |
| **Slice** | Horizontal module within a layer (FSD term) |
| **Segment** | Functional block inside slice: ui, model, lib |

</terminology>

---

<quick_reference>

## Quick Reference

### File Structure Rules

**One function per file** — each file contains one main function/component (exception: `helpers.ts` for small related helpers).

**Mandatory separation:**

- Types → `types.ts` (functions MUST NOT export types)
- Constants → `constants.ts` (functions MUST NOT export constants)
- Schemas → `schemas.ts` (Zod/validation schemas)

### Placement Table

| What | Simple structure | Complex structure |
|:---|:---|:---|
| TypeScript type | `types.ts` | `model/types/main.ts` |
| Zod schema | `schemas.ts` | `model/schemas/main.ts` |
| Constant | `constants.ts` | `model/constants/main.ts` |
| Pure function | `helpers.ts` | `lib/helpers/func/index.ts` |
| React hook | `hooks.ts` | `lib/hooks/hook-name/index.ts` |
| File operations | `file.ts` | `services/adapters/file/index.ts` |
| localStorage | `storage.ts` | `services/gateways/storage/index.ts` |
| Business logic | `process.ts` | `services/workflows/process/index.ts` |
| HTTP request | `endpoints.ts` | `api/endpoint/index.ts` |
| React component | `component.tsx` | `ui/component/index.tsx` |

**Note:** In `model` layer: `constants/`, `schemas/`, `types/` are container folders (NOT modular units). Actual modular units are `main.ts` files inside.

### Extraction to Shared

| Usage | Action |
|:---|:---|
| 1-2 modules | Keep in module |
| 3+ modules | ASK USER before extracting to shared |

**Never auto-extract.** Duplication is acceptable if it improves change speed.

### File Naming

- Files: `kebab-case.ts` (`validate-email.ts`)
- Components: `PascalCase.tsx` (`AuthForm.tsx`)
- Folders: `kebab-case/` (`auth-form/`)

### Import Rules

- Inside module: relative (`./types`)
- Between modules: absolute (`$features/auth`)
- Always through facade, never internal paths

</quick_reference>

---

<validation>

## Validation

To validate architecture:

1. Check `architecture.xml` in project root
2. Run: `mcp_mcp-validator_validate validationType="architecture"`
3. Target score: >=85

</validation>

---

<exception_handling>

## Exception Handling

- Ambiguous placement → ask user
- Circular dependency detected → suggest restructure
- God file found → suggest splitting into modular units
- Internal import found → suggest facade import

</exception_handling>
