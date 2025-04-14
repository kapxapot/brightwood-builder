import { memo } from "react";
import type { ActionStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeAction from "../node-parts/node-action";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleIn from "../node-parts/handle-in";
import { addAction, deleteAction, moveActionDown, moveActionUp, updateAction } from "../../lib/action-mutations";
import { useTranslation } from "react-i18next";
import Button from "../core/button";

type Props = {
  data: ActionStoryNode;
  selected: boolean;
  dragging?: boolean;
};

const ActionNode = memo(function ActionNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);

  const editingOrDragging = nodeEditing || dragging;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.action.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? t(nodeLabels.action)} />

      <NodeEffect effect={data.effect} />

      <NodeText
        data={data}
        readonly={editingOrDragging}
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

      <div>
        <Button
          onClick={() => addAction(data)}
          disabled={editingOrDragging}
        >
          {t("Add action")}
        </Button>
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default ActionNode;
