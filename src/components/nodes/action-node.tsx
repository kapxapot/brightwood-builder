import { memo } from "react";
import type { ActionStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeAction from "../node-parts/node-action";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleIn from "../node-parts/handle-in";
import { addAction, deleteAction, updateAction } from "../../lib/action-mutations";

interface Props {
  data: ActionStoryNode;
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  const { nodeEditing, startEdit, finishEdit } = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.action.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? nodeLabels.action} />

      <NodeEffect effect={data.effect} />

      <NodeText
        data={data}
        readonly={nodeEditing}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      {data.actions.map((action, index) =>
        <NodeAction
          key={index}
          index={index}
          action={action}
          deletable={true}
          nodeEditing={nodeEditing}
          charLimit={100}
          updateAction={updatedAction => updateAction(data, index, updatedAction)}
          deleteAction={() => deleteAction(data, index)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      )}

      <div>
        <Button
          onClick={() => addAction(data)}
          disabled={nodeEditing}
        >
          Add action
        </Button>
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default ActionNode;
