---
id: architecture-single-module
type: reference
alwaysApply: false
---

# Single Module Architecture

<expert_role>

You are a software architect specializing in minimal TypeScript package design.

**Task:** Evaluate and enforce single module architecture patterns.

</expert_role>

---

<overview>

## Overview

**Purpose:** Entire package is one modular unit.

**Use Case:** Libraries, utilities, simple components, CLI tools.

**Key Characteristic:** Minimal structure, single entry point.

</overview>

---

<when_to_use>

## When to Use

| Condition | Single Module | Other |
|:---|:---|:---|
| Functions | 1-2 related functions | 3+ independent → layered_library |
| Files | <10 files | >10 → layered_library |
| Responsibility | Single clear task | Multiple tasks → layered_library |
| Dependencies | Minimal | Complex → fsd_standard |

</when_to_use>

---

<structure>

## Structure

### Minimal (1-3 files)

```
package-name/
├── src/
│   ├── index.ts        # facade + main function
│   ├── types.ts        # optional, if types are large
│   └── __tests__/
│       └── index.test.ts
├── package.json
└── tsconfig.json
```

### Standard (4-10 files)

```
package-name/
├── src/
│   ├── index.ts        # facade (re-exports only)
│   ├── main.ts         # main function
│   ├── types.ts        # types
│   ├── helpers.ts      # internal helpers
│   ├── constants.ts    # constants
│   └── __tests__/
│       ├── main.test.ts
│       └── helpers.test.ts
├── package.json
└── tsconfig.json
```

</structure>

---

<rules>

## Rules

### Facade

- `index.ts` is the only public entry point
- Re-exports main function and public types
- No logic in facade

```typescript
// src/index.ts – facade, only re-exports
export { validateEmail } from './validate-email';
export type { ValidationResult } from './types';
// Any initialization must be in a separate module
```

### Colocation

All code resides in `src/`:

- Types, helpers, constants — next to main function
- No nested folders except `__tests__/`; other nesting allowed only when >10 files
- Tests in `__tests__/` at same level

### When to Upgrade

Upgrade to `layered_library` when any condition is met:

- 3+ independent functions with separate responsibilities
- Functions are independent (don't share internal logic)
- Package grows beyond 10 files

</rules>

---

<xml_schema>

## XML Schema

```xml
<package_root>
  <source_directory name="src">
    <entrypoint name="index.ts" />
    <file name="validate-email.ts" role="function" />
    <file name="types.ts" role="types" />
    <test name="__tests__/validate-email.test.ts" role="unit_test" />
  </source_directory>
</package_root>
```

</xml_schema>

---

<examples>

## Examples

### Good: Utility Package

```
validate-email/
├── src/
│   ├── index.ts          # export { validateEmail }
│   ├── validate-email.ts # main function
│   ├── types.ts          # ValidationResult, etc.
│   └── __tests__/
│       └── validate-email.test.ts
```

### Bad: Scattered Structure

```
validate-email/
├── src/
│   ├── index.ts
│   ├── validate-email.ts
├── types/                 # ❌ types outside src
│   └── index.ts
├── __tests__/             # ❌ tests outside src
│   └── validate-email.test.ts
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

- Files outside src/ detected → move to src/
- No facade exists → create index.ts with re-exports
- Module grows beyond 10 files → suggest layered_library upgrade

</exception_handling>
