import { ActionStoryNode, FinishStoryNode, GraphNode, NodeId, RedirectStoryNode, SkipStoryNode, StoryInfoGraphNode, isEmptyText } from "@/entities/story-node";
import { NodeType } from "./types";
import { isEmpty } from "./common";

export type ValidationMessage = {
  nodeId: NodeId;
  message: string;
}

type IfMessage = [condition: boolean, message: string];

export function validateNodes(nodes: NodeType[]): ValidationMessage[] {
  return nodes.reduce(
    (prevMessages, node) => [...prevMessages, ...validateNode(node)],
    [] as ValidationMessage[]
  );
}

function validateNode(node: NodeType): ValidationMessage[] {
  const graphNode = node.data;
  const ifMessages = getNodeIfMessages(graphNode);

  return ifMessages
    .filter(ifMessage => ifMessage[0])
    .map(ifMessage => ({
      nodeId: graphNode.id,
      message: ifMessage[1]
    }));
}

function getNodeIfMessages(node: GraphNode): IfMessage[] {
  switch (node.type) {
    case "storyInfo":
      return storyInfoNodeIfMessages(node);

    case "action":
      return actionNodeIfMessages(node);

    case "redirect":
      return redirectNodeIfMessages(node);

    case "skip":
      return skipNodeIfMessages(node);

    case "finish":
      return finishNodeIfMessages(node);
  }
}

function storyInfoNodeIfMessages(node: StoryInfoGraphNode): IfMessage[] {
  return [
    [
      !node.title || node.title.trim().length === 0,
      "Add the story title."
    ],
    [
      !node.startId,
      "Add a starting node."
    ]
  ];
}

function actionNodeIfMessages(node: ActionStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      "Add at least one text line."
    ],
    [
      isEmpty(node.actions),
      "Add at least one action."
    ],
    ...node.actions.map((action, index) => [
      !action.id,
      `Add a destination node for action "[${index + 1}]${action.label ? ` ${action.label}` : ""}".`
    ] as IfMessage)
  ];
}

function redirectNodeIfMessages(node: RedirectStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      "Add at least one text line."
    ],
    [
      isEmpty(node.links),
      "Add at least one link."
    ],
    ...node.links.map((link, index) => [
      !link.id,
      `Add a destination node for link "[${index + 1}]".`
    ] as IfMessage)
  ];
}

function skipNodeIfMessages(node: SkipStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      "Add at least one text line."
    ],
    [
      !node.nextId,
      `Add a destination node.`
    ]
  ];
}

function finishNodeIfMessages(node: FinishStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      "Add at least one text line."
    ]
  ];
}
