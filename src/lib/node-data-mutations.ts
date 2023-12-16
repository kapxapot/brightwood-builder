import type { StoryNode } from "../entities/story-node";
import { toArray } from "./common";

export const addTextLine = (data: StoryNode) => {
  data.onChange?.({
    ...data,
    text: [
      ...toArray(data.text),
      ""
    ]
  });
};

export const updateTextLine = (data: StoryNode, updatedIndex: number, updatedLine: string) => {
  data.onChange?.({
    ...data,
    text: toArray(data.text).map(
      (line, index) => index === updatedIndex ? updatedLine : line
    )
  });
};

export const deleteTextLine = (data: StoryNode, index: number) => {
  data.onChange?.(
    {
      ...data,
      text: toArray(data.text).toSpliced(index, 1)
    }
  );
};
