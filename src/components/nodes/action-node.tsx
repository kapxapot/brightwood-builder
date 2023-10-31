import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Action, ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: Partial<ActionStoryNode>,
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  const hasActions = data.actions && data.actions.length;

  function actionStr(action: Action): string {
    return String(action.id);
  }

  return (
    <NodeShell
      selected={selected}
      className={Colors.action}
      data={data}
      label="Action"
    >
      {hasActions && data.actions?.map((action, index) => (
        <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-green-300 py-1 relative -mr-2" key={index}>
          <div>⚡ {action.label}&nbsp;<NodeRef id={action.id} /></div>
          <Handle id={actionStr(action)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
        </div>
      ))}
    </NodeShell>
  );
});

export default ActionNode;
