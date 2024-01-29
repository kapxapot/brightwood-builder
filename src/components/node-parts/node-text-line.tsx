import { useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";

interface Props {
  line: string;
  index: number;
  deletable: boolean;
  readonly: boolean;
  updateLine: (updatedLine: string) => void;
  deleteLine: () => void;
  onEditStarted?: () => void;
  onEditFinished?: () => void;
}

export default function NodeTextLine({ line, index, deletable, readonly, updateLine, deleteLine, onEditStarted, onEditFinished }: Props) {
  const noText = !line.length;

  const [editedLine, setEditedLine] = useState(line);
  const [editing, setEditing] = useState(noText);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedLine(line);

    setEditing(true);
    onEditStarted?.();

    setTimeout(() => focusAndSelect(inputRef));
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished?.();

    if (line.length) {
      setEditedLine(line);
    } else {
      deleteLine();
    }
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished?.();

    updateLine(editedLine);
  }

  function updateEditedLine(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedLine(event.target.value);
  }

  useEffect(function autoEditEmptyLine() {
    if (noText) {
      startEdit();
    }
  }, []);

  useEffect(function correctHeightOnEdit() {
    autoHeight(inputRef);
  }, [editedLine]);

  return (
    <>
      {/* edit */}
      {editing &&
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 space-y-1 mt-3 text-sm">
          <textarea
            defaultValue={editedLine}
            onChange={updateEditedLine}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
            ref={inputRef}
            rows={3}
            placeholder="Text line"
          >
          </textarea>
          <div className="space-x-2">
            <Button onClick={commitEdit} disabled={!editedLine.length}>Save</Button>
            {(deletable || !noText) &&
              <Button onClick={cancelEdit}>Cancel</Button>
            }
          </div>
        </div>
      }
      {/* view */}
      {!editing &&
        <div className={`relative group ${!readonly && "cursor-text"} text-sm`}>
          <p
            className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1 break-words"
            onClick={startEdit}
          >
            <span
              className={`whitespace-pre-line ${noText && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: line || `Text line ${index + 1}` }}
            >
            </span>
          </p>
          <div className="absolute right-[3px] top-[3px] space-x-1 hidden group-hover:block">
            {!readonly &&
              <>
                <Button size="sm" onClick={startEdit}>🖊</Button>
                {deletable &&
                  <Button size="sm" onClick={deleteLine}>❌</Button>
                }
              </>
            }
          </div>
        </div>
      }
    </>
  );
}
