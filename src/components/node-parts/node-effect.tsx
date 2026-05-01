import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EffectInvocation } from "../../entities/story-data";
import { autoHeight, focus } from "@/lib/ref-operations";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import { effectInvocationsSchema } from "@/schemas/story-data-schema";
import Button from "../core/button";
import { Delete, Edit } from "../core/icons";
import { TextInputLabel } from "../core/text-input-label";

type Props = {
  effects?: EffectInvocation[];
  readonly?: boolean;
  updateEffects: (effects: EffectInvocation[] | undefined) => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

const formatInvocation = (effect: EffectInvocation) => {
  if (typeof effect === "string") {
    return effect;
  }

  const args = effect.args?.map(arg => JSON.stringify(arg)).join(", ");
  return `${effect.name}(${args ?? ""})`;
};

export default function NodeEffect({
  effects,
  readonly = false,
  updateEffects,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const [editing, setEditing] = useState(false);
  const [editedEffects, setEditedEffects] = useState(formatJson(effects ?? []));
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const hasValue = effects !== undefined;

  function startEdit() {
    if (readonly) {
      return;
    }

    setEditedEffects(formatJson(effects ?? []));
    setError(null);
    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished();
  }

  function commitEdit() {
    try {
      const trimmedEffects = editedEffects.trim();
      const nextEffects = trimmedEffects.length
        ? parseJsonWithSchema(trimmedEffects, effectInvocationsSchema)
        : undefined;

      setEditing(false);
      setError(null);
      onEditFinished();
      updateEffects(nextEffects);
    } catch (error) {
      setError(getJsonEditorErrorMessage(error));
    }
  }

  function clearEffects() {
    if (readonly) {
      return;
    }

    updateEffects(undefined);
  }

  function updateEditedValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEditedEffects(event.currentTarget.value);
  }

  useEffect(() => {
    if (editing) {
      autoHeight(inputRef, 220);
    }
  }, [editing, editedEffects]);

  return (
    <div className="relative group text-sm">
      {editing ? (
        <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 text-sm nowheel">
          <TextInputLabel>
            {t("entryEffects")}
          </TextInputLabel>
          <textarea
            defaultValue={editedEffects}
            onChange={updateEditedValue}
            className="w-full py-1 px-1.5 border border-slate-400 rounded-md font-mono"
            ref={inputRef}
            rows={4}
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
      ) : (
        <>
          <div className="pr-24">
            <span className="italic">{t("entryEffects")}:</span>{" "}
            {effects?.length
              ? effects.map(formatInvocation).join(", ")
              : <span className="opacity-40">{t("Not set")}</span>
            }
          </div>
          {!readonly && (
            <div className={`absolute right-0 top-0 ${hasValue ? "hidden group-hover:block" : "block"}`}>
              <div className="flex gap-1">
                <Button size="small" onClick={startEdit}>
                  {hasValue ? <Edit /> : t("Add")}
                </Button>
                {hasValue && (
                  <Button size="small" onClick={clearEffects}>
                    <Delete />
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
