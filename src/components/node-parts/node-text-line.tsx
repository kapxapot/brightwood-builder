import { useRef, useState } from "react";
import Button from "../core/button";

interface Props {
  line: string;
  index: number;
  deletable: boolean;
  updateLine: (updatedLine: string) => void;
  deleteLine: () => void;
}

export default function NodeTextLine({ line, index, deletable, updateLine, deleteLine }: Props) {
  const [editedLine, setEditedLine] = useState(line);
  const [editing, setEditing] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    setEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function cancelEdit() {
    setEditing(false);
    setEditedLine(line);
  }

  function commitEdit() {
    setEditing(false);
    updateLine?.(editedLine);
  }

  function updateEditedLine(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedLine(event.target.value);
  }

  return (
    <div className="text-sm">
      {/* edit */}
      {editing &&
        <div className="space-y-1 mt-3 mb-1">
          <textarea
            defaultValue={editedLine}
            onChange={updateEditedLine}
            className="w-full py-1 px-1.5"
            ref={inputRef}
            rows={3}
          >
          </textarea>
          <div className="space-x-1">
            <Button onClick={commitEdit}>Save</Button>
            <Button onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      }
      {/* view */}
      {!editing &&
        <div className="relative group cursor-text">
          <p key={index} className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1">
            <span
              className={`${!line.length && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: line || `Text line ${index + 1}` }}
            >
            </span>
          </p>
          <div className="absolute right-[3px] top-[3px] space-x-1 hidden group-hover:block">
            <Button size="sm" onClick={startEdit}>🖊</Button>
            {deletable &&
              <Button size="sm" onClick={deleteLine}>❌</Button>
            }
          </div>
        </div>
      }
    </div>
  );
}
