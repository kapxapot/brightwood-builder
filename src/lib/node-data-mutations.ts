import type { StoryNode, Text } from "../entities/story-node";
import { moveElementDown, moveElementUp, toArray } from "./common";

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
  data.onChange?.({
    ...data,
    text: toArray(data.text).toSpliced(index, 1)
  });
};

export const moveTextLineDown = (data: StoryNode, index: number) => {
  const lines = toArray(data.text);

  data.onChange?.({
    ...data,
    text: moveElementDown(lines, index)
  });
};

export const moveTextLineUp = (data: StoryNode, index: number) => {
  const lines = toArray(data.text);

  data.onChange?.({
    ...data,
    text: moveElementUp(lines, index)
  });
};

function normalizeText(text?: Text): Text {
  return toArray(text)
    .flatMap(line => {
      const brk = "\n\n";
      line = line.replace(/(\n){3,}/gm, brk);
      return line.split(brk);
    })
    .map(line => line.trim());
}
