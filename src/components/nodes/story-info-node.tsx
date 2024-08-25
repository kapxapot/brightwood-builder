import { memo } from "react";
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
import { LanguageSelector } from "../language-selector";

type Props = {
  data: StoryInfoGraphNode;
  selected: boolean;
}

const StoryInfoNode = memo(function StoryInfoNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);

  const hasLanguage = !!data.language;

  const updateTitle = (title: string) => {
    data.onChange?.({ ...data, title });
  };

  const updateDescription = (description: string) => {
    data.onChange?.({ ...data, description });
  };

  const updateLanguage = (language: string) => {
    data.onChange?.({ ...data, language });
  };

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.storyInfo.tw}
      spaceY="none"
    >
      <NodeTitle id={data.id} label={t(nodeLabels.storyInfo)} />

      <TextInput
        value={data.title}
        label={t("Title")}
        readonly={nodeEditing}
        charLimit={250}
        onValueChanged={updateTitle}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <TextInput
        value={data.description}
        label={t("Description")}
        readonly={nodeEditing}
        charLimit={1000}
        onValueChanged={updateDescription}
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
          disabled={nodeEditing}
          languages={languages}
          onSelect={updateLanguage}
        />
      </div>

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div className="flex gap-1">
          <Flag />
          <span>
            {t("It starts with")}
          </span>
          <NodeRef id={data.startId} />
        </div>
        <HandleOut id="0" connected={!!data.startId} />
      </div>
    </NodeShell>
  );
});

export default StoryInfoNode;
