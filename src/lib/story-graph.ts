import importStory from "../stories/test.json";
import { StoryGraph, buildNewStoryNode, buildStoryGraph, defaultViewport } from "@/builders/story-graph-builder";
import { Story } from "@/entities/story";
import { OnChangeHandler } from "@/entities/story-node";
import { loadCurrentStoryId, loadStoryGraph } from "@/lib/storage";

const defaultStory = importStory as Story;

export function initStoryGraph(changeHandler: OnChangeHandler): StoryGraph {
  const currentStoryId = loadCurrentStoryId();

  const storyGraph = currentStoryId
    ? loadStoryGraph(currentStoryId)
    : null;

  if (!storyGraph) {
    return buildStoryGraph(defaultStory, changeHandler);
  }

  return {
    ...storyGraph,
    nodes: storyGraph.nodes.map(node => {
      node.data.onChange = changeHandler;
      return node;
    })
  };
}

export function newStoryGraph(changeHandler: OnChangeHandler): StoryGraph {
  return ({
    nodes: [
      buildNewStoryNode(changeHandler)
    ],
    edges: [],
    viewport: defaultViewport
  });
}
