import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';
import Button from '../core/button';

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
          label: ''
        }
      ]
    });
  };

  const editAction = (index: number) => {
    console.log(`Editing action ${index}...`);
  };

  const deleteAction = (index: number) => {
    data.onChange?.(
      {
        ...data,
        actions: data.actions.toSpliced(index, 1)
      },
      {
        type: "handleRemoved",
        handle: String(index)
      }
    );
  };

  return (
    <NodeShell
      selected={selected}
      className={Colors.action}
      data={data}
      label="Action"
    >
      <div className="mt-2 space-y-2">
        {data.actions.map((action, index) => (
          <div className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2" key={index}>
            <div>
              <div>⚡ {action.label || `Action ${index + 1}`}&nbsp;<NodeRef id={action.id} /></div>
              <Handle id={String(index)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
            </div>
            <div className="absolute right-2 inset-y-0 space-x-1 hidden group-hover:block">
              <Button onClick={() => editAction(index)}>Edit</Button>
              <Button onClick={() => deleteAction(index)}>Delete</Button>
            </div>
          </div>
        ))}
        <Button onClick={addAction}>Add action ⚡</Button>
      </div>
    </NodeShell>
  );
});

export default ActionNode;
