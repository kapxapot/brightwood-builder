import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Action, ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeTitle from '../node-parts/node-title';
import NodeText from '../node-parts/node-text';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: Partial<ActionStoryNode>,
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  const hasActions = data.actions && data.actions.length;

  function actionStr(action: Action): string {
    return action.id ? String(action.id) : "?";
  }
  
  return (
    <NodeShell selected={selected} className={Colors.action}>
      <NodeTitle id={data.id} label={data.label ?? "Action"} />
      <NodeText text={data.text} />

      {hasActions && data.actions?.map(action => (
        <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-green-300 p-1 relative -mr-2">
          <div>⚡ {action.label}&nbsp;<NodeRef id={action.id} /></div>
          <Handle id={actionStr(action)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
        </div>
      ))}

      <Handle type="target" position={Position.Left} className="bg-slate-600 top-5" />
    </NodeShell>
  );
});

export default ActionNode;
