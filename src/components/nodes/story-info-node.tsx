import { memo } from "react";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import type { StoryInfoGraphNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeRef from "../node-parts/node-ref";
import TextInput from "../core/text-input";
import HandleOut from "../node-parts/handle-out";
import NodeShell from "../node-parts/node-shell";

interface Props {
  data: StoryInfoGraphNode;
  selected: boolean;
}

const StoryInfoNode = memo(function StoryInfoNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  const updateTitle = (title: string) => {
    data.onChange?.({ ...data, title });
  };

  const updateDescription = (description: string) => {
    data.onChange?.({ ...data, description });
  };

  return (
    <NodeShell
      selected={selected}
      color={colors.storyInfo.tw}
      spaceY="none"
    >
      <NodeTitle id={data.id} label="📚 Story" />

      <TextInput
        value={data.title}
        label="Title"
        readonly={nodeEditing}
        onValueChanged={updateTitle}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <TextInput
        value={data.description}
        label="Description"
        readonly={nodeEditing}
        onValueChanged={updateDescription}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div>🚩 It starts with <NodeRef id={data.startId} /></div>
        <HandleOut id="0" connected={!!data.startId} />
      </div>
    </NodeShell>
  );
});

export default StoryInfoNode;
