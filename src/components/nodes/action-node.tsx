import { memo } from "react";
import type { ActionStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeAction from "../node-parts/node-action";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addTextLine, deleteTextLine, updateTextLine } from "../../lib/node-data-mutations";
import HandleIn from "../node-parts/handle-in";
import { addAction, deleteAction, updateAction } from "../../lib/action-mutations";

interface Props {
  data: ActionStoryNode;
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.action.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? "Action"} />

      <NodeEffect effect={data.effect} />

      <NodeText
        text={data.text}
        readonly={nodeEditing}
        addLine={() => addTextLine(data)}
        updateLine={(index, updatedLine) => updateTextLine(data, index, updatedLine)}
        deleteLine={(index) => deleteTextLine(data, index)}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      {data.actions.map((action, index) =>
        <NodeAction
          key={index}
          index={index}
          action={action}
          deletable={true}
          updateAction={updatedAction => updateAction(data, index, updatedAction)}
          deleteAction={() => deleteAction(data, index)}
          nodeEditing={nodeEditing}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      )}

      <div>
        <Button
          onClick={() => addAction(data)}
          disabled={nodeEditing}
        >
          Add action ⚡
        </Button>
      </div>

      <HandleIn connected={false} />
    </NodeShell>
  );
});

export default ActionNode;
