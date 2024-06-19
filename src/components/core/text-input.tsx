import { useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";
import { Edit } from "./icons";
import { TextInputLabel } from "./text-input-label";

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
  const [editing, setEditing] = useState(false);

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
    const value = event.currentTarget.value;
    setEditedValue(value.trim());
  }

  useEffect(function correctHeightOnEdit() {
    autoHeight(inputRef);
  }, [editedValue]);

  return (
    <div className={`${editing ? "mt-2" : "mt-1"}`}>
      {/* edit */}
      {editing &&
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mt-3 text-sm">
          <TextInputLabel>
            {label}
          </TextInputLabel>
          <textarea
            defaultValue={editedValue}
            onChange={updateEditedValue}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
            ref={inputRef}
            rows={rowCount ?? defaultRowCount}
          >
          </textarea>
          <div className="pt-1 flex gap-2">
            <Button onClick={commitEdit}>Save</Button>
            <Button onClick={cancelEdit}>Cancel</Button>
          </div>
        </div>
      }
      {/* view */}
      {!editing &&
        <div className={`group ${!readonly && "cursor-text"} text-sm`}>
          {!noValue &&
            <span className="text-xs opacity-50 font-bold ml-0.5">
              {label}
            </span>
          }
          <div
            className="relative border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1"
            onClick={startEdit}
          >
            <span
              className={`whitespace-pre-line break-words ${noValue && "opacity-30"}`}
              dangerouslySetInnerHTML={{ __html: value || label }}
            >
            </span>
            {!readonly &&
              <div className="absolute right-1 top-1 hidden group-hover:block">
                <Button size="small" onClick={startEdit}>
                  <Edit />
                </Button>
              </div>
            }
            </div>
        </div>
      }
    </div>
  );
}
