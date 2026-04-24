# Brightwood Runtime Effect Syntax Alignment Spec

## Goal

Align the `../brightwood` story runtime with the current builder story format so runtime execution accepts the newer state and effect syntax already used in builder-authored stories.

This spec is specifically about:

- direct state-key usage in conditions
- camelCase state naming as the story-format convention
- expanded effect invocation syntax in `entryEffects`, `action.effects`, and `link.effects`
- removing the runtime mismatch where `../brightwood` still rejects valid builder effect strings

## Why This Exists

The builder now supports effect entries written as:

- `effectName`
- `effectName()`
- `effectName(1, false, "test")`
- `{ "name": "hit", "args": [1] }`
- `reunionStyle = 1`

The neighboring runtime in `../brightwood` still normalizes effects using the older rules and rejects some of these valid forms before execution.

That mismatch means a story can be valid in the builder but fail in the actual player.

## Source Of Truth

Target behavior should match the builder implementation in this repo:

- `src/lib/story-state.ts`
- `src/entities/story-data.ts`
- `src/schemas/story-data-schema.ts`
- `stories/instructions.md`

The runtime to align:

- `../brightwood/lib/story-engine.ts`
- `../brightwood/lib/story-state.ts`

## Current Runtime Gap

At the time of writing:

- `../brightwood/lib/story-engine.ts` accepts only `effectName` and `effectName()` as string shorthand.
- It explicitly rejects `effectName(1)` and marks it invalid.
- It also rejects assignment-style effect entries like `reunionStyle = 1`.
- `../brightwood/lib/story-state.ts` still expects normalized effect invocations in the old object-like shape and throws when normalization marked an entry invalid.

Conditions are in a better place already:

- inline expressions already work
- bare boolean state reads like `hasConfessionLetter` already work as conditions

So the main runtime mismatch is effect parsing and effect invocation typing, not condition evaluation.

## Story Format Contract

### State Keys

State keys must use camelCase.

Examples:

- `hasConfessionLetter`
- `reunionStyle`
- `learnedHistory`

Snake case should not be used in story state:

- `has_confession_letter`
- `reunion_style`

Notes:

- this is a story-format and authoring convention
- the runtime must treat identifiers case-sensitively
- the runtime must not auto-convert between snake case and camelCase

Optional validation for camelCase naming can be added later, but this spec does not require runtime key rewriting.

### Conditions

Node, action, and redirect `condition` fields may use:

- a named condition from `data.conditions`
- a direct inline expression
- a bare state flag

Examples:

- `hasConfessionLetter`
- `!hasConfessionLetter`
- `futureChoice == 2 && courage > 1`

There is no requirement to create a named condition wrapper just to read a boolean state key.

This is valid and preferred:

```json
{
  "label": "Hide letter",
  "condition": "hasConfessionLetter",
  "id": 101
}
```

This extra indirection is unnecessary for simple flags:

```json
{
  "conditions": {
    "hasConfessionLetter": "hasConfessionLetter"
  }
}
```

## Supported Effect Invocation Forms

In `entryEffects`, `action.effects`, and `link.effects`, the runtime must support all of the following:

### 1. Bare no-arg effect name

```json
"ringBell"
```

### 2. Explicit no-arg effect call

```json
"ringBell()"
```

### 3. Function-style effect call with arguments

```json
"hit(1, false, \"test\")"
```

### 4. Object form

```json
{ "name": "hit", "args": [1] }
```

This form remains supported for future cases where object-based arguments are more practical.

### 5. Direct assignment statement

```json
"reunionStyle = 1"
```

This is the preferred replacement for boilerplate setter effects when the assigned value is fixed and known at authoring time.

## Parsing Order For Effect Entries

When the runtime receives an effect entry, it must resolve it in this order:

1. If the entry is an object with `name` and optional `args`, treat it as object-form effect invocation.
2. If the entry is a string containing only a bare identifier, treat it as a no-arg effect invocation.
3. If the entry is a string that parses as a function call, treat it as an effect invocation with zero or more arguments.
4. If the entry is a string that parses as a valid statement, execute it as a statement.

For this feature set, the valid statement form that matters is assignment:

- `reunionStyle = 1`
- `hasConfessionLetter = true`
- `topicFocus = 2`

If the string cannot be parsed by any of the above rules, the runtime must throw a clear validation or execution error.

## Semantics

### Bare Identifier In Effect Arrays

A bare identifier inside an effect array means "invoke this effect with zero arguments."

Example:

```json
"openWindow"
```

This is not a generic expression. In effect arrays, it is always treated as a no-arg invocation.

### Function Calls In Effect Arrays

Function-style effect calls in effect arrays must support primitive literal arguments:

- strings
- numbers
- booleans

Expressions inside arguments should follow the same expression rules already supported by the runtime parser.

Examples:

- `hit(1)`
- `setMood("warm")`
- `choosePath(score + 1, hasLetter)`

### Assignment In Effect Arrays

Assignments in effect arrays directly mutate story state.

Examples:

- `reunionStyle = 1`
- `hasConfessionLetter = true`
- `noteChoice = choice + 1`

Rules:

- assigning `undefined` is invalid
- use `unset("key")` to remove a state key
- assignment keys are written exactly as authored

### Built-In Effects

`unset` remains a reserved built-in effect name.

Examples:

- `unset("hasConfessionLetter")`
- `unset("temporaryFlag")`

The runtime must continue rejecting story-defined effect declarations named `unset`.

## Required Runtime Changes

### `../brightwood/lib/story-engine.ts`

Required changes:

- stop narrowing string effect entries to the old no-arg-only shorthand
- stop emitting `invalidReason` for valid function-call shorthand with arguments
- stop rejecting assignment-style strings
- update effect invocation typing so effect entries can remain strings or objects through normalization

Recommended shape:

```ts
type StoryEffectInvocation =
  | string
  | {
      name: string;
      args?: StoryPrimitive[];
    };
```

Recommended normalization behavior:

- trim string values
- reject empty strings
- preserve non-empty string entries as strings
- keep validating object-form `args` as primitive arrays

The important part is that valid string entries must survive normalization and reach the evaluator unchanged.

### `../brightwood/lib/story-state.ts`

Required changes:

- accept effect entries as `string | object`
- if the effect entry is a string, route it through the statement/invocation parser
- if the effect entry is object-form, keep current named-effect invocation behavior

This should mirror the builder behavior:

- strings are executed through the existing statement parser
- object invocations still work exactly as before

The runtime already has most of the needed statement machinery. The gap is mainly in the effect invocation entry point and the old type assumptions.

## Non-Goals

This spec does not require:

- adding non-primitive object values to story state
- adding new operator types
- rewriting named conditions
- auto-migrating old snake_case stories
- changing text interpolation semantics
- changing `message-renderer.ts` unless a type dependency requires it
- changing `components/story-player.tsx` unless a type dependency requires it

## Compatibility

Existing stories must keep working.

The following older forms remain valid:

- `effectName`
- `effectName()`
- `{ "name": "effectName", "args": [1] }`

This is a backward-compatible expansion of accepted syntax, not a replacement of the old one.

## Example

```json
{
  "data": {
    "init": {
      "hasConfessionLetter": false,
      "reunionStyle": 0
    }
  },
  "nodes": [
    {
      "id": 1,
      "type": "action",
      "text": ["The letter is still warm in your hand."],
      "entryEffects": ["hasConfessionLetter = true"],
      "actions": [
        {
          "id": 10,
          "label": "Hide letter",
          "condition": "hasConfessionLetter",
          "effects": ["reunionStyle = 2"],
          "nextId": 2
        },
        {
          "id": 11,
          "label": "Speak",
          "effects": ["advanceScene(1)"],
          "nextId": 3
        }
      ]
    }
  ]
}
```

## Acceptance Criteria

- A story using `condition: "hasConfessionLetter"` works without defining a named condition alias.
- A story using `entryEffects: ["reunionStyle = 1"]` applies state correctly in `../brightwood`.
- A story using `effects: ["advanceScene(1, false, \"dawn\")"]` executes successfully in `../brightwood`.
- A story using object-form effects continues to work unchanged.
- A story using `unset("temporaryFlag")` continues to work unchanged.
- A malformed effect string still fails with a clear error.
- No runtime path attempts to auto-convert snake_case keys into camelCase.
- Valid builder-authored Bellarose-style stories can be loaded by `../brightwood` without effect-syntax rejection.

## Implementation Note

The safest alignment path is to make `../brightwood` preserve string effect entries through normalization and let `story-state.ts` execute them, rather than trying to fully parse every effect string inside `story-engine.ts`.

That keeps the parsing rules in one place and reduces the chance of the builder and runtime drifting again.
