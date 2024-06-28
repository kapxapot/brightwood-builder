import { Story } from "@/entities/story";
import { StoryGraph } from "./story-graph-builder";
import { StoryInfoGraphNode, StoryNode } from "@/entities/story-node";

export function buildStory(storyGraph: StoryGraph): Story {
  const nodes = storyGraph.nodes;
  const storyNode = nodes.find(n => n.data.type === "storyInfo");
  const otherNodes = nodes.filter(n => n.data.type !== "storyInfo");

  if (!storyNode) {
    throw new Error("Story info node not found.");
  }

  const storyData = storyNode.data as StoryInfoGraphNode;

  if (!storyData.title) {
    throw new Error("Story title must be defined.");
  }

  if (!storyData.startId) {
    throw new Error("Story start node must be defined.");
  }

  return {
    id: storyData.uuid,
    title: storyData.title,
    description: storyData.description,
    startId: storyData.startId,
    prefix: storyData.prefix,
    data: storyData.data,
    position: [storyNode.position.x, storyNode.position.y],
    nodes: otherNodes.map(node => {
      return {
        ...node.data,
        position: [node.position.x, node.position.y]
      } as StoryNode;
    }),
    viewport: storyGraph.viewport
  };
}
