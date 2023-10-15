type ValueName = string;
type Value = string | number | boolean;

type EffectName = string;
type EffectBody = string;

export type ConditionName = string;
type ConditionBody = string;

export type StoryData = {
  init: Record<ValueName, Value>;
  effects?: Record<EffectName, EffectBody>;
  conditions?: Record<ConditionName, ConditionBody>;
};

export type EffectInvocation = EffectName | {
  effect: EffectName;
  args: Value[];
}
