import { memo, useRef, useState } from "react";
import type { NodeProps } from "reactflow";
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
import { Collapse, Expand, Sparkles, Text } from "../core/icons";

type Props = Pick<NodeProps<FinishStoryNode>, "data" | "selected" | "dragging">;

const FinishNode = memo(function FinishNode({ data, selected, dragging }: Props) {
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
      color={colors.finish.tw}
      selectedClassName={colors.finish.selectedTw}
      actions={shellActions}
      readonly={editingOrDragging}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.finish)}
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
      <HandleIn />
    </NodeShell>
  );
});

export default FinishNode;
