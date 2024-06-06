import { memo } from "react";
import type { FinishStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";

interface Props {
  data: FinishStoryNode;
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  const { nodeEditing, startEdit, finishEdit } = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.finish.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? "Finish"} />

      <NodeEffect effect={data.effect} />

      <NodeText
        data={data}
        allowEmpty={true}
        readonly={nodeEditing}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <HandleIn />
    </NodeShell>
  );
});

export default FinishNode;
