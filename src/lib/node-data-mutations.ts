import type { StoryNode, Text } from "../entities/story-node";
import { toArray } from "./common";

function normalizeText(text?: Text): Text {
  return toArray(text)
    .flatMap(line => {
      const brk = "\n\n";
      line = line.replace(/(\n){3,}/gm, brk);
      return line.split(brk);
    })
    .map(line => line.trim());
}

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
    text: normalizeText(
      toArray(data.text).map(
        (line, index) => index === updatedIndex ? updatedLine : line
      )
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
