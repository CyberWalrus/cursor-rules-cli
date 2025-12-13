---
id: architecture-layered-library
type: reference
alwaysApply: false
---

# Layered Library Architecture

<expert_role>

You are a software architect specializing in modular TypeScript library design.

**Task:** Evaluate and enforce layered library architecture patterns.

</expert_role>

---

<overview>

## Overview

**Purpose:** Multiple independent modular units grouped by purpose.

**Use Case:** Component libraries, shared utilities, SDK packages.

**Key Characteristic:** Layers organize modules by type (ui, lib, api, model).

</overview>

---

<when_to_use>

## When to Use

| Condition | Layered Library | Other |
|:---|:---|:---|
| Modules | 3-15 independent units | 1-2 → single_module |
| Organization | Thematic grouping | FSD layers → fsd_standard |
| Type | Library/SDK | Full app → fsd_standard |
| Dependencies | Minimal within layers | Complex cross-layer → fsd_standard |

</when_to_use>

---

<structure>

## Structure

```
package-name/
├── src/
│   ├── index.ts              # main facade
│   │
│   ├── ui/                   # UI components
│   │   ├── index.ts          # layer facade
│   │   ├── button/
│   │   │   ├── index.ts
│   │   │   ├── button.tsx
│   │   │   ├── types.ts
│   │   │   └── __tests__/
│   │   └── input/
│   │       └── ...
│   │
│   ├── lib/                  # Utilities and hooks
│   │   ├── index.ts
│   │   ├── hooks/
│   │   │   └── use-safe-back/
│   │   └── helpers/
│   │       └── format-date/
│   │
│   ├── api/                  # External integrations
│   │   ├── index.ts
│   │   └── ipify/
│   │
│   └── model/                # Shared types, constants, schemas
│       ├── types/
│       ├── constants/
│       └── schemas/
```

</structure>

---

<layers>

## Layers

| Layer | Purpose | Contains |
|:---|:---|:---|
| `ui/` | Visual components | React components, styles |
| `lib/` | Utilities | Hooks, helpers, formatters |
| `api/` | External services | API clients, integrations |
| `model/` | Data definitions | Types, constants, schemas |

Optional layers (add as needed):

- `config/` — App config, feature flags
- `assets/` — Icons, images, fonts

### Layer Dependencies

| Layer | Can import from |
|:---|:---|
| ui | lib, model, api |
| lib | model |
| api | model |
| model | nothing (leaf) |
| config | model (optional) |
| assets | nothing (optional) |

</layers>

---

<rules>

## Rules

### Colocation Within Modules

Each module contains its own:

- Types (`types.ts`)
- Helpers (`helpers.ts`)
- Constants (`constants.ts`)
- Tests (`__tests__/`)

```
button/
├── index.ts       # export { Button }
├── button.tsx     # component
├── types.ts       # ButtonProps, ButtonVariant
├── helpers.ts     # getButtonClasses
├── constants.ts   # BUTTON_SIZES
└── __tests__/
    └── button.test.tsx
```

### Shared Model Layer

Use `model/` only for truly shared definitions:

- Types used by 3+ modules
- Constants used across layers
- Schemas for validation

### Facade Hierarchy

1. **Package facade** (`src/index.ts`) — public API
2. **Layer facade** (`ui/index.ts`) — layer exports
3. **Module facade** (`button/index.ts`) — module exports

```typescript
// src/index.ts
export { Button, Input } from './ui';
export { useSafeBack, formatDate } from './lib';
export type { ButtonProps } from './ui';
```

</rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />

    <layer name="ui" purpose="components">
      <directory name="base">
        <module name="button">
          <facade name="index.ts" role="unit_facade" />
          <file name="button.tsx" role="component" />
          <file name="types.ts" role="types" />
        </module>
      </directory>
    </layer>

    <layer name="lib" purpose="utilities">
      <directory name="hooks">
        <module name="use-safe-back">
          <facade name="index.ts" role="unit_facade" />
          <file name="use-safe-back.ts" role="function" />
        </module>
      </directory>
    </layer>

    <layer name="model" purpose="definitions">
      <file name="types.ts" role="types" />
      <file name="constants.ts" role="constants" />
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<examples>

## Examples

### Good: Component with Colocated Code

```
ui/button/
├── index.ts          # export { Button }
├── button.tsx        # component
├── types.ts          # ButtonProps (ONLY for button)
├── button.module.css # styles
└── __tests__/
    └── button.test.tsx
```

### Bad: Scattered Button Code

```
ui/button/
├── index.ts
├── button.tsx
model/types/
├── button.ts         # types should be in ui/button/
lib/helpers/
├── button-helpers.ts # helpers should be in ui/button/
```

</examples>

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

- Types scattered across layers → move to module that uses them
- Cross-layer import detected → suggest extraction to lower layer
- God file detected → suggest splitting into modular units

</exception_handling>
