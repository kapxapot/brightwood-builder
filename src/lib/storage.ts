export function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function load<T>(key: string, def?: T): T | undefined {
  const rawData = localStorage.getItem(key);

  return rawData
    ? JSON.parse(rawData) as T
    : def;
}

export const storyKey = (storyId: string) => `story-${storyId}`;

const storiesKey = "stories";

type StoryShortcut = {
  id: string;
  title?: string;
};

export function updateStoryList(storyId: string, storyTitle?: string) {
  let stories = (load(storiesKey) ?? []) as StoryShortcut[];

  const oldStory = stories.find(s => s.id === storyId);

  const newStory = {
    id: storyId,
    title: storyTitle
  };

  if (!oldStory) {
    stories.push(newStory);
  } else {
    stories = stories.map(s => s.id === storyId ? newStory : s);
  }

  save(storiesKey, stories);
}
