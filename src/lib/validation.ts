import { ActionStoryNode, FinishStoryNode, GraphNode, NodeId, RedirectStoryNode, SkipStoryNode, StoryInfoGraphNode, isEmptyText } from "@/entities/story-node";
import { NodeType, Translator } from "./types";
import { isEmpty } from "./common";

const addTextLine = "Add at least one text line.";

export type ValidationMessage = {
  nodeId: NodeId;
  message: string;
};

type IfMessage = [condition: boolean, message: string];

type Context = {
  nodeIds: Set<number>;
  references: Set<number>;
};

export function validateNodes(t: Translator, nodes: NodeType[]): ValidationMessage[] {
  const graphNodes = nodes.map(node => node.data);
  const context = buildContext(graphNodes);

  return graphNodes.reduce(
    (prevMessages, node) => [...prevMessages, ...validateNode(t, node, context)],
    [] as ValidationMessage[]
  );
}

function buildContext(nodes: GraphNode[]): Context {
  const nodeIds = new Set<number>();
  const references = new Set<number>();

  for (const node of nodes) {
    nodeIds.add(node.id);

    switch (node.type) {
      case "storyInfo":
        if (node.startId) {
          references.add(node.startId);
        }

        break;

      case "action":
        node.actions.forEach(action => {
          if (action.id) {
            references.add(action.id);
          }
        });

        break;

      case "redirect":
        node.links.forEach(link => {
          if (link.id) {
            references.add(link.id);
          }
        });

        break;

      case "skip":
        if (node.nextId) {
          references.add(node.nextId);
        }

        break;
    }
  }

  return { nodeIds, references };
}

function validateNode(t: Translator, node: GraphNode, context: Context): ValidationMessage[] {
  const ifMessages = getNodeIfMessages(t, node, context);

  return ifMessages
    .filter(ifMessage => ifMessage[0])
    .map(ifMessage => ({
      nodeId: node.id,
      message: ifMessage[1]
    }));
}

function getNodeIfMessages(t: Translator, node: GraphNode, context: Context): IfMessage[] {
  switch (node.type) {
    case "storyInfo":
      return storyInfoNodeIfMessages(t, node, context);

    case "action":
      return actionNodeIfMessages(t, node, context);

    case "redirect":
      return redirectNodeIfMessages(t, node, context);

    case "skip":
      return skipNodeIfMessages(t, node, context);

    case "finish":
      return finishNodeIfMessages(t, node, context);
  }
}

function storyInfoNodeIfMessages(
  t: Translator,
  node: StoryInfoGraphNode,
  context: Context
): IfMessage[] {
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
      !!node.startId && !context.nodeIds.has(node.startId),
      t(
        "The referenced node {{nodeId}} does not exist.",
        { nodeId: node.startId }
      )
    ],
    [
      !node.language,
      t("Select the story language.")
    ]
  ];
}

function actionNodeIfMessages(
  t: Translator,
  node: ActionStoryNode,
  context: Context
): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      isEmpty(node.actions),
      t("Add at least one action.")
    ],
    [
      !context.references.has(node.id),
      t("The node is not referenced by any other node.")
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
    ] as IfMessage),
    ...node.actions.map(action => [
      !!action.id && !context.nodeIds.has(action.id),
      t(
        "The referenced node {{nodeId}} does not exist.",
        { nodeId: action.id }
      )
    ] as IfMessage)
  ];
}

function redirectNodeIfMessages(
  t: Translator,
  node: RedirectStoryNode,
  context: Context
): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      isEmpty(node.links),
      t("Add at least one link.")
    ],
    [
      !context.references.has(node.id),
      t("The node is not referenced by any other node.")
    ],
    ...node.links.map((link, index) => [
      !link.id,
      t(
        "Add a destination node for link \"[{{index}}]\".",
        { index: index + 1 }
      )
    ] as IfMessage),
    ...node.links.map(link => [
      !!link.id && !context.nodeIds.has(link.id),
      t(
        "The referenced node {{nodeId}} does not exist.",
        { nodeId: link.id }
      )
    ] as IfMessage)
  ];
}

function skipNodeIfMessages(
  t: Translator,
  node: SkipStoryNode,
  context: Context
): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      !node.nextId,
      t("Add a destination node.")
    ],
    [
      !context.references.has(node.id),
      t("The node is not referenced by any other node.")
    ],
    [
      !!node.nextId && !context.nodeIds.has(node.nextId),
      t(
        "The referenced node {{nodeId}} does not exist.",
        { nodeId: node.nextId }
      )
    ],
  ];
}

function finishNodeIfMessages(
  t: Translator,
  node: FinishStoryNode,
  context: Context
): IfMessage[] {
  return [
    [
      isEmptyText(node.text),
      t(addTextLine)
    ],
    [
      !context.references.has(node.id),
      t("The node is not referenced by any other node.")
    ]
  ];
}
