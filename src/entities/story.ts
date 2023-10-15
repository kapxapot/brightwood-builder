import type { StoryData } from "./story-data";
import type { StoryNode } from "./story-node";

export type Story = {
  title: string;
  description?: string;
  startId: number;
  prefix?: string;
  data?: StoryData;
  nodes: StoryNode[];
};
