import type { Text } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import Button from "../core/button";
import NodeTextLine from "./node-text-line";

interface Props {
  text?: Text;
  allowEmpty?: boolean;
  readonly?: boolean;
  addLine: () => void;
  updateLine: (index: number, updatedLine: string) => void;
  deleteLine: (index: number) => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeText({ text, allowEmpty, readonly, addLine, updateLine, deleteLine, onEditStarted, onEditFinished }: Props) {
  const lines = toArray(text);

  return (
    <>
      {lines.map((line, index) =>
        <NodeTextLine
          key={index}
          index={index}
          line={line}
          deletable={allowEmpty || lines.length > 1}
          readonly={readonly}
          updateLine={updatedLine => updateLine(index, updatedLine)}
          deleteLine={() => deleteLine(index)}
          onEditStarted={onEditStarted}
          onEditFinished={onEditFinished}
        />
      )}

      <Button onClick={addLine} disabled={readonly}>Add text 🖊</Button>
    </>
  );
}
