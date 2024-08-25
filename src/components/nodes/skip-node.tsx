import { memo } from "react";
import type { SkipStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeRef from "../node-parts/node-ref";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleOut from "../node-parts/handle-out";
import { Skip } from "../core/icons";
import { useTranslation } from "react-i18next";

type Props = {
  data: SkipStoryNode;
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.skip.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? t(nodeLabels.skip)} />

      <NodeEffect effect={data.effect} />

      <NodeText
        data={data}
        readonly={nodeEditing}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <div className="text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div className="flex gap-1">
          <Skip />
          <span>
            {t("Skips to")}
          </span>
          <NodeRef id={data.nextId} />
        </div>
        <HandleOut connected={!!data.nextId} />
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default SkipNode;
