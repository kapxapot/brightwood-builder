import { memo } from 'react';
import type { Action, ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import Button from '../core/button';
import NodeAction from '../node-parts/node-action';

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
          label: ""
        }
      ]
    });
  };

  const updateAction = (updatedIndex: number, updatedAction: Action) => {
    data.onChange?.({
      ...data,
      actions: data.actions.map(
        (action, index) => index === updatedIndex ? updatedAction : action
      )
    });
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
        {data.actions.map((action, index) =>
          <NodeAction
            key={index}
            index={index}
            action={action}
            deletable={data.actions.length > 1}
            updateAction={updatedAction => updateAction(index, updatedAction)}
            deleteAction={() => deleteAction(index)}
          />
        )}
        <Button onClick={addAction}>Add action ⚡</Button>
      </div>
    </NodeShell>
  );
});

export default ActionNode;
