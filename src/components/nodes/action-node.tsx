import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeTitle from '../node-parts/node-title';
import NodeText from '../node-parts/node-text';

interface Props {
  data: Partial<ActionStoryNode>,
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  return (
    <NodeShell selected={selected} className={Colors.action}>
      <NodeTitle id={data.id} label={data.label ?? "Action"} />
      <NodeText text={data.text} />

      <Handle type="target" position={Position.Left} className="bg-slate-600" />
      <Handle type="source" position={Position.Right} className="bg-slate-600" />
    </NodeShell>
  );
});

export default ActionNode;
