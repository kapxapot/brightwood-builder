import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-shell';
import NodeTitle from '../node-title';

interface Props {
  data: Partial<ActionStoryNode>,
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  return (
    <NodeShell selected={selected} className={Colors.action}>
      <NodeTitle id={data.id} label={data.label ?? "Action"} />

      <Handle type="target" position={Position.Left} className="bg-slate-600" />
      <Handle type="source" position={Position.Right} className="bg-slate-600" />
    </NodeShell>
  );
});

export default ActionNode;
