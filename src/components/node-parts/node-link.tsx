import { type Link } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";
import { useEffect, useRef, useState } from "react";
import { autoHeight, focus } from "../../lib/ref-operations";
import { weights } from "../../lib/constants";
import HandleOut from "./handle-out";
import WeightDices from "./weight-dices";
import { Delete, Edit, MoveDown, MoveUp } from "../core/icons";
import Tooltip from "../core/tooltip";
import { TextInputLabel } from "../core/text-input-label";
import { useTranslation } from "react-i18next";
import { effectInvocationsSchema } from "@/schemas/story-data-schema";
import { formatJson, getJsonEditorErrorMessage, parseJsonWithSchema } from "@/lib/json-editor";
import EffectLines from "./effect-lines";
import ConditionLine from "./condition-line";

type Props = {
  link: Link;
  index: number;
  totalWeight: number;
  deletable: boolean;
  nodeEditing?: boolean;
  isFirst: boolean;
  isLast: boolean;
  updateLink: (updatedLink: Link) => void;
  deleteLink: () => void;
  moveLinkDown: () => void;
  moveLinkUp: () => void;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeLink({ link, index, totalWeight, deletable, isFirst, isLast, updateLink, deleteLink, moveLinkDown, moveLinkUp, nodeEditing, onEditStarted, onEditFinished }: Props) {
  const { t } = useTranslation();

  const initialWeight = link.weight || weights.default;
  const noWeight = !link.weight;

  const [weight, setWeight] = useState(initialWeight);
  const [condition, setCondition] = useState(link.condition ?? "");
  const [effectsValue, setEffectsValue] = useState(formatJson(link.effects ?? []));
  const [editing, setEditing] = useState(noWeight);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const effectsRef = useRef<HTMLTextAreaElement>(null);

  const weightPercent = Math.round(link.weight / totalWeight * 100);

  function startEdit() {
    setWeight(initialWeight);
    setCondition(link.condition ?? "");
    setEffectsValue(formatJson(link.effects ?? []));
    setError(null);

    setEditing(true);
    onEditStarted();

    focus(inputRef);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
    onEditFinished();

    if (link.weight > 0) {
      setWeight(link.weight);
    } else {
      deleteLink();
    }
  }

  function commitEdit() {
    try {
      const trimmedEffects = effectsValue.trim();
      const nextEffects = trimmedEffects.length
        ? parseJsonWithSchema(trimmedEffects, effectInvocationsSchema)
        : undefined;

      setEditing(false);
      setError(null);
      onEditFinished();

      updateLink?.({
        ...link,
        weight,
        condition: condition.trim() || undefined,
        effects: nextEffects
      });
    } catch (error) {
      setError(getJsonEditorErrorMessage(error));
    }
  }

  function updateWeight(event: React.ChangeEvent<HTMLInputElement>) {
    setWeight(
      Number(event.currentTarget.value)
    );
  }

  function updateCondition(event: React.ChangeEvent<HTMLInputElement>) {
    setCondition(event.currentTarget.value);
  }

  function updateEffectsValue(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setEffectsValue(event.currentTarget.value);
  }

  useEffect(() => {
    if (noWeight) {
      startEdit();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => autoHeight(inputRef), [weight]);
  useEffect(() => autoHeight(effectsRef, 220), [editing, effectsValue]);

  const isValidWeight = (weight: number) => weight <= weights.min || weight > weights.max;

  return (
    <div
      className="relative group text-sm bg-gradient-to-r from-transparent to-yellow-300 py-1 -mr-2"
    >
      <div>
        {/* edit */}
        {editing &&
          <div className="border border-black border-opacity-20 rounded-lg border-dashed bg-white p-1 mr-2 my-1">
            <TextInputLabel>
              {t("Link weight")}
            </TextInputLabel>
            <input
              type="number"
              defaultValue={weight}
              onChange={updateWeight}
              className="w-full py-1 px-1.5 border border-slate-400 rounded-md"
              ref={inputRef}
              min={weights.min}
              max={weights.max}
            />
            {!!weight && (
              <div className="mt-1">
                <WeightDices weight={weight} />
              </div>
            )}
            <div className="mt-1">
              <TextInputLabel>
                {t("Condition")}
              </TextInputLabel>
              <input
                type="text"
                defaultValue={condition}
                onChange={updateCondition}
                className="w-full py-1 px-1.5 mb-1 border border-slate-400 rounded-md"
              />
              <TextInputLabel>
                {t("Effects JSON")}
              </TextInputLabel>
              <textarea
                defaultValue={effectsValue}
                onChange={updateEffectsValue}
                className="w-full py-1 px-1.5 border border-slate-400 rounded-md font-mono"
                ref={effectsRef}
                rows={4}
              >
              </textarea>
            </div>
            {error && (
              <div className="mt-1 text-xs text-red-500">
                {error}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                onClick={commitEdit}
                disabled={isValidWeight(weight)}
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
          <div className="flex items-center gap-2 break-words pr-2">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex min-w-0 items-start gap-1">
                <Tooltip
                  tooltip={
                    <div className="flex flex-col">
                      <span>{t("Link weight")}: {link.weight}</span>
                      <span>{t("Probability")}: {weightPercent}%</span>
                    </div>
                  }
                  side="top"
                >
                  <WeightDices weight={link.weight} />
                </Tooltip>
              </div>
              <ConditionLine condition={link.condition} className="opacity-70" />
              <EffectLines effects={link.effects} className="opacity-70" />
            </div>
            <div className="shrink-0">
              <NodeRef id={link.id} />
            </div>
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
        <div className="absolute right-3 top-1 hidden group-hover:block">
          <div className="flex gap-1">
            {!isFirst && (
              <Button
                size="small"
                onClick={moveLinkUp}
              >
                <MoveUp />
              </Button>
            )}

            {!isLast && (
              <Button
                size="small"
                onClick={moveLinkDown}
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
                onClick={deleteLink}
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
