import type { Text } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import Button from "../core/button";

interface Props {
  text?: Text;
  addTextLine: () => void;
}

export default function NodeText({ text, addTextLine }: Props) {
  const lines = toArray(text);

  if (!lines.length) {
    return null;
  }

  const lineOrDefault = (line: string, index: number) => line || `Text line ${index + 1}`;

  return (
    <div className="text-sm mt-2 space-y-2 cursor-text">
      {lines.map((line, index) => (
        <p key={index} className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1">
          <span
            className={`${!line.length && "opacity-30"}`}
            dangerouslySetInnerHTML={{ __html: lineOrDefault(line, index) }}
          >
          </span>
        </p>
      ))}
      <Button onClick={addTextLine}>
        Add text 🖊
      </Button>
    </div>
  );
}
