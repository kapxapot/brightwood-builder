import { memo, useRef } from "react";
import type { ActionStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeAction from "../node-parts/node-action";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleIn from "../node-parts/handle-in";
import { addAction, deleteAction, moveActionDown, moveActionUp, updateAction } from "../../lib/action-mutations";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { addTextLine } from "../../lib/node-data-mutations";

type Props = {
  data: ActionStoryNode;
  selected: boolean;
  dragging?: boolean;
};

const ActionNode = memo(function ActionNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);

  const editingOrDragging = nodeEditing || dragging;
  const hasEntryEffects = !!data.entryEffects?.length;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.action.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? t(nodeLabels.action)} />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        readonly={editingOrDragging}
        showAddButton={false}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        readonly={editingOrDragging}
        showAddButton={false}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      {data.actions.map((action, index) =>
        <NodeAction
          key={index}
          index={index}
          action={action}
          deletable={true}
          nodeEditing={editingOrDragging}
          charLimit={100}
          isFirst={index === 0}
          isLast={index === data.actions.length - 1}
          updateAction={updatedAction => updateAction(data, index, updatedAction)}
          deleteAction={() => deleteAction(data, index)}
          moveActionDown={() => moveActionDown(data, index)}
          moveActionUp={() => moveActionUp(data, index)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          onClick={() => addTextLine(data)}
          disabled={editingOrDragging}
        >
          {t("Add text")}
        </Button>
        <Button
          onClick={() => addAction(data)}
          disabled={editingOrDragging}
        >
          {t("Add action")}
        </Button>

        {!hasEntryEffects && (
          <Button
            onClick={() => entryEffectRef.current?.startEdit()}
            disabled={editingOrDragging}
          >
            {t("Add entry effect")}
          </Button>
        )}
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default ActionNode;
