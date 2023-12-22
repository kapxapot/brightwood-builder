import { Handle, Position } from "reactflow";
import { type Link } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";
import { Weight } from "../../lib/constants";

interface Props {
  link: Link;
  index: number;
  deletable: boolean;
  updateLink: (updatedLink: Link) => void;
  deleteLink: () => void;
  nodeEditing: boolean;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

function weightStr(weight: number): string {
  const dices = Math.max(1, weight);
  let str = "🎲".repeat(dices);

  if (weight - Math.floor(weight) > 0) {
    str += ` [${weight}]`;
  }

  return str;
}

export default function NodeLink({ link, index, deletable, updateLink, deleteLink, nodeEditing, onEditStarted, onEditFinished }: Props) {
  const initialWeight = link.weight || Weight.default;
  const noWeight = !link.weight;

  const [weight, setWeight] = useState(initialWeight);
  const [editing, setEditing] = useState(noWeight);

  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setWeight(initialWeight);

    setEditing(true);
    onEditStarted();

    setTimeout(() => focusAndSelect(inputRef));
  }

  function cancelEdit() {
    setEditing(false);
    onEditFinished();

    if (link.weight > 0) {
      setWeight(link.weight);
    } else {
      deleteLink();
    }
  }

  function commitEdit() {
    setEditing(false);
    onEditFinished();

    updateLink?.({
      ...link,
      weight
    });
  }

  function updateWeight(event: React.ChangeEvent<HTMLInputElement>) {
    setWeight(
      Number(event.target.value)
    );
  }

  useEffect(() => {
    if (noWeight) {
      startEdit();
    }
  }, []);

  useEffect(() => autoHeight(inputRef), [weight]);

  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-yellow-300 py-1 -mr-2" key={index}>
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 space-y-2 mr-2 my-1">
            <div className="space-y-1">
              <div>
                <input
                  type="number"
                  defaultValue={weight}
                  onChange={updateWeight}
                  className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
                  ref={inputRef}
                  placeholder="Link weight"
                  min={Weight.min}
                  max={Weight.max}
                />
              </div>
              <div>
                {!!weight && weightStr(weight)}
              </div>
            </div>
            <div className="space-x-2">
              <Button onClick={commitEdit} disabled={weight <= Weight.min || weight > Weight.max}>Save</Button>
              <Button onClick={cancelEdit}>Cancel</Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div>
            <span className="mr-1">{weightStr(link.weight)}</span>
            {link.condition && (
              <span className="mr-1">
                <span className="italic">if:</span> {link.condition}
              </span>
            )}
            <NodeRef id={link.id} />
          </div>
        }
        {!noWeight &&
          <Handle
            id={String(index)}
            type="source"
            position={Position.Right}
            className="bg-slate-600"
            isConnectable={true}
          />
        }
      </div>
      {/* view */}
      {!editing && !nodeEditing &&
        <div className="absolute right-2 top-[3px] space-x-1 hidden group-hover:block">
          <Button size="sm" onClick={startEdit}>🖊</Button>
          {deletable &&
            <Button size="sm" onClick={deleteLink}>❌</Button>
          }
        </div>
      }
    </div>
  );
}
