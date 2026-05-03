import { memo, useRef, useState } from "react";
import type { NodeProps } from "reactflow";
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
import { Collapse, Expand, Skip, Sparkles, Text } from "../core/icons";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { addTextLine } from "../../lib/node-data-mutations";

type Props = Pick<NodeProps<SkipStoryNode>, "data" | "selected" | "dragging">;

const SkipNode = memo(function SkipNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const [expanded, setExpanded] = useState(false);
  const editingOrDragging = nodeEditing || dragging;

  const shellActions = (
    <>
      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => setExpanded(current => !current)}
      >
        {expanded ? (
          <>
            <Collapse />
            <span>{t("Collapse")}</span>
          </>
        ) : (
          <>
            <Expand />
            <span>{t("Expand")}</span>
          </>
        )}
      </Button>

      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => addTextLine(data)}
      >
        <Text />
        {t("Add text")}
      </Button>

      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => entryEffectRef.current?.startEdit()}
      >
        <Sparkles />
        {t("Add entry effect")}
      </Button>
    </>
  );

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.skip.tw}
      actions={shellActions}
      readonly={editingOrDragging}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.skip)}
      />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        expanded={expanded}
        readonly={editingOrDragging}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        expanded={expanded}
        readonly={editingOrDragging}
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
      <HandleIn />
    </NodeShell>
  );
});

export default SkipNode;
