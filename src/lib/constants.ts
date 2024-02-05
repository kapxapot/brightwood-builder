import type { GraphNodeType } from "../entities/story-node";

type ColorInfo = {
  tw: string;
  rgb: string;
}

export const colors: Record<GraphNodeType, ColorInfo> = {
  storyInfo: {
    tw: "bg-purple-100",
    rgb: "rgb(243, 232, 255)"
  },
  action: {
    tw: "bg-green-100",
    rgb: "rgb(220, 252, 231)"
  },
  skip: {
    tw: "bg-cyan-100",
    rgb: "rgb(207, 250, 254)"
  },
  redirect: {
    tw: "bg-yellow-100",
    rgb: "rgb(254, 249, 195)"
  },
  finish: {
    tw: "bg-red-100",
    rgb: "rgb(254, 226, 226)"
  }
} as const;

export const weights = {
  min: 0,
  default: 1,
  max: 10
} as const;

export const storyInfoNodeId = 0;
