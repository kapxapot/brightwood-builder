import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";
import HandleOut from "./handle-out";
import { Bolt, Delete, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";

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
    const value = event.currentTarget.value;
    setLabel(value.trim());
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
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mr-2 my-1">
            <TextInputLabel>
              Action label
            </TextInputLabel>
            <input
              type="text"
              defaultValue={label}
              onChange={updateLabel}
              className="w-full py-1 px-1.5 mb-2 border border-slate-400 rounded-md"
              ref={inputRef}
            />
            <div className="flex gap-2">
              <Button
                onClick={commitEdit}
                disabled={!label.length}
              >
                Save
              </Button>
              <Button onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div className="break-words flex gap-1">
            <Bolt />
            <span>
              {initialLabel} <NodeRef id={action.id} />
            </span>
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
        <div className="absolute right-2 top-1 hidden group-hover:flex gap-1">
          <Button size="small" onClick={startEdit}>
            <Edit />
          </Button>
          {deletable &&
            <Button size="small" onClick={deleteAction}>
              <Delete />
            </Button>
          }
        </div>
      }
    </div>
  );
}
