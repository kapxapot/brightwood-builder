import { Story } from "@/entities/story";
import { StoryInfoGraphNode, StoryNode } from "@/entities/story-node";
import { NodeType } from "@/lib/types";
import { StoryGraph } from "./story-graph-builder";

export function buildStory(storyGraph: StoryGraph): Story {
  const nodes = storyGraph.nodes;
  const storyNode = getStoryInfoGraphNode(nodes);
  const otherNodes = getOtherGraphNodes(nodes);

  if (!storyNode) {
    throw new Error("Story info node not found.");
  }

  if (!storyNode.title) {
    throw new Error("Story title must be defined.");
  }

  if (!storyNode.startId) {
    throw new Error("Story start node must be defined.");
  }

  return {
    id: storyNode.uuid,
    title: storyNode.title,
    description: storyNode.description,
    startId: storyNode.startId,
    prefix: storyNode.prefix,
    data: storyNode.data,
    position: storyNode.position,
    nodes: otherNodes,
    viewport: storyGraph.viewport
  };
}

export function getStoryInfoGraphNode(nodes: NodeType[]): StoryInfoGraphNode | undefined {
  const node = nodes.find(n => n.data.type === "storyInfo");
  return node?.data as StoryInfoGraphNode;
}

function getOtherGraphNodes(nodes: NodeType[]): StoryNode[] {
  return nodes
    .map(n => n.data)
    .filter(d => d.type !== "storyInfo") as StoryNode[];
}
