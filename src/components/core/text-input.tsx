import { useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";

const defaultRowCount = 2;

interface Props {
  value?: string;
  label: string;
  rowCount?: number;
  readonly?: boolean;
  onValueChanged?: (value: string) => void;
  onEditStarted?: () => void;
  onEditFinished?: () => void;
}

export default function TextInput({ value, label, rowCount, readonly, onValueChanged, onEditStarted, onEditFinished }: Props) {
  const initialValue = value || "";
  const noValue = !initialValue.length;

  const [editedValue, setEditedValue] = useState(initialValue);
  const [editing, setEditing] = useState(noValue);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedValue(initialValue);

    setEditing(true);
    onEditStarted?.();

    setTimeout(() => focusAndSelect(inputRef));
  }

  function cancelEdit() {
    setEditedValue(initialValue);

    setEditing(false);
    onEditFinished?.();
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished?.();
    onValueChanged?.(editedValue);
  }

  function updateEditedValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedValue(event.target.value);
  }

  useEffect(function correctHeightOnEdit() {
    autoHeight(inputRef);
  }, [editedValue]);

  return (
    <>
      {/* edit */}
      {editing &&
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 space-y-1 mt-3 text-sm">
          <textarea
            defaultValue={editedValue}
            onChange={updateEditedValue}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
            ref={inputRef}
            rows={rowCount ?? defaultRowCount}
            placeholder={label}
          >
          </textarea>
          <div className="space-x-2">
            <Button onClick={commitEdit}>Save</Button>
            <Button onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      }
      {/* view */}
      {!editing &&
        <div className={`relative group ${!readonly && "cursor-text"} text-sm`}>
          <p
            className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1"
            onClick={startEdit}
          >
            <span
              className={`whitespace-pre-line break-words ${noValue && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: value || label }}
            >
            </span>
          </p>
          <div className="absolute right-[3px] top-[3px] space-x-1 hidden group-hover:block">
            {!readonly &&
              <Button size="sm" onClick={startEdit}>🖊</Button>
            }
          </div>
        </div>
      }
    </>
  );
}