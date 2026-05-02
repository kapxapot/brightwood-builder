import { memo, useRef } from "react";
import type { SkipStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeRef from "../node-parts/node-ref";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleOut from "../node-parts/handle-out";
import { Skip } from "../core/icons";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { addTextLine } from "../../lib/node-data-mutations";

type Props = {
  data: SkipStoryNode;
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const hasEntryEffects = !!data.entryEffects?.length;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.skip.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? t(nodeLabels.skip)} />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        readonly={nodeEditing}
        showAddButton={false}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        readonly={nodeEditing}
        showAddButton={false}
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

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          onClick={() => addTextLine(data)}
          disabled={nodeEditing}
        >
          {t("Add text")}
        </Button>

        {!hasEntryEffects && (
          <Button
            onClick={() => entryEffectRef.current?.startEdit()}
            disabled={nodeEditing}
          >
            {t("Add entry effect")}
          </Button>
        )}
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default SkipNode;
