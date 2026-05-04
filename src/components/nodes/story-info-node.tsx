import { Reorder } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NodeProps } from "reactflow";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import type { StoryInfoGraphNode } from "../../entities/story-node";
import { colors, languages, nodeLabels } from "../../lib/constants";
import NodeRef from "../node-parts/node-ref";
import TextInput from "../core/text-input";
import HandleOut from "../node-parts/handle-out";
import NodeShell from "../node-parts/node-shell";
import { Condition, Flag } from "../core/icons";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../language-selector";
import type { RedirectTrigger, StoryData } from "@/entities/story-data";
import {
  conditionDefinitionsSchema,
  effectDefinitionsSchema,
  stateInitSchema
} from "@/schemas/story-data-schema";
import EditableStateInput from "../node-parts/editable-state-input";
import Button from "../core/button";
import NodeTrigger from "../node-parts/node-trigger";
import {
  addRedirectTrigger,
  deleteRedirectTrigger,
  setRedirectTriggers,
  updateRedirectTrigger
} from "@/lib/redirect-trigger-mutations";
import {
  type ReorderListItem,
  haveReorderValuesChanged,
  syncReorderItems
} from "@/lib/reorder-items";
import { useReorderNodeInternalsRefresh } from "@/hooks/use-reorder-node-internals-refresh";

type Props = Pick<NodeProps<StoryInfoGraphNode>, "data" | "selected" | "dragging">;
const emptyRedirectTriggers: RedirectTrigger[] = [];

function areRedirectTriggersEqual(left: RedirectTrigger, right: RedirectTrigger) {
  return (
    left.targetId === right.targetId
    && (left.condition ?? "") === (right.condition ?? "")
  );
}

const StoryInfoNode = memo(function StoryInfoNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const editingOrDragging = nodeEditing || dragging;

  const hasLanguage = !!data.language;
  const storyData = data.data as StoryData | undefined;
  const redirectTriggers = storyData?.redirectTriggers;
  const resolvedRedirectTriggers = redirectTriggers ?? emptyRedirectTriggers;
  const nextTriggerIdRef = useRef(0);
  const [redirectTriggerItems, setRedirectTriggerItems] = useState<ReorderListItem<RedirectTrigger>[]>(() =>
    resolvedRedirectTriggers.map(redirectTrigger => ({
      id: `redirect-trigger-item-${data.id}-${nextTriggerIdRef.current++}`,
      value: redirectTrigger
    }))
  );
  const [redirectTriggersReordering, setRedirectTriggersReordering] = useState(false);
  const redirectTriggerItemsRef = useRef<ReorderListItem<RedirectTrigger>[]>(redirectTriggerItems);

  const updateTitle = (title: string) => {
    data.onChange?.({ ...data, title });
  };

  const updateDescription = (description: string) => {
    data.onChange?.({ ...data, description });
  };

  const updateCover = (cover: string) => {
    data.onChange?.({ ...data, cover });
  };

  const updateLanguage = (language: string) => {
    data.onChange?.({ ...data, language });
  };

  const updatePrefix = (prefix: string) => {
    data.onChange?.({ ...data, prefix });
  };

  const updateStoryDataField = <K extends keyof StoryData>(
    key: K,
    value: StoryData[K] | undefined
  ) => {
    const nextStoryData: StoryData = {
      ...(storyData ?? {})
    };

    if (value === undefined) {
      delete nextStoryData[key];
    } else {
      nextStoryData[key] = value;
    }

    data.onChange?.({
      ...data,
      data: Object.keys(nextStoryData).length ? nextStoryData : undefined
    });
  };

  const formatCountSummary = (count: number, singular: string, plural: string) => (
    count === 1
      ? `1 ${singular}`
      : `${count} ${plural}`
  );

  const shellActions = (
    <Button
      className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
      onClick={() => addRedirectTrigger(data)}
    >
      <Condition />
      {t("Add redirect trigger")}
    </Button>
  );

  useReorderNodeInternalsRefresh(data.id, redirectTriggerItems, redirectTriggersReordering);

  useLayoutEffect(() => {
    setRedirectTriggerItems(previousItems => {
      const nextItems = syncReorderItems(
        previousItems,
        resolvedRedirectTriggers,
        areRedirectTriggersEqual,
        () => `redirect-trigger-item-${data.id}-${nextTriggerIdRef.current++}`
      );

      if (
        previousItems.length === nextItems.length
        && previousItems.every((item, index) => item === nextItems[index])
      ) {
        redirectTriggerItemsRef.current = previousItems;
        return previousItems;
      }

      redirectTriggerItemsRef.current = nextItems;
      return nextItems;
    });
  }, [data.id, redirectTriggers, resolvedRedirectTriggers]);

  useEffect(() => {
    redirectTriggerItemsRef.current = redirectTriggerItems;
  }, [redirectTriggerItems]);

  function handleReorder(nextItems: ReorderListItem<RedirectTrigger>[]) {
    redirectTriggerItemsRef.current = nextItems;
    setRedirectTriggerItems(nextItems);
  }

  function handleReorderStart() {
    setRedirectTriggersReordering(true);
  }

  function handleReorderEnd() {
    setRedirectTriggersReordering(false);

    const reorderedTriggers = redirectTriggerItemsRef.current.map(item => item.value);

    if (haveReorderValuesChanged(redirectTriggerItemsRef.current, resolvedRedirectTriggers, areRedirectTriggersEqual)) {
      setRedirectTriggers(data, reorderedTriggers);
    }
  }

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.storyInfo.tw}
      actions={shellActions}
      spaceY="none"
      readonly={editingOrDragging}
    >
      <NodeTitle
        id={data.id}
        label={t(nodeLabels.storyInfo)}
      />

      <TextInput
        value={data.title}
        label={t("Title")}
        readonly={editingOrDragging}
        charLimit={250}
        onValueChanged={updateTitle}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <TextInput
        value={data.description}
        label={t("Description")}
        readonly={editingOrDragging}
        deletable={true}
        charLimit={1000}
        onValueChanged={updateDescription}
        onDeleted={() => updateDescription("")}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <TextInput
        value={data.cover}
        label={t("Cover")}
        readonly={editingOrDragging}
        deletable={true}
        charLimit={500}
        renderAsImage={true}
        onValueChanged={updateCover}
        onDeleted={() => updateCover("")}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <TextInput
        value={data.prefix}
        label={t("Prefix")}
        readonly={editingOrDragging}
        deletable={true}
        charLimit={500}
        onValueChanged={updatePrefix}
        onDeleted={() => updatePrefix("")}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <div>
        {hasLanguage &&
          <span className="text-xs opacity-50 font-bold ml-0.5">
            {t("Language")}
          </span>
        }
        <LanguageSelector
          className={`border border-black border-opacity-20 border-dashed bg-white bg-opacity-50 hover:bg-white hover:bg-opacity-50 ${!hasLanguage && "mt-1"}`}
          currentLanguageCode={data.language}
          disabled={editingOrDragging}
          languages={languages}
          onSelect={updateLanguage}
        />
      </div>

      <div className="flex flex-col gap-1 mt-1.5">
        <EditableStateInput
          label={t("Initial state")}
          emptyLabel={t("Initial data")}
          value={storyData?.init}
          defaultValue={{}}
          schema={stateInitSchema}
          readonly={editingOrDragging}
          rowCount={7}
          summaryFormatter={value => formatCountSummary(
            Object.keys(value).length,
            t("variable"),
            t("variables")
          )}
          onValueChanged={value => updateStoryDataField("init", value)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
        <EditableStateInput
          label={t("Condition definitions")}
          emptyLabel={t("Condition definitions")}
          value={storyData?.conditions}
          defaultValue={{}}
          schema={conditionDefinitionsSchema}
          readonly={editingOrDragging}
          rowCount={7}
          summaryFormatter={value => formatCountSummary(
            Object.keys(value).length,
            t("condition"),
            t("conditions")
          )}
          onValueChanged={value => updateStoryDataField("conditions", value)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
        <EditableStateInput
          label={t("Effect definitions")}
          emptyLabel={t("Effect definitions")}
          value={storyData?.effects}
          defaultValue={[]}
          schema={effectDefinitionsSchema}
          readonly={editingOrDragging}
          rowCount={8}
          summaryFormatter={value => formatCountSummary(
            value.length,
            t("effect"),
            t("effects")
          )}
          onValueChanged={value => updateStoryDataField("effects", value)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      </div>

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 py-1 relative -mr-2">
        <div className="flex items-center gap-2 break-words pr-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <Flag />
              <span className="min-w-0 break-words">
                {t("It starts with")}
              </span>
            </div>
          </div>
          <div className="shrink-0">
            <NodeRef id={data.startId} />
          </div>
        </div>
        <HandleOut id="0" connected={!!data.startId} />
      </div>


      {!!redirectTriggerItems.length && (
        <div className="mt-0.5 space-y-1">
          <span className="ml-0.5 text-xs font-bold opacity-50">
            {t("Redirect triggers")}
          </span>
          <Reorder.Group
            as="div"
            axis="y"
            className="flex flex-col gap-2"
            values={redirectTriggerItems}
            onReorder={handleReorder}
          >
            {redirectTriggerItems.map((item, index) => (
              <NodeTrigger
                key={item.id}
                value={item}
                trigger={item.value}
                index={index}
                deletable={true}
                readonly={editingOrDragging}
                interactionsDisabled={redirectTriggersReordering}
                reorderable={!editingOrDragging && redirectTriggerItems.length > 1}
                updateTrigger={updatedTrigger => updateRedirectTrigger(data, index, updatedTrigger)}
                deleteTrigger={() => deleteRedirectTrigger(data, index)}
                onReorderStart={handleReorderStart}
                onReorderEnd={handleReorderEnd}
                onEditStarted={startEdit}
                onEditFinished={finishEdit}
              />
            ))}
          </Reorder.Group>
        </div>
      )}
    </NodeShell>
  );
});

export default StoryInfoNode;
