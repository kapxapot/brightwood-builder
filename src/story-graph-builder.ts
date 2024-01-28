import type { Story } from "./entities/story";
import type { GraphNode, GraphNodeType, OnChangeHandler, StoryInfoGraphNode } from "./entities/story-node";
import { storyInfoNodeId } from "./lib/constants";

type Position = {
  x: number;
  y: number;
};

type Node = {
  id: string;
  position: Position;
  type: GraphNodeType;
  data: GraphNode;
};

type Edge = {
  id: string;
  source: string;
  sourceHandle: string | null;
  target: string;
};

interface StoryGraph {
  nodes: Node[];
  edges: Edge[];
};

const positionOrDefault = (dataPosition?: number[]): Position => ({
  x: dataPosition ? dataPosition[0] : 0,
  y: dataPosition ? dataPosition[1] : 0
});

export function buildStoryGraph(story: Story, changeHandler: OnChangeHandler): StoryGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const addEdge = (source: string, target: number, sourceHandle?: number) => {
    const edge = {
      id: `e${source}-${target}`,
      source,
      sourceHandle: String(sourceHandle || 0),
      target: String(target)
    };

    edges.push(edge);
  };

  // add story info node
  const storyInfoData: StoryInfoGraphNode = {
    id: storyInfoNodeId,
    type: "storyInfo",
    title: story.title,
    description: story.description,
    startId: story.startId,
    onChange: changeHandler,
    position: story.position
  };

  const storyInfoNode = {
    id: String(storyInfoData.id),
    type: storyInfoData.type,
    dragHandle: '.custom-drag-handle',
    position: positionOrDefault(storyInfoData.position),
    data: storyInfoData
  };

  nodes.push(storyInfoNode);

  if (storyInfoNode.data.startId) {
    addEdge(storyInfoNode.id, storyInfoNode.data.startId);
  }

  for (const data of story.nodes) {
    data.onChange = changeHandler;

    const node = {
      id: String(data.id),
      type: data.type,
      dragHandle: '.custom-drag-handle',
      position: positionOrDefault(data.position),
      data
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

  return { nodes, edges };
}
