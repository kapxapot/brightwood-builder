import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import type { ZodType } from "zod";
import { useTranslation } from "react-i18next";
import { autoHeight, focus } from "@/lib/ref-operations";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import Button from "../core/button";
import { Delete, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";
import StateCode from "./state-code";

type Props<T> = {
  label: string;
  value: T | undefined;
  defaultValue: T;
  schema: ZodType<T>;
  readonly?: boolean;
  rowCount?: number;
  onValueChanged: (value: T | undefined) => void;
  onEditStarted?: () => void;
  onEditFinished?: () => void;
};

export default function EditableJsonBlock<T>({
  label,
  value,
  defaultValue,
  schema,
  readonly = false,
  rowCount = 6,
  onValueChanged,
  onEditStarted,
  onEditFinished
}: Props<T>) {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(formatJson(value ?? defaultValue));
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasValue = value !== undefined;

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedValue(formatJson(value ?? defaultValue));
    setError(null);
    setExpanded(true);
    setEditing(true);
    onEditStarted?.();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished?.();
  }

  function clearValue() {
    if (readonly) {
      return;
    }

    onValueChanged(undefined);
    setExpanded(false);
  }

  function commitEdit() {
    try {
      const trimmedValue = editedValue.trim();

      if (!trimmedValue.length) {
        onValueChanged(undefined);
        setExpanded(false);
      } else {
        onValueChanged(parseJsonWithSchema(trimmedValue, schema));
        setExpanded(true);
      }

      setEditing(false);
      setError(null);
      onEditFinished?.();
    } catch (error) {
      setError(getJsonEditorErrorMessage(error));
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
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          className="flex items-center gap-1 text-left"
          onClick={() => setExpanded(current => !current)}
          aria-expanded={expanded}
        >
          <span className="text-xs opacity-50 font-bold">
            {label}
          </span>
          {expanded
            ? <ChevronDownIcon className="w-3 h-3 opacity-70" />
            : <ChevronRightIcon className="w-3 h-3 opacity-70" />
          }
        </button>

        {!editing && !readonly && (
          <div className="flex gap-1">
            <Button size="small" onClick={startEdit}>
              {hasValue ? <Edit /> : t("Add")}
            </Button>
            {hasValue && (
              <Button size="small" onClick={clearValue}>
                <Delete />
              </Button>
            )}
          </div>
        )}
      </div>

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
            <div className="mt-1 text-xs text-red-500">
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
      ) : expanded ? (
        hasValue ? (
          <StateCode code={formatJson(value)} block={true} />
        ) : (
          <div className="text-xs italic opacity-40">
            {t("Not set")}
          </div>
        )
      ) : null}
    </div>
  );
}
