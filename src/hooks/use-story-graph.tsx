import { StoryGraph, buildStoryGraph } from "@/builders/story-graph-builder";
import { Story } from "@/entities/story";
import { OnChangeHandler } from "@/entities/story-node";
import { load, storyKey } from "@/lib/storage";

export function useStoryGraph(story: Story, changeHandler: OnChangeHandler): StoryGraph {
  const reStory = load<StoryGraph>(storyKey(story.id));

  if (!reStory) {
    return buildStoryGraph(story, changeHandler);
  }

  return {
    nodes: reStory.nodes.map(node => {
      node.data.onChange = changeHandler;
      return node;
    }),
    edges: reStory.edges,
    viewport: reStory.viewport
  };
}
