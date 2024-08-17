import { toArray } from "@/lib/common";
import type { ConditionName, EffectInvocation, StoryData } from "./story-data";

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
  text: Text;
  effect?: EffectInvocation;
};

export type ActionStoryNode = BaseStoryNode & {
  type: "action";
  actions: Action[];
};

export type SkipStoryNode = BaseStoryNode & {
  type: "skip";
  nextId?: NodeId;
};

export type RedirectStoryNode = BaseStoryNode & {
  type: "redirect";
  links: Link[];
};

export type FinishStoryNode = BaseStoryNode & {
  type: "finish";
};

export type StoryInfoGraphNode = BaseGraphNode & {
  type: "storyInfo";
  uuid: string;
  position?: number[];
  title?: string;
  description?: string;
  language?: string;
  startId?: NodeId;
  prefix?: string;
  data?: StoryData;
  onChange?: OnChangeHandler;
};

export type StoryNode = ActionStoryNode
  | SkipStoryNode
  | RedirectStoryNode
  | FinishStoryNode;

export type GraphNode = StoryNode | StoryInfoGraphNode;

export type StoryNodeType = StoryNode["type"];
export type GraphNodeType = GraphNode["type"];
