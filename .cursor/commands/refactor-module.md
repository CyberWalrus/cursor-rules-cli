---
id: refactor-module-workflow
type: command
---

# Refactor Module Command

You are a Module Refactoring Specialist. Your task is to perform deep analysis of a modular unit and create a comprehensive refactoring plan in Plan Mode.

**Operational context:** You work in Plan Mode. Before ANY action, read and internalize rules from `.cursor/docs/code-standards.md` and `.cursor/docs/architecture.md`.

## 1. Mandatory pre-analysis

**BLOCKING — Read ALL before proceeding:**

1. Read target module completely (ALL files in the module directory)
2. Read `.cursor/docs/code-standards.md` — extract critical rules
3. Read `.cursor/docs/architecture.md` — understand modular unit types
4. Read `architecture.xml` — determine project architecture type
5. Read `package-ai-docs.md` — extract tech stack and patterns

**Cognitive checkpoint (MANDATORY output before analysis):**

```
CONTEXT INTERNALIZED:
- Module type: [file-module / folder-module / slice with segments]
- Architecture: [single_module / layered_library / fsd_standard / fsd_domain / server_fsd]
- Layer: [shared / features / entities / pages / widgets / N/A]
- Tech stack: [from package-ai-docs.md]
- 5 critical rules that apply: [list from code-standards.md]
```

## 2. Architecture context analysis

**MANDATORY analysis (write explicit reasoning for each):**

**2.1. Architecture type detection:**

1. Read `architecture.xml`
2. Classify project: single_module / layered_library / fsd_standard / fsd_domain / server_fsd
3. Document architecture type explicitly in response

**2.2. Module location analysis:**

1. Identify layer (shared / features / entities / pages / widgets)
2. Check dependency direction — module MUST NOT import from higher layers
3. Verify module boundaries are clear

**2.3. Modular unit type:**

1. **File-module:** Single file = facade (no index.ts needed)
2. **Folder-module:** <6 files, index.ts contains function implementation
3. **Slice with segments:** features/entities with ui/model/lib folders

**Output requirement:** Write explicit reasoning for EACH point. Do NOT skip.

## 3. Structure analysis checklist

**For EACH rule, explicitly state: PASS / VIOLATION + evidence**

**3.1. Entity separation (CRITICAL - ZERO TOLERANCE):**

- Types ONLY in `types.ts` — functions MUST NOT export types
- Constants ONLY in `constants.ts` — functions MUST NOT export constants
- Schemas ONLY in `schemas.ts`

Check patterns:

- `export type` in function file = VIOLATION
- `export const VALUE` (non-function) in function file = VIOLATION
- `export interface` in function file = VIOLATION

**3.2. One file = one function (CRITICAL):**

- Each .ts file exports maximum 1 function
- Multiple `export function` in one file = VIOLATION
- Exception: helpers.ts <150 lines with logically related functions

**3.3. Single facade rule:**

- File-module: file IS the facade (no separate index.ts)
- Folder-module: ONE index.ts with function implementation (NOT re-exports)
- index.ts contains ONLY re-exports = VIOLATION (for folder-modules)

**3.4. File size limits:**

- Each file <150 lines
- Exceptions: tests, types.ts, constants.ts, schemas.ts, barrel files

**3.5. Colocation principle:**

- Code used in ONE place = located NEXT TO that place
- Helpers used by single function = same folder
- Types for single component = local types.ts (not global)

## 4. Code style consistency

**Check for deviations from project patterns:**

**4.1. Styling approach:**

1. Detect project pattern (check 3+ existing components):
   - Tailwind classes
   - CSS Modules (*.module.css/scss)
   - styled-components
   - inline styles
2. Verify module uses SAME approach
3. Deviation = VIOLATION (e.g., `style={{}}` when project uses Tailwind)

**4.2. Import patterns:**

1. Node.js imports MUST have `node:` prefix (`import { readFile } from 'node:fs'`)
2. Type imports MUST use `import type` syntax
3. Import order: Global CSS → External types → External modules → Internal → Relative → CSS modules
4. Check for violations in each file

**4.3. Naming conventions:**

| Element | Convention | Example |
|:---|:---|:---|
| Files | kebab-case | `validate-email.ts` |
| Components | PascalCase | `AuthForm.tsx` |
| Functions | camelCase + prefix | `getUserData`, `handleSubmit` |
| Types | PascalCase + suffix | `UserProps`, `AuthState` |
| Constants | SCREAMING_SNAKE | `MAX_RETRY_COUNT` |
| Hooks | use prefix | `useUserData` |

**4.4. TypeScript patterns:**

- Generics: G/T prefix (`GItem`, `TValue`, `GProps`)
- Utility types: `Pick<User, 'id'>`, `Omit<User, 'password'>` — NOT manual copying
- NO `any` type — use `unknown` with type guards
- NO `Function` type — use concrete signatures `(data: unknown) => void`
- NO `JSX.Element` — use `React.ReactNode` or `React.ReactElement`

**4.5. React patterns:**

- Return type: `React.ReactNode` (not JSX.Element)
- Props destructuring in function parameters: `function Comp({ name }: Props)`
- Custom hooks MUST start with `use` prefix
- Conditional: `if (!visible) return null;` NOT ternary `visible ? <div/> : null`

## 5. Code quality rules

**Verify compliance for each file:**

1. **Guard clauses:** No deep nesting (>2 levels), use early returns
2. **Array methods:** `filter`, `map`, `reduce` — NO for/while loops (exception: math algorithms)
3. **Explicit comparisons:** `value === null || value === undefined` NOT `!value`
4. **JSDoc:** Single-line Russian for EVERY exported function (`/** Валидирует email */`)
5. **Named exports:** `export { validateEmail }` — NO `export default` (exception: Storybook)
6. **No comments:** Inside function bodies (except `@ts-ignore`, `@ts-expect-error`, `eslint-disable`)

## 6. Generate refactoring plan

**Group findings by severity:**

**CRITICAL (must fix before any other work):**

- Entity separation violations (types/constants in function files)
- Multiple functions per file
- Style inconsistencies (Tailwind vs inline)
- Forbidden types (any, Function, JSX.Element)
- Missing facade or wrong facade type

**IMPORTANT (fix before merge):**

- File size violations (>150 lines)
- Missing JSDoc
- Import order issues
- Naming convention violations
- Node.js imports without `node:` prefix

**WARNING (improvement opportunities):**

- Colocation opportunities
- Code splitting candidates
- Test coverage gaps
- Potential abstractions

**Plan output format:**

```markdown
## Refactoring Plan for [module-name]

### Architecture Context
- Architecture type: [type]
- Layer: [layer]
- Modular unit type: [file-module/folder-module/slice]
- Dependency direction: [VALID / VIOLATION - details]

### CRITICAL Issues ([N] items)
1. [Issue description] → [Fix action] → [File: path]
2. ...

### IMPORTANT Issues ([N] items)
1. [Issue description] → [Fix action] → [File: path]
2. ...

### WARNING Issues ([N] items)
1. [Issue description] → [Fix action] → [File: path]
2. ...

### File Operations
- CREATE: [list new files with purpose]
- MODIFY: [list files with changes]
- DELETE: [list files to remove]
- MOVE: [list files to relocate]

### Execution Order
[SEQUENTIAL] Step 1: [action]
[SEQUENTIAL] Step 2: [action]
[PARALLEL] Steps 3-4: [actions]
...
```

## 7. AI documentation (MANDATORY)

**After refactoring plan, MANDATORY AI docs check:**

**7.1. Check module-ai-docs.md existence:**

- Expected location: `[module-path]/module-ai-docs.md`
- If NOT exists → ADD to plan: CREATE module-ai-docs.md

**7.2. If exists, verify sections are current:**

- `contract` section matches actual public API
- `dependencies` section lists actual imports
- `edge_cases` section reflects known issues

**7.3. Plan MUST include AI docs action:**

- CREATE: module-ai-docs.md missing
- UPDATE: API changed, dependencies changed, or edge cases discovered
- NO CHANGE: documentation is current

**Reference:** `.cursor/rules/ai-docs-workflow.mdc` for template and sections

## 8. Completion criteria

**Plan is complete ONLY when ALL criteria met:**

1. Cognitive checkpoint output present (Section 1)
2. All 3 architecture analysis points documented with reasoning (Section 2)
3. All 5 structure checklist items marked PASS/VIOLATION with evidence (Section 3)
4. All 5 code style checks performed (Section 4)
5. All 6 code quality rules verified (Section 5)
6. All findings grouped by severity (Section 6)
7. File operations list complete (Section 6)
8. Execution order defined with SEQUENTIAL/PARALLEL markers (Section 6)
9. AI docs action specified: CREATE/UPDATE/NO CHANGE (Section 7)

**Final output format:**

```
REFACTORING ANALYSIS COMPLETE

Module: [full path]
Architecture: [type] | Layer: [layer] | Unit type: [type]

Analysis Results:
- Structure checks: [N] PASS / [N] VIOLATION
- Style checks: [N] PASS / [N] VIOLATION
- Quality checks: [N] PASS / [N] VIOLATION

Issues Found:
- CRITICAL: [N] items
- IMPORTANT: [N] items
- WARNING: [N] items

AI Docs Action: [CREATE/UPDATE/NO CHANGE]

Plan ready for execution via create_plan tool.
```

## 9. Exception handling

**9.1. Module path invalid:**

- Ask user for correct path
- Do NOT proceed without valid module

**9.2. Architecture type unknown:**

- Check `architecture.xml` exists
- If missing, ask user to specify architecture type
- Default: assume `layered_library` if unclear

**9.3. Mixed patterns in project:**

- Document BOTH patterns found
- Recommend unification
- Ask user which pattern to follow

**9.4. Cannot determine styling approach:**

- Check at least 3 component files in project
- If still unclear, ask user explicitly
- Do NOT assume — deviations are CRITICAL violations

**9.5. Module has no public API:**

- Verify module is used somewhere
- If unused, recommend deletion
- If internal-only, document as such in AI docs
