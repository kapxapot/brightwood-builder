import { useEffect, useRef, useState } from "react";
import Button from "../core/button";
import { autoHeight, focus } from "../../lib/ref-operations";
import { Edit } from "./icons";
import { TextInputLabel } from "./text-input-label";
import { useCharLimit } from "@/hooks/use-char-limit";
import { useTranslation } from "react-i18next";
import TextDisplay from "./text-display";
import { extractImageUrl } from "@/lib/url";
import { ImageDisplay } from "./image-display";

const defaultRowCount = 2;

type Props = {
  value?: string;
  label: string;
  rowCount?: number;
  readonly?: boolean;
  charLimit?: number;
  renderAsImage?: boolean;
  onValueChanged?: (value: string) => void;
  onEditStarted?: () => void;
  onEditFinished?: () => void;
}

export default function TextInput({ value, label, rowCount, readonly = false, charLimit = 0, renderAsImage = false, onValueChanged, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const initialValue = value || "";
  const noValue = !initialValue.length;

  const [editedValue, setEditedValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { showCharLimit, valueTooLong} = useCharLimit(editedValue, charLimit);

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedValue(initialValue);

    setEditing(true);
    onEditStarted?.();

    focus(inputRef);
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
    const value = event.currentTarget.value.trim();
    setEditedValue(value);
  }

  useEffect(function correctHeightOnEdit() {
    autoHeight(inputRef);
  }, [editing, editedValue]);

  const imageUrl = extractImageUrl(editedValue);
  const isImage = renderAsImage && !!imageUrl;

  return (
    <div className={`${editing ? "mt-2" : "mt-1"}`}>
      {/* edit */}
      {editing &&
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mt-3 text-sm nowheel">
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
          {showCharLimit &&
            <div className={`text-xs ${valueTooLong ? "text-red-500" : "opacity-50"}`}>
              {editedValue.length} / {charLimit}
            </div>
          }
          <div className="pt-1 flex gap-2">
            <Button
              disabled={valueTooLong}
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
        <div
          className={`relative group ${!readonly && !isImage && "cursor-text"} text-sm`}
        >
          {!noValue &&
            <span className="text-xs opacity-50 font-bold ml-0.5">
              {label}
            </span>
          }
          {isImage &&
            <ImageDisplay url={imageUrl} />
          }
          {!isImage &&
            <div
              className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1"
              onClick={startEdit}
            >
              <TextDisplay
                className={`whitespace-pre-line break-words ${noValue && "opacity-30"}`}
                text={value || label }
              />
            </div>
          }
          {!readonly &&
            <div className={`absolute right-1 ${noValue ? "top-1" : "top-6"} hidden group-hover:block`}>
              <Button
                size="small"
                onClick={startEdit}
              >
                <Edit />
              </Button>
            </div>
          }
        </div>
      }
    </div>
  );
}
