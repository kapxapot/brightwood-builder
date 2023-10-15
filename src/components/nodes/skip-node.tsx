import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { SkipStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-shell';
import NodeTitle from '../node-title';

interface Props {
  data: Partial<SkipStoryNode>,
  selected: boolean;
}

const SkipNode = memo(function SkipNode({ data, selected }: Props) {
  return (
    <NodeShell selected={selected} className={Colors.skip}>
      <NodeTitle id={data.id} label={data.label ?? "Skip"} />

      <Handle type="target" position={Position.Left} className="bg-slate-600" />
      <Handle type="source" position={Position.Right} className="bg-slate-600" />
    </NodeShell>
  );
});

export default SkipNode;
