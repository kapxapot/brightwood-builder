import type { GraphNode, StoryInfoGraphNode } from "@/entities/story-node";
import type { Node } from "reactflow";

const horizontalLayerGap = 420;
const verticalNodeGap = 240;

function getOutgoingNodeIds(data: GraphNode): number[] {
  switch (data.type) {
    case "storyInfo":
      return data.startId ? [data.startId] : [];

    case "action":
      return data.actions
        .map(action => action.id)
        .filter((id): id is number => typeof id === "number");

    case "redirect":
      return data.links
        .map(link => link.id)
        .filter((id): id is number => typeof id === "number");

    case "skip":
      return data.nextId ? [data.nextId] : [];

    case "finish":
      return [];
  }
}

export function autoArrangeStoryNodes(
  nodes: Node<GraphNode>[]
): Node<GraphNode>[] {
  const storyNode = nodes.find(
    (node): node is Node<StoryInfoGraphNode> => node.data.type === "storyInfo"
  );

  if (!storyNode) {
    return nodes;
  }

  const startId = storyNode.data.startId;

  if (startId === undefined) {
    return nodes;
  }

  const nodeById = new Map<number, Node<GraphNode>>();

  for (const node of nodes) {
    nodeById.set(node.data.id, node);
  }

  if (!nodeById.has(startId)) {
    return nodes;
  }

  const layers: number[][] = [[storyNode.data.id], [startId]];
  const visited = new Set<number>([storyNode.data.id, startId]);
  let currentLayer = [startId];

  while (currentLayer.length > 0) {
    const nextLayer: number[] = [];

    for (const nodeId of currentLayer) {
      const node = nodeById.get(nodeId);

      if (!node) {
        continue;
      }

      for (const targetId of getOutgoingNodeIds(node.data)) {
        if (visited.has(targetId) || !nodeById.has(targetId)) {
          continue;
        }

        visited.add(targetId);
        nextLayer.push(targetId);
      }
    }

    if (nextLayer.length === 0) {
      break;
    }

    layers.push(nextLayer);
    currentLayer = nextLayer;
  }

  const storyPosition = storyNode.position;
  const positionById = new Map<number, { x: number; y: number }>();

  positionById.set(storyNode.data.id, {
    x: storyPosition.x,
    y: storyPosition.y,
  });

  for (let layerIndex = 1; layerIndex < layers.length; layerIndex += 1) {
    const layer = layers[layerIndex];
    const x = storyPosition.x + layerIndex * horizontalLayerGap;
    const startY = storyPosition.y - ((layer.length - 1) * verticalNodeGap) / 2;

    layer.forEach((nodeId, index) => {
      positionById.set(nodeId, {
        x,
        y: startY + index * verticalNodeGap,
      });
    });
  }

  return nodes.map(node => {
    const nextPosition = positionById.get(node.data.id);

    if (!nextPosition) {
      return node;
    }

    return {
      ...node,
      position: nextPosition,
    };
  });
}
