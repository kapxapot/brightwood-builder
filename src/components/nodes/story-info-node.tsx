import { memo } from "react";
import type { NodeProps } from "reactflow";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import type { StoryInfoGraphNode } from "../../entities/story-node";
import { colors, languages, nodeLabels } from "../../lib/constants";
import NodeRef from "../node-parts/node-ref";
import TextInput from "../core/text-input";
import HandleOut from "../node-parts/handle-out";
import NodeShell from "../node-parts/node-shell";
import { Flag } from "../core/icons";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../language-selector";
import type { StoryData } from "@/entities/story-data";
import {
  conditionDefinitionsSchema,
  effectDefinitionsSchema,
  redirectTriggersSchema,
  stateInitSchema
} from "@/schemas/story-data-schema";
import EditableStateInput from "../node-parts/editable-state-input";

type Props = Pick<NodeProps<StoryInfoGraphNode>, "data" | "selected" | "dragging">;

const StoryInfoNode = memo(function StoryInfoNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const editingOrDragging = nodeEditing || dragging;

  const hasLanguage = !!data.language;
  const storyData = data.data as StoryData | undefined;

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

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.storyInfo.tw}
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
        <EditableStateInput
          label={t("Redirect triggers")}
          emptyLabel={t("Redirect triggers")}
          value={storyData?.redirectTriggers}
          defaultValue={[]}
          schema={redirectTriggersSchema}
          readonly={editingOrDragging}
          rowCount={6}
          summaryFormatter={value => formatCountSummary(
            value.length,
            t("trigger"),
            t("triggers")
          )}
          onValueChanged={value => updateStoryDataField("redirectTriggers", value)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      </div>

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div className="flex items-center gap-2 break-words pr-1">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-start gap-1">
              <div className="shrink-0 pt-0.5">
                <Flag />
              </div>
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
    </NodeShell>
  );
});

export default StoryInfoNode;
