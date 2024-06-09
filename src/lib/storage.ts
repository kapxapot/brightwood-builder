import { StoryGraph } from "@/builders/story-graph-builder";
import { StoryShortcut } from "@/entities/story";

const storiesKey = "stories";
const currentStoryIdKey = "currentStoryId";

export function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function load<T>(key: string): T | null {
  const rawData = localStorage.getItem(key);

  return rawData
    ? JSON.parse(rawData) as T
    : null;
}

export function remove(key: string) {
  localStorage.removeItem(key);
}

export const storyKey = (storyId: string) => `story-${storyId}`;

export function saveStoryGraph(story: StoryShortcut, storyGraph: StoryGraph) {
  save(
    storyKey(story.id),
    storyGraph
  );

  save(currentStoryIdKey, story.id);

  let stories = loadStories();
  const oldStory = stories.find(s => s.id === story.id);

  if (!oldStory) {
    stories.push(story);
  } else {
    stories = stories.map(s => s.id === story.id ? story : s);
  }

  save(storiesKey, stories);
}

export function loadStories(): StoryShortcut[] {
  return load<StoryShortcut[]>(storiesKey) ?? [];
}

export function loadStoryGraph(id: string): StoryGraph | null {
  return load<StoryGraph>(storyKey(id));
}

export function loadCurrentStoryId(): string | null {
  return load<string>(currentStoryIdKey);
}

export function saveCurrentStoryId(id: string) {
  save(currentStoryIdKey, id);
}

export function deleteStoryGraph(id: string) {
  remove(storyKey(id));

  save(
    storiesKey,
    loadStories().filter(s => s.id !== id)
  );
}

export function deleteCurrentStoryId() {
  remove(currentStoryIdKey);
}
