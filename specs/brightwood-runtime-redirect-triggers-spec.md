# Brightwood Runtime Redirect Triggers Spec

## Goal

Add support for story-level `redirectTriggers` in `../brightwood` so the runtime can automatically redirect to another node when a state condition becomes true.

This is meant to solve cases like Ember Crown death handling:

- HP can reach `0` from many different nodes and effects
- authors should not have to insert manual `isDead()` redirect nodes after every possible hit
- the runtime should detect the state change and redirect consistently

## Why This Exists

The builder now supports story-level redirect triggers in `story.data.redirectTriggers`.

That contract is already present in:

- `brightwood-builder/src/entities/story-data.ts`
- `brightwood-builder/src/schemas/story-data-schema.ts`
- `brightwood-builder/src/lib/story-state.ts`
- `brightwood-builder/src/lib/validation.ts`

The neighboring runtime in `../brightwood` does not yet know about this field, so stories that depend on redirect triggers will validate in the builder but behave incorrectly in the actual player.

## Scope

This spec is intentionally narrow.

In scope:

- parsing and normalizing `story.data.redirectTriggers`
- evaluating redirect triggers during runtime progression
- redirecting to a trigger target node when a trigger matches
- preserving trigger order as priority

Out of scope:

- general-purpose trigger actions
- arbitrary trigger-side effects
- `goto()` or any other control-flow effect DSL
- builder UI authoring changes inside `../brightwood`

## Story Format Contract

`redirectTriggers` live under `story.data`.

```ts
type RedirectTrigger = {
  condition: string;
  targetId: number;
};

type StoryDataModel = {
  init?: Record<string, StoryInitValue>;
  conditions?: Record<string, string>;
  effects?: StoryEffectDefinition[];
  redirectTriggers?: RedirectTrigger[];
};
```

Example:

```json
{
  "data": {
    "conditions": {
      "isDead": "hp <= 0"
    },
    "redirectTriggers": [
      {
        "condition": "isDead()",
        "targetId": 30
      }
    ]
  }
}
```

## Source Of Truth

Target runtime semantics should match the builder implementation in this repo:

- `src/entities/story-data.ts`
- `src/schemas/story-data-schema.ts`
- `src/lib/story-state.ts`
- `stories/ember-crown/story.json`

The runtime files to update:

- `../brightwood/lib/story-engine.ts`
- `../brightwood/lib/story-state.ts`

## Redirect Trigger Semantics

### Matching

- each trigger has a `condition` and a `targetId`
- conditions use the existing story-state condition semantics
- conditions may be:
  - a named condition from `data.conditions`
  - an inline expression
  - a direct state flag

Examples:

- `"isDead"`
- `"isDead()"`
- `"hp <= 0"`
- `"poisoned && hp < 3"`

### Priority

- triggers are evaluated in array order
- the first matching trigger wins
- later matching triggers are ignored for that checkpoint

### Behavior

When a trigger matches:

- runtime immediately redirects to `targetId`
- normal continuation for the current checkpoint is skipped
- execution continues from the target node through the normal traversal loop

This is a redirect, not an inline branch body.

The trigger itself does not:

- mutate state
- append a special history entry
- render its own message

Only the destination node contributes rendered content.

## Runtime Checkpoints

Redirect triggers must be checked after state has been updated for the current step and after the current node's message has been rendered.

This preserves the intended authoring model:

- "after every message render"
- "after all calculations performed on the state for that message"

### Required checkpoints

#### 1. After entering a node

Inside `advanceFromNode(...)`:

1. apply `node.entryEffects`
2. render the node text lines
3. append the node history entry if any
4. evaluate `redirectTriggers`
5. if one matches, set `currentNodeId = trigger.targetId` and continue the traversal loop

This must happen before normal node-type branching (`finish`, `action`, `skip`, `redirect`).

#### 2. After action effects

Inside `continueStoryWithAction(...)`:

1. resolve the chosen action
2. append the choice history entry
3. apply `action.effects`
4. evaluate `redirectTriggers`
5. if one matches, call `advanceFromNode(...)` using `trigger.targetId` instead of `action.id`
6. otherwise continue as today to `action.id`

This allows a state-changing action to immediately redirect into a death/end node or other forced destination.

#### 3. After redirect link effects

Inside redirect-node handling in `advanceFromNode(...)`:

1. resolve the eligible redirect link
2. apply `link.effects`
3. evaluate `redirectTriggers`
4. if one matches, continue with `trigger.targetId` instead of `link.id`
5. otherwise continue with `link.id`

This allows combat/damage redirects to immediately terminate into a death finish node.

## Finish Node Rule

Do not evaluate redirect triggers after deciding to finish on a `finish` node.

Practical rule:

- once the runtime reaches `if (node.type === "finish")`, the session ends normally
- no extra trigger pass runs after that point

This prevents finish-node loops or a finish node being overridden by another redirect trigger.

## Error Handling

If redirect trigger evaluation fails at runtime:

- append a `system` history entry
- mark the session finished
- avoid crashing the UI

Examples:

- invalid trigger expression
- unknown condition/function in a trigger condition
- trigger target node not found

Error format can follow existing state/runtime error patterns already used in `story-engine.ts`.

## Required Runtime Changes

### 1. Extend runtime data model

In `../brightwood/lib/story-engine.ts`:

- add `RedirectTrigger`
- extend `StoryDataModel` with `redirectTriggers?: RedirectTrigger[]`
- normalize `raw.data.redirectTriggers`

Recommended normalization rules:

- field must be an array
- each item must be an object
- `condition` must be a non-empty string after trimming
- `targetId` must be a finite number
- invalid entries should be discarded during normalization, consistent with other runtime normalization behavior

### 2. Add helper in runtime story state module

In `../brightwood/lib/story-state.ts` add:

- `findMatchingRedirectTrigger(storyData, state)`

Recommended signature:

```ts
export function findMatchingRedirectTrigger(
  storyData: StoryDataModel | undefined,
  state: StoryState,
): RedirectTrigger | undefined
```

Behavior:

- iterate through `storyData?.redirectTriggers ?? []`
- evaluate each trigger condition with existing `evaluateCondition(...)`
- return the first matching trigger
- return `undefined` if none match

### 3. Integrate trigger checkpoints into traversal

In `../brightwood/lib/story-engine.ts`:

- after node render inside `advanceFromNode(...)`
- after `applyActionEffects(...)` inside `continueStoryWithAction(...)`
- after `applyLinkEffects(...)` inside redirect resolution

The runtime should use `findMatchingRedirectTrigger(...)` instead of duplicating condition logic in the engine.

## Compatibility Rules

- stories without `redirectTriggers` must run unchanged
- existing manual `Wound Check` style redirect nodes must still work
- trigger-based stories and manually authored redirect nodes may coexist in the same story

If both exist:

- the runtime follows the normal current node flow
- whenever a trigger checkpoint is reached, the first matching trigger takes precedence over the normal next node for that checkpoint

## Ember Crown Example

The builder now contains:

```json
"redirectTriggers": [
  {
    "condition": "isDead()",
    "targetId": 30
  }
]
```

Where node `30` is the existing `Road Death` finish node.

Expected runtime result:

- any node/action/link effect that reduces HP to `0`
- followed by the next required trigger checkpoint
- redirects the session to node `30`
- and ends the story there

No per-combat manual death redirect node should be required for correctness.

## Acceptance Criteria

1. A story with `story.data.redirectTriggers` is normalized successfully in `../brightwood`.
2. A trigger using `condition: "isDead()"` redirects correctly after node entry effects reduce HP to `0`.
3. A trigger redirects correctly after action effects reduce HP to `0`.
4. A trigger redirects correctly after redirect-link effects reduce HP to `0`.
5. The first matching trigger wins when multiple triggers are true.
6. Finish nodes still end the session without post-finish trigger redirection.
7. Invalid trigger evaluation produces a `system` history entry instead of a crash.
8. Stories with no triggers behave exactly as before.

## Suggested Verification Scenarios

### 1. Entry effect death

- a node has `entryEffects: ["hit(5)"]`
- current HP is `5`
- node text renders
- runtime redirects to death finish node

### 2. Action-caused death

- an action has `effects: ["hit(2)"]`
- current HP is `2`
- player chooses the action
- runtime redirects to death finish node instead of the action target

### 3. Redirect-link-caused death

- a redirect link applies `effects: ["hit(3)"]`
- current HP is `3`
- runtime redirects to death finish node instead of the link target

### 4. Trigger priority

- trigger list contains:
  - `hp <= 0 -> 30`
  - `hp <= 2 -> 31`
- current HP is `0`
- runtime must redirect to `30`, not `31`

### 5. No-trigger compatibility

- a story with no `redirectTriggers`
- session progression remains unchanged from current runtime behavior
