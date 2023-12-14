import type { Text } from "../../entities/story-node";
import { toArray } from "../../lib/common";

interface Props {
  text?: Text;
}

export default function NodeText({ text }: Props) {
  const lines = toArray(text);

  if (!lines.length) {
    return null;
  }

  return (
    <div className="text-sm mt-2 space-y-2 cursor-text">
      {lines.map((line, index) => (
        <p key={index} className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1" dangerouslySetInnerHTML={{ __html: line }}></p>
      ))}
    </div>
  );
}
