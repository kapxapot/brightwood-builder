import type { GraphNodeType } from "../entities/story-node";

export const colors: Record<GraphNodeType, string> = {
  storyInfo: "bg-purple-100",
  action: "bg-green-100",
  skip: "bg-cyan-100",
  redirect: "bg-yellow-100",
  finish: "bg-red-100"
} as const;

export const weights = {
  min: 0,
  default: 1,
  max: 10
} as const;

export const storyInfoNodeId = 0;
