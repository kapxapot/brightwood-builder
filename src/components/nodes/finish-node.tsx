import { memo } from "react";
import type { FinishStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addTextLine, deleteTextLine, updateTextLine } from "../../lib/node-data-mutations";

interface Props {
  data: FinishStoryNode;
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.finish}
    >
      <NodeTitle id={data.id} label={data.label ?? "Finish"} />

      <NodeEffect effect={data.effect} />

      <NodeText
        text={data.text}
        allowEmpty={true}
        readonly={nodeEditing}
        addLine={() => addTextLine(data)}
        updateLine={(index, updatedLine) => updateTextLine(data, index, updatedLine)}
        deleteLine={(index) => deleteTextLine(data, index)}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <HandleIn connected={false} />
    </NodeShell>
  );
});

export default FinishNode;
