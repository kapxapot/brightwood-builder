# Brightwood Runtime Story State Spec

## Goal

Implement full state-aware story execution in `../brightwood` so runtime behavior matches the builder model in this repo.

The runtime must:

- read story state metadata (`data.init`, `data.conditions`, `data.effects`)
- apply node/action/link effects during execution
- evaluate action and redirect conditions from expressions
- support dynamic state keys and explicit key removal
- render story text and prefix with `{{...}}` interpolation against current state

## Source Of Truth

Target semantics should align with:

- `brightwood-builder/src/lib/story-state.ts`
- `brightwood-builder/src/lib/message-renderer.ts`
- `brightwood-builder/src/entities/story-data.ts`
- `brightwood-builder/src/schemas/story-data-schema.ts`
- `brightwood-builder/src/entities/story-node.ts`

Current runtime implementation to upgrade:

- `../brightwood/lib/story-engine.ts`
- `../brightwood/lib/message-renderer.ts`

## Current Runtime Gaps (in `../brightwood`)

- `StoryDataModel` supports only primitive `data.init` values.
- `data.conditions` and `data.effects` are ignored.
- `entryEffects`, `action.effects`, `link.effects` are not parsed or applied.
- action filtering does not use `action.condition`.
- redirect filtering uses only `Boolean(data[condition])` key lookup, not expressions.
- effect invocation shorthand and DSL statements are unsupported.
- no built-in `unset` behavior for removing keys.

## Data Contract To Support

### State value types

- Supported runtime value types: `string | number | boolean`
- No `null` state value type
- Missing key means "no value" (`undefined`)

### Story data

```ts
type StateValue = string | number | boolean;
type InitValue = StateValue | { ref: string };

type EffectDefinition = {
  name: string;
  args?: string | string[];
  conditions?: string | string[];
  statements: string | string[];
};

type StoryData = {
  init?: Record<string, InitValue>;
  conditions?: Record<string, string>;
  effects?: EffectDefinition[];
};
```

### Node/action/link metadata

- all node types may include `entryEffects`
- action entries may include `condition` and `effects`
- redirect links may include `condition` and `effects`

### Effect invocation format

Support both forms:

1. Object form: `{ "name": "hit", "args": [1] }`
2. Shorthand no-arg string: `"removeShoe"` or `"removeShoe()"`

Not supported in shorthand:

- `"hit(1)"` (must use object form)

## Expression And Effect DSL Semantics

### Conditions

`condition` can be either:

1. A named condition key from `data.conditions` (e.g. `"isAlive"`)
2. An expression (e.g. `"hp > 0 && hasShoes()"`)

Truthy/falsy behavior:

- bare boolean keys are valid conditions (`"met_theo"`)
- missing key is falsy
- `!weapon` works (`weapon` missing => `true`, non-zero => `false`)

### String literals

- only double-quoted strings are valid (`"julien"`)
- single quotes are invalid in expressions/statements

### Operators

- unary: `!`, unary `-`
- arithmetic: `+ - * / %`
- comparison: `> >= < <=`
- equality: `== !=` (strict value comparison semantics)
- logical: `&& ||`
- grouping: `(...)`

### Functions

- built-in numeric functions: `abs`, `ceil`, `floor`, `round`, `max`, `min`
- named conditions callable as zero-arg functions: `isAlive()`, `hasShoes()`
- condition calls with args are invalid

### Effect statements

Each statement is either:

- assignment: `key = expression`
- invocation: `effectName(arg1, arg2)`

Rules:

- assignment to missing key creates that key
- assignment to `undefined` is invalid
- key removal is explicit via built-in: `unset("key")`
- `unset` is reserved and cannot be user-defined in `data.effects`

## Runtime Execution Order

### Session start

1. Build initial state from `story.data.init`
2. Resolve `{ ref: "otherKey" }` references
3. Resolve `{{...}}` interpolation in string init values
4. Enter `startId`

### Entering any node

1. Apply `node.entryEffects` to state
2. Render node text lines with current state interpolation
3. Render prefix with current state interpolation (preserve existing placement behavior in UI)

### Action node

1. Evaluate each action condition in current state
2. Expose only available actions
3. On choice, append choice history entry
4. Apply selected action effects
5. Transition to action target

### Redirect node

1. Evaluate each link condition in current state
2. Keep eligible links only
3. Weighted random selection across eligible links
4. Apply selected link effects
5. Transition to selected link target

### Skip node

1. Transition to `nextId`

### Finish node

1. Mark session finished

## Error Handling Requirements

On runtime state errors (invalid expression, unknown effect, bad args, cycles, etc.):

- append a `system` history entry with clear message
- mark session finished
- avoid hard crash in React/UI

Preserve existing hard-stop safety:

- keep `MAX_AUTO_STEPS` protection

## Required File Changes In `../brightwood`

### 1) Add state engine module

Create `../brightwood/lib/story-state.ts` by porting/adapting:

- `brightwood-builder/src/lib/story-state.ts`

Export at least:

- `createInitialState`
- `renderStoryMessage`
- `renderStoryText`
- `renderStoryPrefix`
- `evaluateCondition`
- `applyEntryEffects`
- `getAvailableActions`
- `applyActionEffects`
- `getEligibleLinks`
- `resolveRedirectLink`
- `applyLinkEffects`

### 2) Extend message renderer utility

In `../brightwood/lib/message-renderer.ts` add:

- `extractMessageTemplateDependencies`

Use implementation from:

- `brightwood-builder/src/lib/message-renderer.ts`

This is required for deterministic init-string resolution order.

### 3) Upgrade `../brightwood/lib/story-engine.ts` types + normalization

- Expand `StoryDataModel` to include `conditions` and `effects`
- Expand node/action/link types to include `entryEffects`, `condition`, and `effects`
- Support effect invocation object + shorthand string forms
- Support `{ ref: "..." }` in `data.init`

### 4) Integrate state engine into runtime flow

Replace in-engine ad hoc logic (`linkSatisfied`, simple filtering, direct init copy) with `story-state` calls:

- `createStorySession` should call `createInitialState`
- node traversal should call `applyEntryEffects`
- action availability should use `getAvailableActions`
- action choice should call `applyActionEffects`
- redirect path should use `getEligibleLinks` + `resolveRedirectLink` + `applyLinkEffects`
- `getCurrentActions` should return filtered actions

### 5) Keep API compatibility

Preserve public signatures unless intentionally changed:

- `createStorySession`
- `continueStoryWithAction`
- `getCurrentActions`
- `isSessionWaitingForAction`

If testability is needed, add optional RNG injection with default `Math.random`.

## Compatibility Rules

- Existing stateless stories must continue to run unchanged.
- Existing simple key-style conditions must still work:
- `"condition": "met_theo"` evaluates by truthiness of `met_theo`.
- Stories authored in builder with new metadata must execute correctly without format transforms.

## Acceptance Criteria

1. `public/stories/wood-prototype.json` from builder runs in `../brightwood` with correct branching/state transitions.
2. `entryEffects`, `action.effects`, and `link.effects` all mutate session data correctly.
3. Action/link conditions evaluate expressions, not just key lookup.
4. `unset("key")` removes keys and missing keys behave as falsy in conditions.
5. Story text interpolation reflects current state during progression.
6. Invalid runtime state operations produce system history entries instead of crashing.

## Suggested Verification Scenarios

1. Boolean gate:
- start with `met_theo = false`
- action appears only after effect sets `met_theo = true`

2. Redirect mutation:
- redirect link applies effect (e.g. `day = day + 1`)
- next node text reflects updated value

3. Key removal:
- set `weapon = 1`, verify `!weapon` is false
- run `unset("weapon")`, verify `!weapon` becomes true

4. Shorthand invocation parsing:
- `"entryEffects": ["removeShoe", "nextDay()"]` works
- `"entryEffects": ["hit(1)"]` is rejected as invalid shorthand
