import { Viewport } from "reactflow";
import type { Story } from "../entities/story";
import type { GraphNode, GraphNodeType, OnChangeHandler, StoryInfoGraphNode, StoryNode } from "../entities/story-node";
import { storyInfoNodeId } from "../lib/constants";
import { v4 as uuid } from "uuid";

type BuilderPosition = {
  x: number;
  y: number;
};

export type BuilderNode = {
  id: string;
  position: BuilderPosition;
  type: GraphNodeType;
  data: GraphNode;
};

export type BuilderEdge = {
  id: string;
  source: string;
  sourceHandle: string | null;
  target: string;
};

export const defaultViewport: Viewport = {
  x: 0,
  y: 0,
  zoom: 1
};

export type StoryGraph = {
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  viewport?: Viewport;
};

const positionOrDefault = (dataPosition?: number[]): BuilderPosition => ({
  x: dataPosition ? dataPosition[0] : 0,
  y: dataPosition ? dataPosition[1] : 0
});

export function buildStoryGraph(
  story: Story,
  changeHandler: OnChangeHandler
): StoryGraph {
  const nodes: BuilderNode[] = [];
  const edges: BuilderEdge[] = [];

  const addEdge = (source: string, target: number, sourceHandle?: number) => {
    const edge = {
      id: `e${source}-${target}`,
      source,
      sourceHandle: String(sourceHandle || 0),
      target: String(target)
    };

    edges.push(edge);
  };

  const storyKey = uuid();

  // add story info node
  const storyInfoData: StoryInfoGraphNode = {
    id: storyInfoNodeId,
    key: nodeKey(storyKey, storyInfoNodeId),
    uuid: story.id,
    type: "storyInfo",
    title: story.title,
    description: story.description,
    language: story.language,
    startId: story.startId,
    prefix: story.prefix,
    data: story.data,
    storyKey,
    position: story.position,
    onChange: changeHandler,
  };

  const storyInfoNode = {
    id: String(storyInfoData.id),
    type: storyInfoData.type,
    dragHandle: '.custom-drag-handle',
    position: positionOrDefault(story.position),
    data: storyInfoData
  };

  nodes.push(storyInfoNode);

  if (storyInfoNode.data.startId) {
    addEdge(storyInfoNode.id, storyInfoNode.data.startId);
  }

  for (const data of story.nodes) {
    const nodeData: StoryNode = {
      ...data,
      key: nodeKey(storyKey, data.id),
      onChange: changeHandler
    };

    delete nodeData.position;

    const node = {
      id: String(nodeData.id),
      type: nodeData.type,
      dragHandle: '.custom-drag-handle',
      position: positionOrDefault(data.position),
      data: nodeData
    };

    nodes.push(node);
  }

  for (const node of nodes) {
    const data = node.data;

    // get node's edges and add them to the `edges` array
    switch (data.type) {
      case "action":
        for (let index = 0; index < data.actions.length; index++) {
          const action = data.actions[index];

          if (action.id) {
            addEdge(node.id, action.id, index);
          }
        }

        break;

      case "redirect":
        for (let index = 0; index < data.links.length; index++) {
          const link = data.links[index];

          if (link.id) {
            addEdge(node.id, link.id, index);
          }
        }

        break;

      case "skip":
        if (data.nextId) {
          addEdge(node.id, data.nextId);
        }

        break;
    }
  }

  const viewport = story.viewport ?? defaultViewport;

  return { nodes, edges, viewport };
}

export function buildNewStoryNode(
  languageCode: string,
  changeHandler: OnChangeHandler
): BuilderNode {
  const id = uuid();

  const data: StoryInfoGraphNode = {
    id: storyInfoNodeId,
    key: nodeKey(id, storyInfoNodeId),
    uuid: id,
    type: "storyInfo",
    language: languageCode,
    storyKey: id,
    onChange: changeHandler
  };

  const node = {
    id: String(data.id),
    type: data.type,
    dragHandle: '.custom-drag-handle',
    position: { x: 30, y: 30 },
    data
  };

  return node;
}

export const nodeKey = (uuid: string, nodeId: number) => `${uuid}_${nodeId}`;
