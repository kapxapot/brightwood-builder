import { useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";
import { useTranslation } from "react-i18next";
import { autoHeight, focus } from "@/lib/ref-operations";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import { cn } from "@/lib/utils";
import Button from "../core/button";
import { Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";

type Props<T> = {
  label: string;
  emptyLabel: string;
  value: T | undefined;
  defaultValue: T;
  schema: ZodType<T>;
  readonly?: boolean;
  rowCount?: number;
  summaryFormatter: (value: T) => string;
  isEmptyValue?: (value: T | undefined) => boolean;
  onValueChanged: (value: T | undefined) => void;
  onEditStarted?: () => void;
  onEditFinished?: () => void;
};

function defaultIsEmptyValue<T>(value: T | undefined) {
  if (value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === "object" && value !== null) {
    return Object.keys(value).length === 0;
  }

  return false;
}

export default function EditableStateInput<T>({
  label,
  emptyLabel,
  value,
  defaultValue,
  schema,
  readonly = false,
  rowCount = 7,
  summaryFormatter,
  isEmptyValue = defaultIsEmptyValue,
  onValueChanged,
  onEditStarted,
  onEditFinished
}: Props<T>) {
  const { t } = useTranslation();

  const [editedValue, setEditedValue] = useState(formatJson(value ?? defaultValue));
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasValue = !isEmptyValue(value);
  const editable = !readonly;
  const displayText = hasValue && value
    ? summaryFormatter(value)
    : emptyLabel;

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedValue(formatJson(value ?? defaultValue));
    setError(null);
    setEditing(true);
    onEditStarted?.();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished?.();
  }

  function commitEdit() {
    try {
      const trimmedValue = editedValue.trim();

      if (!trimmedValue.length) {
        onValueChanged(undefined);
      } else {
        const parsedValue = parseJsonWithSchema(trimmedValue, schema);
        onValueChanged(isEmptyValue(parsedValue) ? undefined : parsedValue);
      }

      setEditing(false);
      setError(null);
      onEditFinished?.();
    } catch (nextError) {
      setError(getJsonEditorErrorMessage(nextError));
    }
  }

  function updateEditedValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedValue(event.currentTarget.value);
  }

  useEffect(() => {
    if (editing) {
      autoHeight(inputRef, 320);
    }
  }, [editing, editedValue]);

  return (
    <div>
      {editing ? (
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 text-sm nowheel">
          <TextInputLabel>
            {label}
          </TextInputLabel>
          <textarea
            defaultValue={editedValue}
            onChange={updateEditedValue}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md font-mono"
            ref={inputRef}
            rows={rowCount}
          >
          </textarea>
          {error && (
            <div className="my-1 text-xs text-red-500">
              {error}
            </div>
          )}
          <div className="pt-1 flex gap-2">
            <Button onClick={commitEdit}>
              {t("Save")}
            </Button>
            <Button onClick={cancelEdit}>
              {t("Cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "relative group text-sm",
            editable ? "cursor-text" : ""
          )}
        >
          {hasValue && (
            <span className="text-xs opacity-50 font-bold ml-0.5">
              {label}
            </span>
          )}
          <div
            className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1"
            onClick={startEdit}
          >
            <span
              className={cn(
                "whitespace-pre-line break-words",
                !hasValue ? "opacity-30" : ""
              )}
            >
              {displayText}
            </span>
          </div>
          {editable && (
            <div
              className={cn(
                "absolute right-1 hidden group-hover:block",
                hasValue ? "top-6" : "top-1"
              )}
            >
              <Button
                size="small"
                onClick={startEdit}
              >
                <Edit />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
