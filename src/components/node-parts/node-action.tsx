import { Handle, Position } from "reactflow";
import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useRef, useState } from "react";

interface Props {
  action: Action;
  index: number;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
}

export default function NodeAction({ action, index, updateAction, deleteAction }: Props) {
  const [label, setLabel] = useState(action.label);
  const [editing, setEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function cancelEdit() {
    setEditing(false);
    setLabel(action.label);
  }

  function commitEdit() {
    setEditing(false);

    updateAction?.({
      ...action,
      label
    });
  }

  function updateLabel(event: React.ChangeEvent<HTMLInputElement>) {
    setLabel(event.target.value);
  }

  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2">
      <div>
        {/* edit */}
        {editing &&
          <div className="space-y-2 mr-2 my-1">
            <div>
              <input
                type="text"
                defaultValue={label}
                onChange={updateLabel}
                className="w-full py-1 px-1.5"
                ref={inputRef}
              />
            </div>
            <div className="space-x-1">
              <Button onClick={commitEdit}>Save</Button>
              <Button onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div>
            ⚡ <span className={`mr-1 ${!action.label.length && "opacity-30"}`}>{action.label || `Action ${index + 1}`}</span>
            <NodeRef id={action.id} />
          </div>
        }
        <Handle id={String(index)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
      </div>
      {/* view */}
      {!editing &&
        <div className="absolute right-2 top-0.5 space-x-1 hidden group-hover:block">
          <Button padding="sm" onClick={startEdit}>
            Edit
          </Button>
          <Button padding="sm" onClick={deleteAction}>
            Delete
          </Button>
        </div>
      }
    </div>
  );
}
