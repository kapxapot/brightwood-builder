import { type Link } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focusAndSelect } from "../../lib/ref-operations";
import { weights } from "../../lib/constants";
import HandleOut from "./handle-out";
import { WeightDices } from "./weight-dices";
import { Delete, Edit } from "../core/icons";

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

export default function NodeLink({ link, index, deletable, updateLink, deleteLink, nodeEditing, onEditStarted, onEditFinished }: Props) {
  const initialWeight = link.weight || weights.default;
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
      Number(event.currentTarget.value)
    );
  }

  useEffect(() => {
    if (noWeight) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                  min={weights.min}
                  max={weights.max}
                />
              </div>
              {!!weight &&
                <div>
                  <WeightDices weight={weight} />
                </div>
              }
            </div>
            <div className="flex gap-2">
              <Button
                onClick={commitEdit}
                disabled={weight <= weights.min || weight > weights.max}
              >
                Save
              </Button>
              <Button onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div className="flex gap-1">
            <WeightDices weight={link.weight} />
            {link.condition && (
              <span>
                <span className="italic">if:</span> {link.condition}
              </span>
            )}
            <NodeRef id={link.id} />
          </div>
        }
        {!noWeight &&
          <HandleOut
            id={String(index)}
            connected={!!link.id}
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
            <Button size="small" onClick={deleteLink}>
              <Delete />
            </Button>
          }
        </div>
      }
    </div>
  );
}
