import { StoryGraph, buildNewStoryNode, buildStoryGraph, defaultViewport } from "@/builders/story-graph-builder";
import { Story } from "@/entities/story";
import { OnChangeHandler } from "@/entities/story-node";
import { fetchCurrentStoryId, fetchStory } from "@/lib/storage";
import { storySchema } from "@/schemas/story-schema";

export function initStoryGraph(changeHandler: OnChangeHandler): StoryGraph {
  const currentStoryId = fetchCurrentStoryId();

  const storyGraph = currentStoryId
    ? loadStoryGraph(currentStoryId, changeHandler)
    : null;

  return storyGraph ?? newStoryGraph(changeHandler);
}

export function loadStoryGraph(storyId: string, changeHandler: OnChangeHandler): StoryGraph | null {
  const storyGraph = fetchStory(storyId);

  if (!storyGraph) {
    return null;
  }

  return applyChangeHandler(storyGraph, changeHandler);
}

export function parseStoryGraph(text: string, changeHandler: OnChangeHandler): StoryGraph {
  const story = JSON.parse(text);

  // validate the story
  storySchema.parse(story);

  return buildStoryGraph(story as Story, changeHandler);
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

function applyChangeHandler(storyGraph: StoryGraph, changeHandler: OnChangeHandler): StoryGraph {
  return {
    ...storyGraph,
    nodes: storyGraph.nodes.map(node => {
      node.data.onChange = changeHandler;
      return node;
    })
  };
}
