import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: ActionStoryNode;
  selected: boolean;
}

const ActionNode = memo(function ActionNode({ data, selected }: Props) {
  const addAction = () => {
    data.onChange?.({
      ...data,
      actions: [
        ...data.actions,
        {
          label: `Action ${data.actions.length + 1}`
        }
      ]
    });
  }

  return (
    <NodeShell
      selected={selected}
      className={Colors.action}
      data={data}
      label="Action"
    >
      {data.actions.map((action, index) => (
        <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-green-300 py-1 relative -mr-2" key={index}>
          <div>⚡ {action.label}&nbsp;<NodeRef id={action.id} /></div>
          <Handle id={String(index)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
        </div>
      ))}
      <div className="mt-2">
        <button onClick={addAction} className="border border-slate-400 px-2 pt-0.5 pb-1 rounded-lg text-sm bg-slate-50 hover:bg-white">Add action ⚡</button>
      </div>
    </NodeShell>
  );
});

export default ActionNode;
