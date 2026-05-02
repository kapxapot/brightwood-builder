import { memo, useRef, useState } from "react";
import type { FinishStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { addTextLine } from "../../lib/node-data-mutations";

type Props = {
  data: FinishStoryNode;
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const [textExpanded, setTextExpanded] = useState(false);
  const hasEntryEffects = !!data.entryEffects?.length;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.finish.tw}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.finish)}
        expanded={textExpanded}
        onToggleExpanded={() => setTextExpanded(current => !current)}
      />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        readonly={nodeEditing}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        expanded={textExpanded}
        readonly={nodeEditing}
        showAddButton={false}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      {selected && (
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
      )}

      <HandleIn />
    </NodeShell>
  );
});

export default FinishNode;
