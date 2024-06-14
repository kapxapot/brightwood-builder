import { StoryGraph } from "@/builders/story-graph-builder";
import { StoryShortcut } from "@/entities/story";

const storiesKey = "stories";
const currentStoryIdKey = "currentStoryId";

export function localStore(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function localFetch<T>(key: string): T | null {
  const rawData = localStorage.getItem(key);

  return rawData
    ? JSON.parse(rawData) as T
    : null;
}

export function localRemove(key: string) {
  localStorage.removeItem(key);
}

export const storyKey = (storyId: string) => `story-${storyId}`;

export function fetchStories(): StoryShortcut[] {
  return localFetch<StoryShortcut[]>(storiesKey) ?? [];
}

export function fetchStory(id: string): StoryGraph | null {
  return localFetch<StoryGraph>(storyKey(id));
}

export function storeStory(story: StoryShortcut, storyGraph: StoryGraph) {
  localStore(
    storyKey(story.id),
    storyGraph
  );

  localStore(currentStoryIdKey, story.id);

  let stories = fetchStories();
  const oldStory = stories.find(s => s.id === story.id);

  if (!oldStory) {
    stories.push(story);
  } else {
    stories = stories.map(s => s.id === story.id ? story : s);
  }

  localStore(storiesKey, stories);
}

export function removeStory(id: string) {
  localRemove(storyKey(id));

  localStore(
    storiesKey,
    fetchStories().filter(s => s.id !== id)
  );
}

export function fetchCurrentStoryId(): string | null {
  return localFetch<string>(currentStoryIdKey);
}

export function storeCurrentStoryId(id: string) {
  localStore(currentStoryIdKey, id);
}

export function removeCurrentStoryId() {
  localRemove(currentStoryIdKey);
}
