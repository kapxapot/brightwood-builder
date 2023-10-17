import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { SkipStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeTitle from '../node-parts/node-title';
import NodeText from '../node-parts/node-text';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: Partial<SkipStoryNode>,
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  function nextIdStr(nextId?: number): string {
    return !!nextId ? String(nextId) : "?";
  }

  return (
    <NodeShell selected={selected} className={Colors.skip}>
      <NodeTitle id={data.id} label={data.label ?? "Skip"} isStart={data.isStart} />
      <NodeText text={data.text} />

      <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-cyan-300 p-1 relative -mr-2">
        <div>🚀 <NodeRef id={data.nextId} /></div>
        <Handle id={nextIdStr(data.nextId)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
      </div>

      <Handle type="target" position={Position.Left} className="bg-slate-600 top-5" />
    </NodeShell>
  );
});

export default SkipNode;
