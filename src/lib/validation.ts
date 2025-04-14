import { ActionStoryNode, FinishStoryNode, GraphNode, NodeId, RedirectStoryNode, SkipStoryNode, StoryInfoGraphNode, isEmptyText } from "@/entities/story-node";
import { NodeType, Translator } from "./types";
import { isEmpty } from "./common";

const addTextLine = "Add at least one text line.";

export type ValidationMessage = {
  nodeId: NodeId;
  message: string;
}

type IfMessage = [condition: boolean, message: string];

export function validateNodes(t: Translator, nodes: NodeType[]): ValidationMessage[] {
  return nodes.reduce(
    (prevMessages, node) => [...prevMessages, ...validateNode(t, node)],
    [] as ValidationMessage[]
  );
}

function validateNode(t: Translator, node: NodeType): ValidationMessage[] {
  const graphNode = node.data;
  const ifMessages = getNodeIfMessages(t, graphNode);

  return ifMessages
    .filter(ifMessage => ifMessage[0])
    .map(ifMessage => ({
      nodeId: graphNode.id,
      message: ifMessage[1]
    }));
}

function getNodeIfMessages(t: Translator, node: GraphNode): IfMessage[] {
  switch (node.type) {
    case "storyInfo":
      return storyInfoNodeIfMessages(t, node);

    case "action":
      return actionNodeIfMessages(t, node);

    case "redirect":
      return redirectNodeIfMessages(t, node);

    case "skip":
      return skipNodeIfMessages(t, node);

    case "finish":
      return finishNodeIfMessages(t, node);
  }
}

function storyInfoNodeIfMessages(t: Translator, node: StoryInfoGraphNode): IfMessage[] {
  return [
    [
      !node.title || node.title.trim().length === 0,
      t("Add the story title.")
    ],
    [
      !node.startId,
      t("Add the starting node.")
    ],
    [
      !node.language,
      t("Select the story language.")
    ]
  ];
}

function actionNodeIfMessages(t: Translator, node: ActionStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      isEmpty(node.actions),
      t("Add at least one action.")
    ],
    ...node.actions.map((action, index) => [
      !action.id,
      t(
        "Add a destination node for action \"[{{index}}]{{label}}\".",
        {
          index: index + 1,
          label: action.label ? ` ${action.label}` : ""
        }
      )
    ] as IfMessage)
  ];
}

function redirectNodeIfMessages(t: Translator, node: RedirectStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      isEmpty(node.links),
      t("Add at least one link.")
    ],
    ...node.links.map((link, index) => [
      !link.id,
      t(
        "Add a destination node for link \"[{{index}}]\".",
        { index: index + 1 }
      )
    ] as IfMessage)
  ];
}

function skipNodeIfMessages(t: Translator, node: SkipStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      !node.nextId,
      t("Add a destination node.")
    ]
  ];
}

function finishNodeIfMessages(t: Translator, node: FinishStoryNode): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ]
  ];
}
