import type { Story } from "./entities/story";
import type { StoryNode, StoryNodeType } from "./entities/story-node";

type Position = {
  x: number;
  y: number;
};

type Node = {
  id: string;
  position: Position;
  type: StoryNodeType;
  data: StoryNode;
};

type Edge = {
  id: string;
  source: string;
  sourceHandle?: string;
  target: string;
};

interface StoryGraph {
  nodes: Node[];
  edges: Edge[];
};

export function buildStoryGraph(story: Story): StoryGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const addEdge = (fromId: string | number, toId: string | number) => {
    const edge = {
      id: `e${fromId}-${toId}`,
      source: String(fromId),
      sourceHandle: String(toId),
      target: String(toId)
    };

    edges.push(edge);
  };

  for (const data of story.nodes) {
    data.isStart = data.id === story.startId;

    const dpos = data.position;
    const position: Position = { 
      x: dpos ? dpos[0] : 0,
      y: dpos ? dpos[1] : 0
    }; 

    const node = {
      id: String(data.id),
      type: data.type,
      position,
      data
    };

    nodes.push(node);
  }

  for (const node of nodes) {
    // get node's edges and add them to the `edges` array
    switch (node.data.type) {
      case "action":
        for (const action of node.data.actions) {
          addEdge(node.id, action.id);
        }

        break;

      case "redirect":
        for (const link of node.data.links) {
          addEdge(node.id, link.id);
        }

        break;

      case "skip":
        addEdge(node.id, node.data.nextId);
        break;
    }
  }

  return { nodes, edges };
}
