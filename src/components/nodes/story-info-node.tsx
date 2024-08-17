import { memo } from "react";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import type { StoryInfoGraphNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeRef from "../node-parts/node-ref";
import TextInput from "../core/text-input";
import HandleOut from "../node-parts/handle-out";
import NodeShell from "../node-parts/node-shell";
import { Flag } from "../core/icons";
import { Trans, useTranslation } from "react-i18next";
import { LanguageSelector } from "../language-selector";

interface Props {
  data: StoryInfoGraphNode;
  selected: boolean;
}

const StoryInfoNode = memo(function StoryInfoNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing();

  const updateTitle = (title: string) => {
    data.onChange?.({ ...data, title });
  };

  const updateDescription = (description: string) => {
    data.onChange?.({ ...data, description });
  };

  return (
    <NodeShell
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

      <LanguageSelector expanded={true} />

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div className="flex gap-1">
          <Flag />
          <span>
            <Trans
              i18nKey="itStartsWithNode"
              components={[ <NodeRef id={data.startId} /> ]}
            >
              It starts with <NodeRef id={data.startId} />
            </Trans>
          </span>
        </div>
        <HandleOut id="0" connected={!!data.startId} />
      </div>
    </NodeShell>
  );
});

export default StoryInfoNode;
