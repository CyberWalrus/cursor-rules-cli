---
id: architecture-fsd-standard
type: reference
alwaysApply: false
---

# FSD Standard Architecture

<expert_role>

You are a frontend architecture consultant specializing in Feature-Sliced Design.

**Task:** Evaluate and enforce FSD architecture patterns for frontend applications.

</expert_role>

---

<overview>

## Overview

**Purpose:** Feature-Sliced Design for frontend applications.

**Use Case:** Complex React/Vue/Angular applications.

**Key Characteristic:** Layers with strict dependency direction, slices with segments.

</overview>

---

<when_to_use>

## When to Use

| Condition | FSD Standard | Other |
|:---|:---|:---|
| Complexity | Medium/high | Simple → single_module |
| Domains | No clear domains | Has domains → fsd_domain |
| Type | Frontend app | Server → server_fsd |
| Scale | Standard app | Multiple apps → multi_app_monolith |

</when_to_use>

---

<layers>

## Layers

### Mandatory Layer

Only `app/` is mandatory. Add other layers as project grows.

### Full Layer Hierarchy

```
src/
├── app/           # MANDATORY: entry, providers, global styles
├── pages/         # Route pages
├── widgets/       # Complex page sections
├── features/      # User interactions
├── entities/      # Business entities
└── shared/        # Cross-cutting code
```

### Layer Dependencies

| Layer | Can import from |
|:---|:---|
| app | everything below |
| pages | widgets, features, entities, shared |
| widgets | features, entities, shared |
| features | entities, shared |
| entities | shared only |
| shared | nothing (leaf layer) |

### Rules

- Import only from layers BELOW
- Never import from same-layer slices
- Always through slice facade

</layers>

---

<slice_structure>

## Slice Structure

### Segments

| Segment | Purpose |
|:---|:---|
| `ui/` | React components |
| `model/` | Store, types, business logic |
| `lib/` | Utilities for this slice |
| `api/` | API calls for this slice |

### Small Slice (flat)

```
features/auth/
├── index.ts        # facade
├── auth-form.tsx   # component
├── types.ts        # types
└── __tests__/
```

### Large Slice (with segments)

```
features/auth/
├── index.ts        # facade
├── ui/
│   ├── auth-form.tsx
│   ├── login-button.tsx
│   └── types.ts    # UI-specific types
├── model/
│   ├── auth-store.ts
│   ├── types.ts    # model types
│   └── constants.ts
├── lib/
│   └── validate-credentials.ts
└── __tests__/
```

### Colocation Rule

Types, helpers, constants belong to segment that uses them:

- UI types → `ui/types.ts`
- Store types → `model/types.ts`
- Shared across segments → slice root

</slice_structure>

---

<shared_layer>

## Shared Layer

### Structure

```
shared/
├── ui/             # Base components (Button, Input)
│   ├── button/
│   └── input/
├── lib/            # Utilities
│   ├── hooks/
│   │   └── use-debounce/
│   └── helpers/
│       └── format-date/
├── api/            # API client, base fetcher
│   └── base-fetcher/
└── config/         # App config
    └── env.ts
```

### Rules

- Only truly shared code (3+ usages)
- Each item is a modular unit with facade
- No god files (`shared/utils.ts` forbidden)
- Extraction requires confirmation

</shared_layer>

---

<import_rules>

## Import Rules

### Dependency Direction

```typescript
// ✅ CORRECT: feature imports from entity
import { UserCard } from '$entities/user';

// ❌ WRONG: entity imports from feature
import { AuthForm } from '$features/auth'; // FORBIDDEN
```

### Same-Layer Imports

```typescript
// ❌ WRONG: feature imports from feature
import { CartButton } from '$features/cart'; // FORBIDDEN

// ✅ CORRECT: extract to shared or duplicate
```

### Facade Only

```typescript
// ❌ WRONG: internal import
import { authReducer } from '$features/auth/model/store';

// ✅ CORRECT: facade import
import { authReducer } from '$features/auth';
```

### When to Add Layers

| Trigger | Add Layer |
|:---|:---|
| First route | `pages/` |
| Reusable page section | `widgets/` |
| User interaction logic | `features/` |
| Business entity with UI | `entities/` |
| Cross-cutting utility | `shared/` |

</import_rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="app/index.ts" />

    <layer name="pages" purpose="routes">
      <module name="home">
        <facade name="index.ts" role="slice_facade" />
        <segment name="ui" purpose="components">
          <file name="home-page.tsx" role="component" />
        </segment>
      </module>
    </layer>

    <layer name="features" purpose="interactions">
      <module name="auth">
        <facade name="index.ts" role="slice_facade" />
        <segment name="ui" purpose="components">
          <file name="auth-form.tsx" role="component" />
        </segment>
        <segment name="model" purpose="logic">
          <file name="auth-store.ts" role="function" />
          <file name="types.ts" role="types" />
        </segment>
      </module>
    </layer>

    <layer name="shared" purpose="cross-cutting">
      <directory name="ui">
        <module name="button">
          <facade name="index.ts" role="unit_facade" />
          <file name="button.tsx" role="component" />
        </module>
      </directory>
    </layer>
  </source_directory>
</package_root>
```

</xml_schema>

---

<examples>

## Examples

### Good: Feature with Segments

```
features/checkout/
├── index.ts              # export { CheckoutForm, checkoutStore }
├── ui/
│   ├── checkout-form.tsx
│   ├── payment-step.tsx
│   └── types.ts          # CheckoutFormProps
├── model/
│   ├── checkout-store.ts
│   ├── types.ts          # CheckoutState
│   └── constants.ts      # CHECKOUT_STEPS
└── __tests__/
```

### Bad: Scattered Feature Code

```
features/checkout/
├── checkout-form.tsx
model/types/
├── checkout.ts           # ❌ types outside feature
shared/lib/
├── checkout-helpers.ts   # ❌ helpers outside feature
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

- Cross-slice import detected → extract to shared or duplicate
- Upward import detected → restructure to lower layer
- Slice too large → split into segments
- Shared item used by 1-2 slices → move back to slice

</exception_handling>
