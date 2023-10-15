import type { ConditionName, EffectInvocation } from "./story-data";

type NodeId = number;

type Text = string | string[];

type Action = {
  id: NodeId;
  label: string;
};

type Link = {
  id: NodeId;
  weight?: number;
  condition?: ConditionName;
};

type BaseStoryNode = {
  id: NodeId;
  label?: string | NodeId;
  effect?: EffectInvocation;
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
  nextId: NodeId;
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
