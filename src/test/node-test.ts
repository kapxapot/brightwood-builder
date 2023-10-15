import type { StoryNode } from "../entities/story-node";

const node: StoryNode = {
  type: "action",
  id: 1,
  label: "Start",
  text: [
    "line 1",
    "line 2"
  ],
  actions: [
    { id: 2, label: "Go to 2" },
    { id: 3, label: "Go to 3" }
  ]
};
