type ValueName = string;
type Value = string | number | boolean;

type EffectName = string;
type EffectStatement = string;

export type ConditionName = string;
type ConditionStatement = string;

type Effect = {
  name: EffectName;
  args?: ValueName | ValueName[];
  conditions?: ConditionName | ConditionName[];
  statements?: EffectStatement | EffectStatement[];
};

export type StoryData = {
  init: Record<ValueName, Value>;
  effects?: Effect[];
  conditions?: Record<ConditionName, ConditionStatement>;
};

export type EffectInvocation = {
  name: EffectName;
  args: Value[];
}
