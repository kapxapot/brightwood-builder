import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { FinishStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-shell';
import NodeTitle from '../node-title';

interface Props {
  data: Partial<FinishStoryNode>,
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  return (
    <NodeShell selected={selected} className={Colors.finish}>
      <NodeTitle id={data.id} label={data.label ?? "Finish"} />

      <Handle type="target" position={Position.Left} className="bg-slate-600" />
    </NodeShell>
  );
});

export default FinishNode;
