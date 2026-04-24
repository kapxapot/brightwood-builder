export type StateKey = string;
export type StateValue = string | number | boolean;
export type StateReference = {
  ref: StateKey;
};
export type InitValue = StateValue | StateReference;

export type EffectName = string;
export type EffectStatement = string;

export type ConditionName = string;
export type ConditionExpression = string;

export type EffectDefinition = {
  name: EffectName;
  args?: StateKey | StateKey[];
  conditions?: ConditionExpression | ConditionExpression[];
  statements: EffectStatement | EffectStatement[];
};

export type StoryData = {
  init?: Record<StateKey, InitValue>;
  effects?: EffectDefinition[];
  conditions?: Record<ConditionName, ConditionExpression>;
};

export type EffectInvocationObject = {
  name: EffectName;
  args?: StateValue[];
};

export type EffectInvocation = EffectInvocationObject | EffectStatement;
