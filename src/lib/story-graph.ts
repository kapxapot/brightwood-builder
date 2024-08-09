import { StoryGraph, buildNewStoryNode, buildStoryGraph, defaultViewport } from "@/builders/story-graph-builder";
import { Story } from "@/entities/story";
import { OnChangeHandler } from "@/entities/story-node";
import { fetchCurrentStoryId, fetchStory } from "@/lib/storage";
import { storySchema } from "@/schemas/story-schema";
import { ZodError } from "zod";

type StoryGraphResult = {
  storyGraph: StoryGraph;
  isNewStory: boolean;
};

export function initStoryGraph(changeHandler: OnChangeHandler): StoryGraphResult {
  const currentStoryId = fetchCurrentStoryId();

  const storyGraph = currentStoryId
    ? loadStoryGraph(currentStoryId, changeHandler)
    : null;

  if (storyGraph) {
    return {
      storyGraph,
      isNewStory: false
    };
  }

  return {
    storyGraph: newStoryGraph(changeHandler),
    isNewStory: true,
  };
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

export function getParseErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    const issues = error.issues;
    const showPaths = 3;

    const paths = issues.slice(0, showPaths)
      .map(issue => issue.path)
      .map(path => JSON.stringify(path));

    const total = (issues.length > showPaths)
      ? ` (${issues.length} in total)`
      : "";

    return `Malformed story JSON. Incorrect values: ${paths.join(", ")}${total}.`;
  }

  const message = (error instanceof SyntaxError)
    ? error.message
    : null;

  return `Failed to parse JSON${message ? `: ${message}` : ""}.`;
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
