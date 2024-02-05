import { memo } from "react";
import type { SkipStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeRef from "../node-parts/node-ref";
import { useNodeEditing } from "../../hooks/use-node-editing";
import HandleIn from "../node-parts/handle-in";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import { addTextLine, deleteTextLine, updateTextLine } from "../../lib/node-data-mutations";
import NodeText from "../node-parts/node-text";
import HandleOut from "../node-parts/handle-out";

interface Props {
  data: SkipStoryNode;
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.skip.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? "Skip"} />

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

      <div className="text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div>🚀 Skips to <NodeRef id={data.nextId} /></div>
        <HandleOut connected={!!data.nextId} />
      </div>

      <HandleIn connected={false} />
    </NodeShell>
  );
});

export default SkipNode;
