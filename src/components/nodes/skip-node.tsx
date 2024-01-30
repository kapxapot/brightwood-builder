import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { SkipStoryNode } from '../../entities/story-node';
import { colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';
import { useNodeEditing } from '../../hooks/use-node-editing';

interface Props {
  data: SkipStoryNode;
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      className={colors.skip}
      data={data}
      label="Skip"
      nodeEditing={nodeEditing}
      onEditStarted={startEdit}
      onEditFinished={finishEdit}
    >
      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div>🚀 Skips to <NodeRef id={data.nextId} /></div>
        <Handle id="0" type="source" position={Position.Right} className="bg-slate-600" />
      </div>
    </NodeShell>
  );
});

export default SkipNode;
