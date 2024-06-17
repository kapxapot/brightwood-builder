import { toArray } from "@/lib/common";
import type { ConditionName, EffectInvocation } from "./story-data";

export type NodeId = number;
export type Text = string | string[];

export const isEmptyText = (text: Text) => toArray(text).join().length === 0;

export type Action = {
  id?: NodeId;
  label: string;
};

export type Link = {
  id?: NodeId;
  weight: number;
  condition?: ConditionName;
};

export type NodeEvent = {
  type: "handleRemoved",
  handle: string
};

export type OnChangeHandler = (data: GraphNode, event?: NodeEvent) => void;

type BaseGraphNode = {
  id: NodeId;
  position?: number[];
  onChange?: OnChangeHandler;
};

type BaseStoryNode = BaseGraphNode & {
  label?: string | NodeId;
  effect?: EffectInvocation;
};

type TextStoryNode = BaseStoryNode & {
  text: Text;
};

export type ActionStoryNode = TextStoryNode & {
  type: "action";
  actions: Action[];
};

export type SkipStoryNode = TextStoryNode & {
  type: "skip";
  nextId?: NodeId;
};

export type RedirectStoryNode = TextStoryNode & {
  type: "redirect";
  links: Link[];
};

export type FinishStoryNode = BaseStoryNode & {
  type: "finish";
  text?: Text;
};

export type StoryInfoGraphNode = BaseGraphNode & {
  id: NodeId;
  uuid: string;
  type: "storyInfo";
  position?: number[];
  title?: string;
  description?: string;
  startId?: NodeId;
  onChange?: OnChangeHandler;
};

export type StoryNode = ActionStoryNode
  | SkipStoryNode
  | RedirectStoryNode
  | FinishStoryNode;

export type GraphNode = StoryNode | StoryInfoGraphNode;

export type StoryNodeType = StoryNode["type"];
export type GraphNodeType = GraphNode["type"];
