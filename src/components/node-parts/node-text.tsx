import type { Text } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import Button from "../core/button";
import NodeTextLine from "./node-text-line";

interface Props {
  text?: Text;
  allowEmpty: boolean;
  addLine: () => void;
  updateLine: (index: number, updatedLine: string) => void;
  deleteLine: (index: number) => void;
}

export default function NodeText({ text, allowEmpty, addLine, updateLine, deleteLine }: Props) {
  const lines = toArray(text);

  return (
    <div className="mt-2 space-y-2">
      {lines.map((line, index) =>
        <NodeTextLine
          key={index}
          index={index}
          line={line}
          deletable={allowEmpty || lines.length > 1}
          updateLine={updatedLine => updateLine(index, updatedLine)}
          deleteLine={() => deleteLine(index)}
        />
      )}
      <Button onClick={addLine}>Add text 🖊</Button>
    </div>
  );
}
