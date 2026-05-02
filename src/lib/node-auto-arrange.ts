import type { GraphNode, StoryInfoGraphNode } from "@/entities/story-node";
import type { Edge, Node } from "reactflow";

const horizontalLayerGap = 420;
const verticalNodeGap = 240;
const componentVerticalGap = 320;

type Position = {
  x: number;
  y: number;
};

type GraphMaps = {
  outgoingById: Map<number, number[]>;
  incomingById: Map<number, number[]>;
  undirectedById: Map<number, Set<number>>;
};

function sortNodeIds(
  nodeIds: number[],
  nodeById: Map<number, Node<GraphNode>>
): number[] {
  return [...new Set(nodeIds)].sort((a, b) => {
    const nodeA = nodeById.get(a);
    const nodeB = nodeById.get(b);

    return (nodeA?.position.y ?? 0) - (nodeB?.position.y ?? 0)
      || (nodeA?.position.x ?? 0) - (nodeB?.position.x ?? 0)
      || a - b;
  });
}

function buildGraphMaps(
  nodes: Node<GraphNode>[],
  nodeById: Map<number, Node<GraphNode>>,
  edges: Edge[]
): GraphMaps {
  const outgoingById = new Map<number, number[]>();
  const incomingById = new Map<number, number[]>();
  const undirectedById = new Map<number, Set<number>>();
  const flowNodeIdMap = new Map(nodes.map(node => [node.id, node.data.id]));

  for (const nodeId of nodeById.keys()) {
    outgoingById.set(nodeId, []);
    incomingById.set(nodeId, []);
    undirectedById.set(nodeId, new Set<number>());
  }

  for (const edge of edges) {
    const sourceId = flowNodeIdMap.get(edge.source);
    const targetId = flowNodeIdMap.get(edge.target);

    if (sourceId === undefined || targetId === undefined) {
      continue;
    }

    outgoingById.get(sourceId)?.push(targetId);
    incomingById.get(targetId)?.push(sourceId);

    undirectedById.get(sourceId)?.add(targetId);
    undirectedById.get(targetId)?.add(sourceId);
  }

  for (const [nodeId, outgoingIds] of outgoingById.entries()) {
    outgoingById.set(nodeId, sortNodeIds(outgoingIds, nodeById));
  }

  for (const [nodeId, incomingIds] of incomingById.entries()) {
    incomingById.set(nodeId, sortNodeIds(incomingIds, nodeById));
  }

  return {
    outgoingById,
    incomingById,
    undirectedById,
  };
}

function collectConnectedComponent(
  seedId: number,
  remainingNodeIds: Set<number>,
  undirectedById: Map<number, Set<number>>
): number[] {
  if (!remainingNodeIds.has(seedId)) {
    return [];
  }

  const componentIds: number[] = [];
  const queue = [seedId];

  remainingNodeIds.delete(seedId);

  while (queue.length > 0) {
    const nodeId = queue.shift();

    if (nodeId === undefined) {
      continue;
    }

    componentIds.push(nodeId);

    for (const neighborId of undirectedById.get(nodeId) ?? []) {
      if (!remainingNodeIds.has(neighborId)) {
        continue;
      }

      remainingNodeIds.delete(neighborId);
      queue.push(neighborId);
    }
  }

  return componentIds;
}

function pickRootNodeId(
  remainingNodeIds: Set<number>,
  incomingById: Map<number, number[]>,
  nodeById: Map<number, Node<GraphNode>>
): number {
  return [...remainingNodeIds].sort((a, b) => {
    const incomingCountA = (incomingById.get(a) ?? [])
      .filter(nodeId => remainingNodeIds.has(nodeId))
      .length;
    const incomingCountB = (incomingById.get(b) ?? [])
      .filter(nodeId => remainingNodeIds.has(nodeId))
      .length;

    if (incomingCountA !== incomingCountB) {
      return incomingCountA - incomingCountB;
    }

    return sortNodeIds([a, b], nodeById)[0] === a ? -1 : 1;
  })[0];
}

function appendLayersFromRoots(
  layers: number[][],
  rootIds: number[],
  visitedNodeIds: Set<number>,
  componentNodeIds: Set<number>,
  outgoingById: Map<number, number[]>,
  nodeById: Map<number, Node<GraphNode>>
) {
  let currentLayer = sortNodeIds(
    rootIds.filter(nodeId => componentNodeIds.has(nodeId) && !visitedNodeIds.has(nodeId)),
    nodeById
  );

  if (currentLayer.length === 0) {
    return;
  }

  currentLayer.forEach(nodeId => visitedNodeIds.add(nodeId));
  layers.push(currentLayer);

  while (currentLayer.length > 0) {
    const nextLayer: number[] = [];

    for (const nodeId of currentLayer) {
      for (const targetId of outgoingById.get(nodeId) ?? []) {
        if (!componentNodeIds.has(targetId) || visitedNodeIds.has(targetId)) {
          continue;
        }

        visitedNodeIds.add(targetId);
        nextLayer.push(targetId);
      }
    }

    currentLayer = sortNodeIds(nextLayer, nodeById);

    if (currentLayer.length > 0) {
      layers.push(currentLayer);
    }
  }
}

function buildComponentLayers(
  componentIds: number[],
  preferredRootIds: number[],
  outgoingById: Map<number, number[]>,
  incomingById: Map<number, number[]>,
  nodeById: Map<number, Node<GraphNode>>
): number[][] {
  const componentNodeIds = new Set(componentIds);
  const visitedNodeIds = new Set<number>();
  const layers: number[][] = [];

  for (const rootId of preferredRootIds) {
    appendLayersFromRoots(
      layers,
      [rootId],
      visitedNodeIds,
      componentNodeIds,
      outgoingById,
      nodeById
    );
  }

  while (visitedNodeIds.size < componentNodeIds.size) {
    const remainingNodeIds = new Set(
      [...componentNodeIds].filter(nodeId => !visitedNodeIds.has(nodeId))
    );

    const rootId = pickRootNodeId(remainingNodeIds, incomingById, nodeById);

    appendLayersFromRoots(
      layers,
      [rootId],
      visitedNodeIds,
      componentNodeIds,
      outgoingById,
      nodeById
    );
  }

  return layers;
}

function getComponentSpan(layers: number[][]): number {
  const maxLayerSize = layers.reduce(
    (maxNodes, layer) => Math.max(maxNodes, layer.length),
    1
  );

  return (maxLayerSize - 1) * verticalNodeGap;
}

function assignLayerPositions(
  positionById: Map<number, Position>,
  layers: number[][],
  originX: number,
  centerY: number
) {
  layers.forEach((layer, layerIndex) => {
    const x = originX + layerIndex * horizontalLayerGap;
    const startY = centerY - ((layer.length - 1) * verticalNodeGap) / 2;

    layer.forEach((nodeId, index) => {
      positionById.set(nodeId, {
        x,
        y: startY + index * verticalNodeGap,
      });
    });
  });
}

export function autoArrangeStoryNodes(
  nodes: Node<GraphNode>[],
  edges: Edge[]
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

  const {
    outgoingById,
    incomingById,
    undirectedById,
  } = buildGraphMaps(nodes, nodeById, edges);

  const storyPosition = storyNode.position;
  const positionById = new Map<number, Position>();
  const unassignedNodeIds = new Set(nodeById.keys());
  const mainComponentIds = new Set<number>();

  collectConnectedComponent(
    storyNode.data.id,
    unassignedNodeIds,
    undirectedById
  ).forEach(nodeId => mainComponentIds.add(nodeId));

  collectConnectedComponent(
    startId,
    unassignedNodeIds,
    undirectedById
  ).forEach(nodeId => mainComponentIds.add(nodeId));

  const mainLayers = buildComponentLayers(
    [...mainComponentIds],
    [storyNode.data.id, startId],
    outgoingById,
    incomingById,
    nodeById
  );

  assignLayerPositions(
    positionById,
    mainLayers,
    storyPosition.x,
    storyPosition.y
  );

  let nextComponentTopY = storyPosition.y + getComponentSpan(mainLayers) + componentVerticalGap;

  while (unassignedNodeIds.size > 0) {
    const seedId = pickRootNodeId(unassignedNodeIds, incomingById, nodeById);
    const componentIds = collectConnectedComponent(
      seedId,
      unassignedNodeIds,
      undirectedById
    );
    const componentLayers = buildComponentLayers(
      componentIds,
      [seedId],
      outgoingById,
      incomingById,
      nodeById
    );
    const componentSpan = getComponentSpan(componentLayers);
    const componentCenterY = nextComponentTopY + componentSpan / 2;

    assignLayerPositions(
      positionById,
      componentLayers,
      storyPosition.x + horizontalLayerGap,
      componentCenterY
    );

    nextComponentTopY += componentSpan + componentVerticalGap;
  }

  return nodes.map(node => {
    const nextPosition = positionById.get(node.data.id);

    if (!nextPosition) {
      return node;
    }

    return {
      ...node,
      position: nextPosition,
      positionAbsolute: nextPosition,
    };
  });
}
