import { memo } from 'react';
import type { FinishStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';

interface Props {
  data: FinishStoryNode;
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  return (
    <NodeShell
      selected={selected}
      className={Colors.finish}
      data={data}
      label="Finish"
      allowNoText={true}
    />
  );
});

export default FinishNode;
