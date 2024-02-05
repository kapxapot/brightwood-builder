import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";
import HandleOut from "./handle-out";

interface Props {
  action: Action;
  index: number;
  deletable: boolean;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
  nodeEditing: boolean;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeAction({ action, index, deletable, updateAction, deleteAction, nodeEditing, onEditStarted, onEditFinished }: Props) {
  const initialLabel = action.label;
  const noLabel = !initialLabel.length;

  const [label, setLabel] = useState(initialLabel);
  const [editing, setEditing] = useState(noLabel);

  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setLabel(initialLabel);

    setEditing(true);
    onEditStarted();

    setTimeout(() => focusAndSelect(inputRef));
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    if (initialLabel.length) {
      setLabel(action.label);
    } else {
      deleteAction();
    }
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished();

    updateAction?.({
      ...action,
      label
    });
  }

  function updateLabel(event: React.ChangeEvent<HTMLInputElement>) {
    setLabel(event.currentTarget.value);
  }

  useEffect(() => {
    if (noLabel) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [label]);

  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2">
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 space-y-2 mr-2 my-1">
            <div>
              <input
                type="text"
                defaultValue={label}
                onChange={updateLabel}
                className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
                ref={inputRef}
                placeholder="Action label"
              />
            </div>
            <div className="space-x-2">
              <Button onClick={commitEdit} disabled={!label.length}>Save</Button>
              <Button onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div className="break-words">
            ⚡ <span className={`mr-1 ${noLabel && "opacity-30"}`}>{initialLabel || `Action ${index + 1}`}</span>
            <NodeRef id={action.id} />
          </div>
        }
        {!noLabel &&
          <HandleOut
            id={String(index)}
            connected={!!action.id}
          />
        }
      </div>
      {/* view */}
      {!editing && !nodeEditing &&
        <div className="absolute right-2 top-[3px] space-x-1 hidden group-hover:block">
          <Button size="sm" onClick={startEdit}>🖊</Button>
          {deletable &&
            <Button size="sm" onClick={deleteAction}>❌</Button>
          }
        </div>
      }
    </div>
  );
}
