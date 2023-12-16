import type { Text } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import Button from "../core/button";

interface Props {
  text?: Text;
  allowEmpty: boolean;
  addTextLine: () => void;
  updateTextLine: (index: number, updatedLine: string) => void;
  deleteTextLine: (index: number) => void;
}

export default function NodeText({ text, allowEmpty, addTextLine, updateTextLine, deleteTextLine }: Props) {
  const lines = toArray(text);

  const lineOrDefault = (line: string, index: number) => line || `Text line ${index + 1}`;

  function startEdit() {
    console.log('start edit text');
  }

  return (
    <div className="text-sm mt-2 space-y-2 cursor-text">
      {lines.map((line, index) => (
        <div className="relative group" key={index}>
          <p key={index} className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1">
            <span
              className={`${!line.length && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: lineOrDefault(line, index) }}
            >
            </span>
          </p>
          <div className="absolute right-[3px] top-[3px] space-x-1 hidden group-hover:block">
            <Button size="sm" onClick={startEdit}>🖊</Button>
            {(allowEmpty || lines.length > 1) &&
              <Button size="sm" onClick={() => deleteTextLine(index)}>❌</Button>
            }
          </div>
        </div>
      ))}
      <Button onClick={addTextLine}>
        Add text 🖊
      </Button>
    </div>
  );
}
