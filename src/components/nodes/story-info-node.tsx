import { memo } from 'react';
import { useNodeEditing } from '../../hooks/use-node-editing';
import NodeTitle from '../node-parts/node-title';
import { Handle, Position } from 'reactflow';
import type { StoryInfoGraphNode } from '../../entities/story-node';
import { colors } from '../../lib/constants';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: StoryInfoGraphNode;
  selected: boolean;
}

const StoryInfoNode = memo(function StoryInfoNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <div className={`p-2 shadow-md rounded-md border w-[250px] ${selected ? "border-stone-600" : "border-stone-400"} cursor-default ${colors.storyInfo}`}>
      <NodeTitle id={data.id} label="📚 Story" />
      {data.title &&
        <p>{data.title}</p>
      }
      {data.description &&
        <p>{data.description}</p>
      }
      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-purple-300 p-1 relative -mr-2">
        <div>🚩 It starts with <NodeRef id={data.startId} /></div>
        <Handle id="0" type="source" position={Position.Right} className="bg-slate-600" />
      </div>
    </div>
  );
});

export default StoryInfoNode;
