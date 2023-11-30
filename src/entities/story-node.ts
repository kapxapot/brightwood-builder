import type { ConditionName, EffectInvocation } from "./story-data";

type NodeId = number;

export type Text = string | string[];

export type Action = {
  id?: NodeId;
  label: string;
};

export type Link = {
  id?: NodeId;
  weight?: number;
  condition?: ConditionName;
};

export type OnChangeHandler = (data: StoryNode) => void;

type BaseStoryNode = {
  id: NodeId;
  label?: string | NodeId;
  position?: number[];
  effect?: EffectInvocation;
  isStart?: boolean;
  onChange?: OnChangeHandler;
}

type TextStoryNode = BaseStoryNode & {
  text: Text;
}

export type ActionStoryNode = TextStoryNode & {
  type: "action";
  actions: Action[];
};

export type SkipStoryNode = TextStoryNode & {
  type: "skip";
  nextId?: NodeId;
}

export type RedirectStoryNode = TextStoryNode & {
  type: "redirect";
  links: Link[];
};

export type FinishStoryNode = BaseStoryNode & {
  type: "finish";
  text?: Text;
};

export type StoryNode = ActionStoryNode | SkipStoryNode | RedirectStoryNode | FinishStoryNode;

export type StoryNodeType = StoryNode["type"];
