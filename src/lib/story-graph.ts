import { StoryGraph, buildNewStoryNode, buildStoryGraph, defaultViewport } from "@/builders/story-graph-builder";
import { Story } from "@/entities/story";
import { OnChangeHandler } from "@/entities/story-node";
import { fetchCurrentStoryId, fetchStory } from "@/lib/storage";
import { storySchema } from "@/schemas/story-schema";
import { ZodError } from "zod";
import { Translator } from "./types";

type StoryGraphResult = {
  storyGraph: StoryGraph;
  isNewStory: boolean;
};

export function initStoryGraph(
  languageCode: string,
  changeHandler: OnChangeHandler
): StoryGraphResult {
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
    storyGraph: newStoryGraph(languageCode, changeHandler),
    isNewStory: true,
  };
}

export function loadStoryGraph(
  storyId: string,
  changeHandler: OnChangeHandler
): StoryGraph | null {
  const storyGraph = fetchStory(storyId);

  if (!storyGraph) {
    return null;
  }

  return applyContext(storyGraph, changeHandler);
}

export function parseStoryGraph(
  text: string,
  changeHandler: OnChangeHandler
): StoryGraph {
  const story = JSON.parse(text);

  // validate the story
  storySchema.parse(story);

  return buildStoryGraph(story as Story, changeHandler);
}

export function newStoryGraph(languageCode: string, changeHandler: OnChangeHandler): StoryGraph {
  return ({
    nodes: [
      buildNewStoryNode(languageCode, changeHandler)
    ],
    edges: [],
    viewport: defaultViewport
  });
}

export function getParseErrorMessage(t: Translator, error: unknown): string {
  if (error instanceof ZodError) {
    const issues = error.issues;
    const showPaths = 3;

    const paths = issues.slice(0, showPaths)
      .map(issue => issue.path)
      .map(path => JSON.stringify(path));

    const formatTotal = (count: number) => t("{{count}} in total", { count });

    const total = (issues.length > showPaths)
      ? ` (${formatTotal(issues.length)})`
      : "";

    return `${t("Malformed story JSON.")} ${t("Incorrect values")}): ${paths.join(", ")}${total}.`;
  }

  const message = (error instanceof SyntaxError)
    ? error.message
    : null;

  return `${t("Failed to parse JSON")}${message ? `: ${message}` : ""}.`;
}

function applyContext(
  storyGraph: StoryGraph,
  changeHandler: OnChangeHandler
): StoryGraph {
  return {
    ...storyGraph,
    nodes: storyGraph.nodes.map(node => {
      node.data.onChange = changeHandler;
      return node;
    })
  };
}
