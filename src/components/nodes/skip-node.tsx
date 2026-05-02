import { memo, useRef, useState } from "react";
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
  const [textExpanded, setTextExpanded] = useState(false);
  const hasEntryEffects = !!data.entryEffects?.length;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.skip.tw}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.skip)}
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

      <div className="text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div className="flex items-center gap-2 break-words pr-1">
          <div className="min-w-0 flex-1 flex items-center gap-1">
            <div className="shrink-0">
              <Skip />
            </div>
            <span className="min-w-0 break-words">
              {t("Skips to")}
            </span>
          </div>
          <div className="shrink-0">
            <NodeRef id={data.nextId} />
          </div>
        </div>
        <HandleOut connected={!!data.nextId} />
      </div>

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

export default SkipNode;
