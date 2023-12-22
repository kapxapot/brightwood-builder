import type { Story } from "./entities/story";
import type { OnChangeHandler, StoryNode, StoryNodeType } from "./entities/story-node";

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

  for (const data of story.nodes) {
    data.isStart = data.id === story.startId;
    data.onChange = changeHandler;

    const dpos = data.position;
    const position: Position = {
      x: dpos ? dpos[0] : 0,
      y: dpos ? dpos[1] : 0
    }; 

    const node = {
      id: String(data.id),
      type: data.type,
      dragHandle: '.custom-drag-handle',
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
