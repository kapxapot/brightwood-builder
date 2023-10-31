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
  sourceHandle: string | null;
  target: string;
};

interface StoryGraph {
  nodes: Node[];
  edges: Edge[];
};

export function buildStoryGraph(story: Story): StoryGraph {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const addEdge = (source: string, target: string, sourceHandle?: string) => {
    const edge = {
      id: `e${source}-${target}`,
      source,
      sourceHandle: sourceHandle || null,
      target
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
    const data = node.data;

    // get node's edges and add them to the `edges` array
    switch (data.type) {
      case "action":
        for (const action of data.actions) {
          if (action.id) {
            addEdge(node.id, String(action.id), String(action.id));
          }
        }

        break;

      case "redirect":
        for (const link of data.links) {
          if (link.id) {
            addEdge(node.id, String(link.id), String(link.id));
          }
        }

        break;

      case "skip":
        if (data.nextId) {
          addEdge(node.id, String(data.nextId));
        }

        break;
    }
  }

  return { nodes, edges };
}
