import { memo } from "react";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import { Handle, Position } from "reactflow";
import type { StoryInfoGraphNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeRef from "../node-parts/node-ref";
import TextInput from "../core/text-input";

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
    <div className={`p-2 space-y-2 shadow-md rounded-md border w-[250px] ${selected ? "border-stone-600" : "border-stone-400"} cursor-default ${colors.storyInfo}`}>
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
      <div className="text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div>🚩 It starts with <NodeRef id={data.startId} /></div>
        <Handle
          id="0"
          type="source"
          position={Position.Right}
          className="bg-slate-600 w-[7px] h-[7px] rounded"
        />
      </div>
    </div>
  );
});

export default StoryInfoNode;
