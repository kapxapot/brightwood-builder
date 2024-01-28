import { memo } from 'react';
import type { FinishStoryNode } from '../../entities/story-node';
import { colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import { useNodeEditing } from '../../hooks/use-node-editing';

interface Props {
  data: FinishStoryNode;
  selected: boolean;
}

const FinishNode = memo(function FinishNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      className={colors.finish}
      data={data}
      label="Finish"
      allowNoText={true}
      nodeEditing={nodeEditing}
      onEditStarted={startEdit}
      onEditFinished={finishEdit}
    />
  );
});

export default FinishNode;
