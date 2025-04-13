import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focus } from "../../lib/ref-operations";
import HandleOut from "./handle-out";
import { Bolt, Delete, Edit, MoveDown, MoveUp } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";

type Props = {
  action: Action;
  index: number;
  deletable: boolean;
  nodeEditing?: boolean;
  charLimit?: number;
  isFirst: boolean;
  isLast: boolean;
  updateAction: (updatedAction: Action) => void;
  deleteAction: () => void;
  moveActionDown: () => void;
  moveActionUp: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeAction({ action, index, deletable, nodeEditing, charLimit = 0, isFirst, isLast, updateAction, deleteAction, moveActionDown, moveActionUp, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const initialLabel = action.label;
  const noLabel = !initialLabel.length;

  const [label, setLabel] = useState(initialLabel);
  const [editing, setEditing] = useState(noLabel);

  const inputRef = useRef<HTMLInputElement>(null);

  const { showCharLimit, valueTooLong} = useCharLimit(label, charLimit);

  function startEdit() {
    setLabel(initialLabel);

    setEditing(true);
    onEditStarted();

    focus(inputRef);
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
    <div
      className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2"
    >
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mr-2 my-1">
            <TextInputLabel>
              {t("Action label")}
            </TextInputLabel>
            <input
              type="text"
              defaultValue={label}
              onChange={updateLabel}
              className="w-full py-1 px-1.5 mb-1 border border-slate-400 rounded-md"
              ref={inputRef}
            />
            {showCharLimit &&
              <div className={`text-xs ${valueTooLong ? 'text-red-500' : 'opacity-50'}`}>
                {label.length} / {charLimit}
              </div>
            }
            <div className="flex gap-2 mt-1">
              <Button
                disabled={!label.length || valueTooLong}
                onClick={commitEdit}
              >
                {t("Save")}
              </Button>
              <Button onClick={cancelEdit}>
                {t("Cancel")}
              </Button>
            </div>
          </div>
        }
        {/* view */}
        {!editing &&
          <div className="break-words flex gap-1">
            <Bolt />
            <span className="pr-2">
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
        <div className="absolute right-3 top-1 hidden group-hover:block">
          <div className="flex gap-1">
            {!isFirst && (
              <Button
                size="small"
                onClick={moveActionUp}
              >
                <MoveUp />
              </Button>
            )}

            {!isLast && (
              <Button
                size="small"
                onClick={moveActionDown}
              >
                <MoveDown />
              </Button>
            )}

            <Button
              size="small"
              onClick={startEdit}
            >
              <Edit />
            </Button>

            {deletable &&
              <Button
                size="small"
                onClick={deleteAction}
              >
                <Delete />
              </Button>
            }
          </div>
        </div>
      }
    </div>
  );
}
