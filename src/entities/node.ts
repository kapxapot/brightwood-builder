import type { ConditionName, EffectInvocation } from "./data";

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

type BaseNode = {
  id: NodeId;
  label?: string | NodeId;
  effect?: EffectInvocation;
}

type TextNode = BaseNode & {
  text: Text;
}

type ActionNode = TextNode & {
  type: "action";
  actions: Action[];
};

type SkipNode = TextNode & {
  type: "skip";
  nextId: NodeId;
}

type RedirectNode = TextNode & {
  type: "redirect";
  links: Link[];
};

type FinishNode = BaseNode & {
  type: "finish";
  text?: Text;
};

export type Node = ActionNode | SkipNode | RedirectNode | FinishNode;

export type NodeType = Node["type"];

const node: Node = {
  type: "action",
  id: 1,
  label: "Start",
  text: [
    "line 1",
    "line 2"
  ],
  actions: [
    { id: 2, label: "Go to 2" },
    { id: 3, label: "Go to 3" }
  ]
};
