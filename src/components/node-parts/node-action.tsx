import { Handle, Position } from "reactflow";
import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useRef, useState } from "react";

interface Props {
  action: Action;
  index: number;
  deletable: boolean;
  nodeEditing: boolean;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeAction({ action, index, deletable, nodeEditing, updateAction, deleteAction, onEditStarted, onEditFinished }: Props) {
  const [label, setLabel] = useState(action.label);
  const [editing, setEditing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    onEditStarted();

    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    setLabel(action.label);
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
    setLabel(event.target.value);
  }

  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2">
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 space-y-2 mr-2 my-1">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="action_label">
                Action label
              </label>
              <input
                type="text"
                defaultValue={label}
                onChange={updateLabel}
                className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
                ref={inputRef}
                id="action_label"
              />
            </div>
            <div className="space-x-2">
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