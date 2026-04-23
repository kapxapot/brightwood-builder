# Story State Support Plan

## Goal

Add first-class story state support so JSON stories can:

- store state at the story level
- check state when showing actions
- check state when resolving redirect branches
- change state when entering a node
- change state when choosing an action
- change state when a redirect branch is selected

This should let stories handle continuity cleanly, for example:

- `met_theo`
- `has_note`
- `opened_note`
- `promised_dawn`

## Agreed Naming

The model should use:

- `node.entryEffects`
- `action.condition`
- `action.effects`
- `link.condition`
- `link.effects`
- `story.data.init`

## Why This Matters

The current story format is mostly structural. It can connect nodes, but it cannot represent facts that persist across branches. That forces story authors to duplicate intro text, re-explain characters, or create unnatural transitions.

Real state support should make stories:

- more coherent across merged branches
- easier to author without repeated exposition
- easier to validate automatically
- ready for a proper player/runtime later

## Runtime Alignment

The actual Brightwood story renderer and player live in the neighboring `../brightwood` project.

State, interpolation, and execution semantics implemented in this builder should stay aligned with:

- `../brightwood/lib/story-engine.ts`
- `../brightwood/lib/message-renderer.ts`
- `../brightwood/components/story-player.tsx`

If the builder adds a format feature before the runtime supports it, that gap should be documented and tracked explicitly instead of becoming an accidental mismatch.

## Current Gaps

The repo already has some placeholders for state-like concepts, but they are incomplete:

- Type placeholders exist in `src/entities/story-data.ts` and `src/entities/story-node.ts`
- Zod schemas allow some state-shaped data
- Export/import already preserve some of those fields
- The published `stories/schema.json` does not officially support them
- The editor UI cannot properly author them
- Validation does not check them semantically
- There is no real runtime/evaluator in this repo yet

## Scope

### In Scope

- data model updates
- JSON schema updates
- editor authoring support
- validation support
- a pure state evaluator library
- fixtures and tests
- documentation updates

### Out of Scope for MVP

- conditional text lines inside one node
- a full visual debugger for state transitions
- complex scripting or unrestricted JavaScript execution

## Target Execution Semantics

### Action Nodes

1. Enter node
2. Apply `node.entryEffects`
3. Evaluate each action's `condition`
4. Show only actions whose condition passes
5. Player chooses an action
6. Apply chosen `action.effects`
7. Move to target node

### Redirect Nodes

1. Enter node
2. Apply `node.entryEffects`
3. Evaluate each link's `condition`
4. Filter out links whose condition fails
5. Choose randomly among remaining links using `weight`
6. Apply chosen `link.effects`
7. Move to target node

### Required Runtime Rules

- If all actions are filtered out, that is an invalid playable state
- If all redirect links are filtered out, that is an invalid playable state
- State changes must be deterministic except for the weighted redirect selection
- Random selection should accept an injected RNG for tests

## Recommended Implementation Phases

## Phase 1: Lock the Story State Spec

Decide and document the exact JSON shape before implementation.

### Decisions to lock

- whether `condition` is an inline expression or a named reference
- whether `effects` are inline operations or references to named reusable effects
- whether the existing placeholder `story.data.conditions` and `story.data.effects` survive in the final format
- whether `entryEffects`, `action.effects`, and `link.effects` should all use the same structure

### Recommendation

Prefer one consistent effect representation across nodes, actions, and links.

The evaluator should use a constrained DSL or structured operations. Do not use `eval`.

## Phase 2: Update Core Types and Schemas

### Files to update

- `src/entities/story-node.ts`
- `src/entities/story-data.ts`
- `src/schemas/story-node-schema.ts`
- `src/schemas/story-data-schema.ts`
- `src/schemas/story-schema.ts`
- `stories/schema.json`

### Required changes

- replace node `effect` with `entryEffects`
- add `condition` and `effects` to `Action`
- add `effects` to `Link`
- make story-level state official in the JSON schema
- align the public JSON schema with the internal Zod schemas

### Compatibility

- old stories with no state should still import and export unchanged
- if legacy placeholder fields remain, they should either be migrated or explicitly rejected with a clear error

## Phase 3: Build a Pure State Evaluator

Add a reusable module, for example:

- `src/lib/story-state.ts`

### Responsibilities

- create initial state from `story.data.init`
- evaluate conditions against current state
- apply effect lists to current state
- return visible actions for an action node
- return eligible redirect links for a redirect node
- resolve one redirect result from eligible weighted links

### Suggested API

- `createInitialState(storyData)`
- `applyEntryEffects(node, state)`
- `getAvailableActions(node, state)`
- `applyActionEffects(action, state)`
- `getEligibleLinks(node, state)`
- `resolveRedirect(node, state, rng)`
- `applyLinkEffects(link, state)`

### Design constraints

- pure functions where possible
- no direct React coupling
- easy to unit test
- deterministic behavior when RNG is injected

## Phase 4: Add Authoring UI

### Story-level UI

Update `src/components/nodes/story-info-node.tsx` so authors can edit:

- `prefix`
- initial state values
- any shared condition/effect definitions if those remain in the final spec

### Action UI

Update:

- `src/components/node-parts/node-action.tsx`
- `src/lib/action-mutations.ts`

So authors can edit:

- action label
- action target
- action condition
- action effects

### Redirect Link UI

Update:

- `src/components/node-parts/node-link.tsx`
- `src/lib/link-mutations.ts`

So authors can edit:

- link weight
- link target
- link condition
- link effects

### Node Effect UI

Update:

- `src/components/node-parts/node-effect.tsx`
- node renderers under `src/components/nodes/`

So authors can edit `entryEffects` instead of only seeing a read-only effect label.

## Phase 5: Add Validation

Extend `src/lib/validation.ts` to validate story state semantics, not just structure.

### Validation rules

- referenced condition/effect names exist, if named references are used
- state keys referenced in conditions/effects are valid
- effect arguments are valid
- action conditions are parseable
- link conditions are parseable
- `entryEffects` are parseable
- redirects cannot end up with zero eligible links in known static cases
- action nodes cannot end up with zero visible actions in known static cases

### Validation quality levels

- errors for malformed or impossible logic
- warnings for suspicious logic, such as contradictory conditions or dead gated paths

## Phase 6: Add Fixtures and Tests

### Tests to add

- state initialization
- action filtering by condition
- redirect filtering by condition
- weighted redirect resolution after filtering
- node `entryEffects`
- action effects
- link effects
- order of execution across node -> action/link -> next node

### Fixture stories

Add or promote fixtures that cover:

- a simple counter-based story
- a flag-based continuity story such as `met_theo`
- a redirect branch that mutates state
- an action that is hidden until a prior event happens

## Phase 7: Documentation and Author Guidance

Update:

- `stories/instructions.md`
- `stories/schema.json`
- any README sections that describe story format or importing/exporting

### Docs should explain

- how to define story state
- how conditions work
- how effects work
- execution order
- common patterns like introduction flags and inventory flags
- anti-patterns such as overusing state where a normal branch is simpler

## Phase 8: Migration Strategy

If the placeholder format is not identical to the final format, add a migration plan.

### Migration options

- one-time manual migration for prototype stories
- import-time compatibility transform
- explicit rejection with actionable error messages

### Stories to check

- `public/stories/test.json`
- `public/stories/wood-prototype.json`

## Suggested Delivery Order

1. Lock the final schema and semantics
2. Implement the pure evaluator library
3. Update types and schemas
4. Add validation based on evaluator semantics
5. Add editor UI for story state, actions, links, and entry effects
6. Add fixtures and tests
7. Update docs and migration notes

## Acceptance Criteria

This work is complete when:

- story JSON officially supports state in the public schema
- actions can be conditionally shown
- actions can change state
- redirect links can be conditionally selected
- redirect links can change state
- nodes can change state via `entryEffects`
- the editor can author all of the above
- validation catches common state mistakes
- old stateless stories still work
- at least one fixture proves a continuity case like `met_theo`

## Open Questions

- Should conditions be simple expressions, named references, or both?
- Should effects be structured operations, named invocations, or both?
- Should the editor offer a simple form UI first, with advanced raw JSON/expression editing later?
- Should the evaluator live only in this repo, or also be extracted for the eventual story player?

## Recommended First Slice

The smallest useful vertical slice is:

- official `story.data.init`
- `node.entryEffects`
- `action.condition`
- `action.effects`
- `link.condition`
- `link.effects`
- a pure evaluator
- validation for zero-visible-action and zero-eligible-link cases

That slice is enough to solve continuity issues like Theo and gives the format a real foundation.
