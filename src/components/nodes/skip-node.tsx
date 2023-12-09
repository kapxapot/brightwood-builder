import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { SkipStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: SkipStoryNode;
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  return (
    <NodeShell
      selected={selected}
      className={Colors.skip}
      data={data}
      label="Skip"
    >
      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div>🚀 <NodeRef id={data.nextId} /></div>
        <Handle id="0" type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
      </div>
    </NodeShell>
  );
});

export default SkipNode;
