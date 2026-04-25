import { toArray } from "@/lib/common";
import {
  extractMessageTemplateDependencies,
  renderMessage
} from "@/lib/message-renderer";
import type {
  ConditionExpression,
  EffectDefinition,
  EffectInvocation,
  InitValue,
  RedirectTrigger,
  StateKey,
  StateReference,
  StateValue,
  StoryData
} from "@/entities/story-data";
import type {
  Action,
  ActionStoryNode,
  Link,
  NodeId,
  RedirectStoryNode,
  StoryNode
} from "@/entities/story-node";

export type StoryState = Record<StateKey, StateValue>;
export type RngFn = () => number;
export type StoryText = string | string[];

export type StoryStateValidationIssue = {
  nodeId: NodeId;
  message: string;
};

type RuntimeValue = StateValue | undefined;
type Scope = Record<string, RuntimeValue>;

type Token =
  | { type: "number"; value: number }
  | { type: "string"; value: string }
  | { type: "boolean"; value: boolean }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: string }
  | { type: "equals" }
  | { type: "comma" }
  | { type: "paren"; value: "(" | ")" };

type ExpressionNode =
  | { type: "literal"; value: StateValue }
  | { type: "identifier"; name: string }
  | { type: "unary"; operator: "!" | "-"; operand: ExpressionNode }
  | {
      type: "binary";
      operator:
        | "||"
        | "&&"
        | "=="
        | "!="
        | ">"
        | ">="
        | "<"
        | "<="
        | "+"
        | "-"
        | "*"
        | "/"
        | "%";
      left: ExpressionNode;
      right: ExpressionNode;
    }
  | { type: "call"; name: string; args: ExpressionNode[] };

type StatementNode =
  | { type: "assign"; key: string; value: ExpressionNode }
  | { type: "invoke"; name: string; args: ExpressionNode[] };

type EffectInvocationValidationTarget =
  | { kind: "value"; value: StateValue }
  | { kind: "expression"; value: ExpressionNode };

type EvaluationContext = {
  state: StoryState;
  storyData?: StoryData;
  scope: Scope;
  conditionStack: string[];
  effectStack: string[];
};

const expressionCache = new Map<string, ExpressionNode>();
const statementCache = new Map<string, StatementNode>();
const builtInEffectNames = new Set(["unset"]);

const builtInFunctions = {
  abs: ([value]: RuntimeValue[]) => Math.abs(asNumber(value)),
  ceil: ([value]: RuntimeValue[]) => Math.ceil(asNumber(value)),
  floor: ([value]: RuntimeValue[]) => Math.floor(asNumber(value)),
  max: (values: RuntimeValue[]) => {
    if (!values.length) {
      throw new Error("max() requires at least one argument.");
    }

    return Math.max(...values.map(asNumber));
  },
  min: (values: RuntimeValue[]) => {
    if (!values.length) {
      throw new Error("min() requires at least one argument.");
    }

    return Math.min(...values.map(asNumber));
  },
  round: ([value]: RuntimeValue[]) => Math.round(asNumber(value)),
} satisfies Record<string, (args: RuntimeValue[]) => StateValue>;

export function createInitialState(storyData?: StoryData): StoryState {
  const initState = { ...(storyData?.init ?? {}) };
  const state: StoryState = {};
  const resolving = new Set<string>();
  const resolved = new Set<string>();
  const stateKeys = Object.keys(initState);

  const resolveKey = (key: string): StateValue => {
    if (!(key in initState)) {
      throw new Error(`Unknown initial state key "${key}".`);
    }

    if (resolved.has(key)) {
      return state[key];
    }

    if (resolving.has(key)) {
      throw new Error(`Circular initial state reference "${key}".`);
    }

    resolving.add(key);

    const value = initState[key];

    if (isStateReference(value)) {
      const reference = value.ref;

      if (reference === key) {
        throw new Error(`Circular initial state reference "${key}".`);
      }

      state[key] = resolveKey(reference);
    } else if (typeof value === "string") {
      const dependencies = extractMessageTemplateDependencies(value, stateKeys);

      for (const dependency of dependencies) {
        if (dependency === key) {
          throw new Error(`Circular initial state reference "${key}".`);
        }

        resolveKey(dependency);
      }

      state[key] = renderStoryMessage(value, state);
    } else {
      state[key] = value;
    }

    resolving.delete(key);
    resolved.add(key);

    return state[key];
  };

  for (const key of Object.keys(initState)) {
    resolveKey(key);
  }

  return state;
}

export function renderStoryMessage(
  text: string,
  state: StoryState,
  gender?: number
): string {
  return renderMessage(text, state, gender);
}

export function renderStoryText(
  text: StoryText,
  state: StoryState,
  gender?: number
): StoryText {
  return Array.isArray(text)
    ? text.map(line => renderStoryMessage(line, state, gender))
    : renderStoryMessage(text, state, gender);
}

export function renderStoryPrefix(
  prefix: string | undefined,
  state: StoryState,
  gender?: number
): string | undefined {
  return prefix
    ? renderStoryMessage(prefix, state, gender)
    : undefined;
}

export function evaluateCondition(
  condition: ConditionExpression | undefined,
  state: StoryState,
  storyData?: StoryData,
  scope: Scope = {}
): boolean {
  if (!condition?.trim()) {
    return true;
  }

  return evaluateConditionWithContext(condition, {
    state: { ...state },
    storyData,
    scope,
    conditionStack: [],
    effectStack: [],
  });
}

export function findMatchingRedirectTrigger(
  storyData: StoryData | undefined,
  state: StoryState
): RedirectTrigger | undefined {
  const redirectTriggers = storyData?.redirectTriggers ?? [];

  for (const redirectTrigger of redirectTriggers) {
    if (evaluateCondition(redirectTrigger.condition, state, storyData)) {
      return redirectTrigger;
    }
  }

  return undefined;
}

export function applyEntryEffects(
  node: StoryNode,
  state: StoryState,
  storyData?: StoryData
): StoryState {
  return applyEffectInvocations(node.entryEffects, state, storyData);
}

export function getAvailableActions(
  node: ActionStoryNode,
  state: StoryState,
  storyData?: StoryData
): Action[] {
  return node.actions.filter(action =>
    evaluateCondition(action.condition, state, storyData)
  );
}

export function applyActionEffects(
  action: Action,
  state: StoryState,
  storyData?: StoryData
): StoryState {
  return applyEffectInvocations(action.effects, state, storyData);
}

export function getEligibleLinks(
  node: RedirectStoryNode,
  state: StoryState,
  storyData?: StoryData
): Link[] {
  return node.links.filter(link =>
    evaluateCondition(link.condition, state, storyData)
  );
}

export function applyLinkEffects(
  link: Link,
  state: StoryState,
  storyData?: StoryData
): StoryState {
  return applyEffectInvocations(link.effects, state, storyData);
}

export function resolveRedirectLink(
  node: RedirectStoryNode,
  state: StoryState,
  storyData?: StoryData,
  rng: RngFn = Math.random
): Link {
  const eligibleLinks = getEligibleLinks(node, state, storyData);

  if (!eligibleLinks.length) {
    throw new Error(
      `Redirect node ${node.id} has no eligible links for the current story state.`
    );
  }

  const totalWeight = eligibleLinks.reduce((sum, link) => sum + link.weight, 0);

  if (totalWeight <= 0) {
    throw new Error(
      `Redirect node ${node.id} has no positive total weight across eligible links.`
    );
  }

  let roll = rng() * totalWeight;

  for (const link of eligibleLinks) {
    roll -= link.weight;

    if (roll <= 0) {
      return link;
    }
  }

  return eligibleLinks[eligibleLinks.length - 1];
}

export function applyEffectInvocations(
  effects: EffectInvocation[] | undefined,
  state: StoryState,
  storyData?: StoryData
): StoryState {
  if (!effects?.length) {
    return { ...state };
  }

  const nextState = { ...state };
  const context: EvaluationContext = {
    state: nextState,
    storyData,
    scope: {},
    conditionStack: [],
    effectStack: [],
  };

  for (const effect of effects) {
    applyEffectInvocation(effect, context);
  }

  return nextState;
}

export function validateStoryStateModel(
  storyData: StoryData | undefined,
  nodes: StoryNode[],
  storyInfoNodeId: NodeId
): StoryStateValidationIssue[] {
  const issues: StoryStateValidationIssue[] = [];
  const effectDefinitions = storyData?.effects ?? [];
  const effectNameCounts = new Map<string, number>();
  const nodeIds = new Set(nodes.map(node => node.id));

  const addIssue = (nodeId: NodeId, message: string) => {
    issues.push({ nodeId, message });
  };

  try {
    createInitialState(storyData);
  } catch (error) {
    addIssue(
      storyInfoNodeId,
      error instanceof Error ? error.message : "Failed to resolve initial story state."
    );
  }

  for (const effect of effectDefinitions) {
    effectNameCounts.set(effect.name, (effectNameCounts.get(effect.name) ?? 0) + 1);
  }

  for (const [effectName, count] of effectNameCounts) {
    if (count > 1) {
      addIssue(
        storyInfoNodeId,
        `Effect "${effectName}" is defined ${count} times. Effect names must be unique.`
      );
    }
  }

  for (const effect of effectDefinitions) {
    if (builtInEffectNames.has(effect.name)) {
      addIssue(
        storyInfoNodeId,
        `Effect "${effect.name}" is reserved as a built-in effect name and cannot be redefined.`
      );
    }
  }

  for (const [conditionName, expression] of Object.entries(storyData?.conditions ?? {})) {
    try {
      parseExpression(expression);
    } catch (error) {
      addIssue(
        storyInfoNodeId,
        formatError(
          error,
          `Condition "${conditionName}" has invalid expression "${expression}".`
        )
      );
    }
  }

  for (const effect of effectDefinitions) {
    for (const condition of toArray(effect.conditions)) {
      try {
        parseConditionReferenceOrExpression(condition, storyData);
      } catch (error) {
        addIssue(
          storyInfoNodeId,
          formatError(
            error,
            `Effect "${effect.name}" has invalid condition "${condition}".`
          )
        );
      }
    }

    for (const statement of toArray(effect.statements)) {
      try {
        parseStatement(statement);
      } catch (error) {
        addIssue(
          storyInfoNodeId,
          formatError(
            error,
            `Effect "${effect.name}" has invalid statement "${statement}".`
          )
        );
      }
    }
  }

  const validateEffectInvocations = (
    effectInvocations: EffectInvocation[] | undefined,
    nodeId: NodeId,
    location: string
  ) => {
    for (const effect of effectInvocations ?? []) {
      if (typeof effect === "string") {
        try {
          const statement = parseEffectInvocationStatement(effect);

          if (statement.type === "assign") {
            continue;
          }

          validateEffectInvocationTarget(
            statement.name,
            statement.args.length,
            location,
            statement.args[0]
              ? { kind: "expression", value: statement.args[0] }
              : undefined,
            storyData
          );
        } catch (error) {
          addIssue(
            nodeId,
            formatError(
              error,
              `${location} has invalid effect invocation "${effect}".`
            )
          );
        }

        continue;
      }

      const actualArgs = effect.args ?? [];
      try {
        validateEffectInvocationTarget(
          effect.name,
          actualArgs.length,
          location,
          actualArgs[0] !== undefined
            ? { kind: "value", value: actualArgs[0] }
            : undefined,
          storyData
        );
      } catch (error) {
        addIssue(
          nodeId,
          formatError(
            error,
            `${location} has invalid effect invocation "${effect.name}".`
          )
        );
      }
    }
  };

  const validateCondition = (
    condition: string | undefined,
    nodeId: NodeId,
    location: string
  ) => {
    if (!condition?.trim()) {
      return;
    }

    try {
      parseConditionReferenceOrExpression(condition, storyData);
    } catch (error) {
      addIssue(
        nodeId,
        formatError(error, `${location} has invalid condition "${condition}".`)
      );
    }
  };

  storyData?.redirectTriggers?.forEach((redirectTrigger, index) => {
    validateCondition(
      redirectTrigger.condition,
      storyInfoNodeId,
      `Redirect trigger [${index + 1}]`
    );

    if (!nodeIds.has(redirectTrigger.targetId)) {
      addIssue(
        storyInfoNodeId,
        `Redirect trigger [${index + 1}] references unknown target node ${redirectTrigger.targetId}.`
      );
    }
  });

  for (const node of nodes) {
    validateEffectInvocations(
      node.entryEffects,
      node.id,
      `Node ${node.id} entryEffects`
    );

    switch (node.type) {
      case "action":
        node.actions.forEach((action, index) => {
          validateCondition(
            action.condition,
            node.id,
            `Action [${index + 1}] "${action.label || "(unnamed)"}"`
          );
          validateEffectInvocations(
            action.effects,
            node.id,
            `Action [${index + 1}] "${action.label || "(unnamed)"}" effects`
          );
        });
        break;

      case "redirect":
        node.links.forEach((link, index) => {
          validateCondition(link.condition, node.id, `Redirect link [${index + 1}]`);
          validateEffectInvocations(
            link.effects,
            node.id,
            `Redirect link [${index + 1}] effects`
          );
        });
        break;
    }
  }

  return issues;
}

function validateEffectInvocationTarget(
  effectName: string,
  actualArgCount: number,
  location: string,
  firstArg?: EffectInvocationValidationTarget,
  storyData?: StoryData
) {
  if (builtInEffectNames.has(effectName)) {
    if (actualArgCount !== 1) {
      throw new Error(
        `${location} calls built-in effect "${effectName}" with ${actualArgCount} argument(s), but 1 is required.`
      );
    }

    if (firstArg?.kind === "value" && typeof firstArg.value !== "string") {
      throw new Error(
        `${location} calls built-in effect "${effectName}" with a non-string key argument.`
      );
    }

    if (
      firstArg?.kind === "expression" &&
      firstArg.value.type === "literal" &&
      typeof firstArg.value.value !== "string"
    ) {
      throw new Error(
        `${location} calls built-in effect "${effectName}" with a non-string literal key argument.`
      );
    }

    return;
  }

  const definition = findEffectDefinition(effectName, storyData);

  if (!definition) {
    throw new Error(`${location} references unknown effect "${effectName}".`);
  }

  const expectedArgs = toArray(definition.args);

  if (expectedArgs.length !== actualArgCount) {
    throw new Error(
      `${location} calls "${effectName}" with ${actualArgCount} argument(s), but ${expectedArgs.length} are required.`
    );
  }
}

function parseConditionReferenceOrExpression(
  condition: ConditionExpression,
  storyData?: StoryData
): ExpressionNode {
  const trimmedCondition = condition.trim();

  if (!trimmedCondition) {
    throw new Error("Condition must not be empty.");
  }

  const namedCondition = storyData?.conditions?.[trimmedCondition];
  return parseExpression(namedCondition ?? trimmedCondition);
}

function applyEffectInvocation(
  invocation: EffectInvocation,
  context: EvaluationContext
) {
  if (typeof invocation === "string") {
    executeStatement(parseEffectInvocationStatement(invocation), context);
    return;
  }

  applyNamedEffectInvocation(invocation.name, invocation.args ?? [], context);
}

function applyNamedEffectInvocation(
  name: string,
  args: StateValue[],
  context: EvaluationContext
) {
  if (applyBuiltInEffectInvocation(name, args, context)) {
    return;
  }

  const definition = findEffectDefinition(name, context.storyData);

  if (!definition) {
    throw new Error(`Unknown effect "${name}".`);
  }

  if (context.effectStack.includes(name)) {
    const cycle = [...context.effectStack, name].join(" -> ");
    throw new Error(`Cyclic effect invocation detected: ${cycle}.`);
  }

  const argNames = toArray(definition.args);
  const argValues = args;

  if (argNames.length !== argValues.length) {
    throw new Error(
      `Effect "${name}" expects ${argNames.length} argument(s), received ${argValues.length}.`
    );
  }

  const scope = Object.fromEntries(
    argNames.map((argName, index) => [argName, argValues[index]])
  ) as Scope;

  const scopedContext: EvaluationContext = {
    ...context,
    scope,
    effectStack: [...context.effectStack, name],
  };

  for (const condition of toArray(definition.conditions)) {
    if (!evaluateConditionWithContext(condition, scopedContext)) {
      return;
    }
  }

  for (const statement of toArray(definition.statements)) {
    executeStatement(parseStatement(statement), scopedContext);
  }
}

function executeStatement(statement: StatementNode, context: EvaluationContext) {
  switch (statement.type) {
    case "assign": {
      const value = evaluateExpression(statement.value, context);

      if (value === undefined) {
        throw new Error(
          `Cannot assign an undefined value to "${statement.key}". Use unset("...") to remove keys explicitly.`
        );
      }

      context.state[statement.key] = value;
      break;
    }

    case "invoke": {
      const evaluatedArgs = statement.args.map(arg => evaluateExpression(arg, context));

      if (applyBuiltInEffectInvocation(statement.name, evaluatedArgs, context)) {
        break;
      }

      applyNamedEffectInvocation(
        statement.name,
        evaluatedArgs.map((arg, index) =>
          toEffectInvocationArg(arg, statement.name, index)
        ),
        context
      );
      break;
    }
  }
}

function evaluateConditionWithContext(
  condition: ConditionExpression,
  context: EvaluationContext
): boolean {
  const trimmedCondition = condition.trim();

  if (!trimmedCondition) {
    return true;
  }

  if (context.storyData?.conditions?.[trimmedCondition]) {
    return evaluateNamedCondition(trimmedCondition, context);
  }

  return asBoolean(evaluateExpression(parseExpression(trimmedCondition), context));
}

function evaluateNamedCondition(
  conditionName: string,
  context: EvaluationContext
): boolean {
  const conditionExpression = context.storyData?.conditions?.[conditionName];

  if (!conditionExpression) {
    throw new Error(`Unknown condition "${conditionName}".`);
  }

  if (context.conditionStack.includes(conditionName)) {
    const cycle = [...context.conditionStack, conditionName].join(" -> ");
    throw new Error(`Cyclic condition reference detected: ${cycle}.`);
  }

  return asBoolean(
    evaluateExpression(parseExpression(conditionExpression), {
      ...context,
      conditionStack: [...context.conditionStack, conditionName],
    })
  );
}

function evaluateExpression(
  expression: ExpressionNode,
  context: EvaluationContext
): RuntimeValue {
  switch (expression.type) {
    case "literal":
      return expression.value;

    case "identifier":
      return resolveIdentifier(expression.name, context);

    case "unary": {
      const value = evaluateExpression(expression.operand, context);

      switch (expression.operator) {
        case "!":
          return !asBoolean(value);

        case "-":
          return -asNumber(value);
      }
    }

    case "binary": {
      const left = evaluateExpression(expression.left, context);
      const right = evaluateExpression(expression.right, context);

      switch (expression.operator) {
        case "||":
          return asBoolean(left) || asBoolean(right);

        case "&&":
          return asBoolean(left) && asBoolean(right);

        case "==":
          return left === right;

        case "!=":
          return left !== right;

        case ">":
          return asNumber(left) > asNumber(right);

        case ">=":
          return asNumber(left) >= asNumber(right);

        case "<":
          return asNumber(left) < asNumber(right);

        case "<=":
          return asNumber(left) <= asNumber(right);

        case "+":
          return typeof left === "string" || typeof right === "string"
            ? `${left}${right}`
            : asNumber(left) + asNumber(right);

        case "-":
          return asNumber(left) - asNumber(right);

        case "*":
          return asNumber(left) * asNumber(right);

        case "/":
          return asNumber(left) / asNumber(right);

        case "%":
          return asNumber(left) % asNumber(right);
      }
    }

    case "call": {
      const args = expression.args.map(arg => evaluateExpression(arg, context));

      if (expression.name in builtInFunctions) {
        return builtInFunctions[expression.name as keyof typeof builtInFunctions](args);
      }

      return evaluateNamedConditionCall(expression.name, args, context);
    }
  }
}

function evaluateNamedConditionCall(
  name: string,
  args: RuntimeValue[],
  context: EvaluationContext
): RuntimeValue {
  if (args.length > 0) {
    throw new Error(`Condition "${name}" does not accept arguments.`);
  }

  if (!context.storyData?.conditions?.[name]) {
    throw new Error(`Unknown function or condition "${name}".`);
  }

  return evaluateNamedCondition(name, context);
}

function resolveIdentifier(name: string, context: EvaluationContext): RuntimeValue {
  if (name in context.scope) {
    return context.scope[name];
  }

  if (name in context.state) {
    return context.state[name];
  }

  return undefined;
}

function findEffectDefinition(
  effectName: string,
  storyData?: StoryData
): EffectDefinition | undefined {
  return storyData?.effects?.find(effect => effect.name === effectName);
}

function isStateReference(value: InitValue): value is StateReference {
  return typeof value === "object" && value !== null && "ref" in value;
}

function parseExpression(input: string): ExpressionNode {
  const cachedExpression = expressionCache.get(input);

  if (cachedExpression) {
    return cachedExpression;
  }

  const parser = new ExpressionParser(tokenize(input));
  const expression = parser.parseExpression();
  parser.expectEnd();

  expressionCache.set(input, expression);

  return expression;
}

function parseStatement(input: string): StatementNode {
  const cachedStatement = statementCache.get(input);

  if (cachedStatement) {
    return cachedStatement;
  }

  const tokens = tokenize(input);

  if (
    tokens[0]?.type === "identifier" &&
    tokens[1]?.type === "equals"
  ) {
    const parser = new ExpressionParser(tokens, 2);
    const value = parser.parseExpression();
    parser.expectEnd();

    const statement: StatementNode = {
      type: "assign",
      key: tokens[0].value,
      value,
    };

    statementCache.set(input, statement);
    return statement;
  }

  const parser = new ExpressionParser(tokens);
  const expression = parser.parseExpression();
  parser.expectEnd();

  if (expression.type !== "call") {
    throw new Error("Effect statements must be assignments or effect invocations.");
  }

  const statement: StatementNode = {
    type: "invoke",
    name: expression.name,
    args: expression.args,
  };

  statementCache.set(input, statement);

  return statement;
}

function parseEffectInvocationStatement(input: string): StatementNode {
  const trimmedInput = input.trim();

  if (!trimmedInput) {
    throw new Error("Effect invocation must not be empty.");
  }

  const tokens = tokenize(trimmedInput);

  if (tokens.length === 1 && tokens[0]?.type === "identifier") {
    return {
      type: "invoke",
      name: tokens[0].value,
      args: [],
    };
  }

  return parseStatement(trimmedInput);
}

function applyBuiltInEffectInvocation(
  name: string,
  args: RuntimeValue[],
  context: EvaluationContext
): boolean {
  if (!builtInEffectNames.has(name)) {
    return false;
  }

  if (findEffectDefinition(name, context.storyData)) {
    throw new Error(
      `Effect "${name}" is reserved as a built-in effect name and cannot be redefined.`
    );
  }

  if (args.length !== 1) {
    throw new Error(`unset() expects exactly 1 argument, received ${args.length}.`);
  }

  const [key] = args;

  if (typeof key !== "string") {
    throw new Error("unset() expects a string key.");
  }

  delete context.state[key];
  return true;
}

function toEffectInvocationArg(
  value: RuntimeValue,
  effectName: string,
  index: number
): StateValue {
  if (value === undefined) {
    throw new Error(
      `Argument ${index + 1} for effect "${effectName}" resolved to an undefined value.`
    );
  }

  return value;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const current = input[index];

    if (/\s/.test(current)) {
      index += 1;
      continue;
    }

    const twoCharacterOperator = input.slice(index, index + 2);

    if (["&&", "||", "==", "!=", ">=", "<="].includes(twoCharacterOperator)) {
      tokens.push({ type: "operator", value: twoCharacterOperator });
      index += 2;
      continue;
    }

    if (current === "=") {
      tokens.push({ type: "equals" });
      index += 1;
      continue;
    }

    if (["+", "-", "*", "/", "%", "!", ">", "<"].includes(current)) {
      tokens.push({ type: "operator", value: current });
      index += 1;
      continue;
    }

    if (current === ",") {
      tokens.push({ type: "comma" });
      index += 1;
      continue;
    }

    if (current === "(" || current === ")") {
      tokens.push({ type: "paren", value: current });
      index += 1;
      continue;
    }

    if (current === "\"") {
      const { value, nextIndex } = readQuotedString(input, index);
      tokens.push({ type: "string", value });
      index = nextIndex;
      continue;
    }

    if (current === "'") {
      throw new Error(
        `Unexpected token "'" at position ${index}. String literals must use double quotes.`
      );
    }

    if (/[0-9]/.test(current)) {
      const numberMatch = input.slice(index).match(/^\d+(\.\d+)?/);

      if (!numberMatch) {
        throw new Error(`Invalid number at position ${index}.`);
      }

      tokens.push({ type: "number", value: Number(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }

    if (/[A-Za-z_]/.test(current)) {
      const identifierMatch = input.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);

      if (!identifierMatch) {
        throw new Error(`Invalid identifier at position ${index}.`);
      }

      const identifier = identifierMatch[0];

      if (identifier === "true" || identifier === "false") {
        tokens.push({ type: "boolean", value: identifier === "true" });
      } else {
        tokens.push({ type: "identifier", value: identifier });
      }

      index += identifier.length;
      continue;
    }

    throw new Error(`Unexpected token "${current}" at position ${index}.`);
  }

  return tokens;
}

function readQuotedString(
  input: string,
  startIndex: number
) {
  let value = "";
  let index = startIndex + 1;

  while (index < input.length) {
    const current = input[index];

    if (current === "\\") {
      const escaped = input[index + 1];

      if (escaped === undefined) {
        throw new Error("Unterminated string literal.");
      }

      switch (escaped) {
        case "n":
          value += "\n";
          break;
        case "r":
          value += "\r";
          break;
        case "t":
          value += "\t";
          break;
        default:
          value += escaped;
      }

      index += 2;
      continue;
    }

    if (current === "\"") {
      return {
        value,
        nextIndex: index + 1,
      };
    }

    value += current;
    index += 1;
  }

  throw new Error("Unterminated string literal.");
}

function asBoolean(value: RuntimeValue): boolean {
  return Boolean(value);
}

function asNumber(value: RuntimeValue): number {
  if (typeof value !== "number") {
    throw new Error(`Expected a number, received "${value}".`);
  }

  return value;
}

function formatError(error: unknown, fallbackMessage: string): string {
  if (error instanceof Error) {
    return `${fallbackMessage} ${error.message}`;
  }

  return fallbackMessage;
}

class ExpressionParser {
  private index: number;

  constructor(
    private readonly tokens: Token[],
    startIndex: number = 0
  ) {
    this.index = startIndex;
  }

  parseExpression(): ExpressionNode {
    return this.parseLogicalOr();
  }

  expectEnd() {
    if (this.peek()) {
      throw new Error("Unexpected token at the end of the expression.");
    }
  }

  private parseLogicalOr(): ExpressionNode {
    let expression = this.parseLogicalAnd();

    while (this.matchOperator("||")) {
      expression = {
        type: "binary",
        operator: "||",
        left: expression,
        right: this.parseLogicalAnd(),
      };
    }

    return expression;
  }

  private parseLogicalAnd(): ExpressionNode {
    let expression = this.parseEquality();

    while (this.matchOperator("&&")) {
      expression = {
        type: "binary",
        operator: "&&",
        left: expression,
        right: this.parseEquality(),
      };
    }

    return expression;
  }

  private parseEquality(): ExpressionNode {
    let expression = this.parseComparison();

    while (true) {
      if (this.matchOperator("==")) {
        expression = {
          type: "binary",
          operator: "==",
          left: expression,
          right: this.parseComparison(),
        };
        continue;
      }

      if (this.matchOperator("!=")) {
        expression = {
          type: "binary",
          operator: "!=",
          left: expression,
          right: this.parseComparison(),
        };
        continue;
      }

      return expression;
    }
  }

  private parseComparison(): ExpressionNode {
    let expression = this.parseAdditive();

    while (true) {
      if (this.matchOperator(">")) {
        expression = {
          type: "binary",
          operator: ">",
          left: expression,
          right: this.parseAdditive(),
        };
        continue;
      }

      if (this.matchOperator(">=")) {
        expression = {
          type: "binary",
          operator: ">=",
          left: expression,
          right: this.parseAdditive(),
        };
        continue;
      }

      if (this.matchOperator("<")) {
        expression = {
          type: "binary",
          operator: "<",
          left: expression,
          right: this.parseAdditive(),
        };
        continue;
      }

      if (this.matchOperator("<=")) {
        expression = {
          type: "binary",
          operator: "<=",
          left: expression,
          right: this.parseAdditive(),
        };
        continue;
      }

      return expression;
    }
  }

  private parseAdditive(): ExpressionNode {
    let expression = this.parseMultiplicative();

    while (true) {
      if (this.matchOperator("+")) {
        expression = {
          type: "binary",
          operator: "+",
          left: expression,
          right: this.parseMultiplicative(),
        };
        continue;
      }

      if (this.matchOperator("-")) {
        expression = {
          type: "binary",
          operator: "-",
          left: expression,
          right: this.parseMultiplicative(),
        };
        continue;
      }

      return expression;
    }
  }

  private parseMultiplicative(): ExpressionNode {
    let expression = this.parseUnary();

    while (true) {
      if (this.matchOperator("*")) {
        expression = {
          type: "binary",
          operator: "*",
          left: expression,
          right: this.parseUnary(),
        };
        continue;
      }

      if (this.matchOperator("/")) {
        expression = {
          type: "binary",
          operator: "/",
          left: expression,
          right: this.parseUnary(),
        };
        continue;
      }

      if (this.matchOperator("%")) {
        expression = {
          type: "binary",
          operator: "%",
          left: expression,
          right: this.parseUnary(),
        };
        continue;
      }

      return expression;
    }
  }

  private parseUnary(): ExpressionNode {
    if (this.matchOperator("!")) {
      return {
        type: "unary",
        operator: "!",
        operand: this.parseUnary(),
      };
    }

    if (this.matchOperator("-")) {
      return {
        type: "unary",
        operator: "-",
        operand: this.parseUnary(),
      };
    }

    return this.parsePrimary();
  }

  private parsePrimary(): ExpressionNode {
    const token = this.peek();

    if (!token) {
      throw new Error("Unexpected end of expression.");
    }

    switch (token.type) {
      case "number":
      case "string":
      case "boolean":
        this.index += 1;
        return {
          type: "literal",
          value: token.value,
        };

      case "identifier": {
        this.index += 1;

        if (this.matchParen("(")) {
          const args: ExpressionNode[] = [];

          if (!this.matchParen(")")) {
            do {
              args.push(this.parseExpression());
            } while (this.matchComma());

            this.expectParen(")");
          }

          return {
            type: "call",
            name: token.value,
            args,
          };
        }

        return {
          type: "identifier",
          name: token.value,
        };
      }

      case "paren":
        if (token.value === "(") {
          this.index += 1;

          const expression = this.parseExpression();
          this.expectParen(")");

          return expression;
        }

        break;
    }

    throw new Error("Unexpected token in expression.");
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private matchOperator(operator: string): boolean {
    const token = this.peek();

    if (token?.type === "operator" && token.value === operator) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private matchParen(parenthesis: "(" | ")"): boolean {
    const token = this.peek();

    if (token?.type === "paren" && token.value === parenthesis) {
      this.index += 1;
      return true;
    }

    return false;
  }

  private expectParen(parenthesis: "(" | ")") {
    if (!this.matchParen(parenthesis)) {
      throw new Error(`Expected "${parenthesis}".`);
    }
  }

  private matchComma(): boolean {
    const token = this.peek();

    if (token?.type === "comma") {
      this.index += 1;
      return true;
    }

    return false;
  }
}
