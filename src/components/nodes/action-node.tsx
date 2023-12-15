import { memo } from 'react';
import type { Action, ActionStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import Button from '../core/button';
import NodeAction from '../node-parts/node-action';
import { toArray } from '../../lib/common';

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

  const addTextLine = () => {
    data.onChange?.({
      ...data,
      text: [
        ...toArray(data.text),
        ""
      ]
    });
  };

  const updateTextLine = (updatedIndex: number, updatedLine: string) => {
    data.onChange?.({
      ...data,
      text: toArray(data.text).map(
        (line, index) => index === updatedIndex ? updatedLine : line
      )
    });
  };

  const deleteTextLine = (index: number) => {
    data.onChange?.(
      {
        ...data,
        text: toArray(data.text).toSpliced(index, 1)
      }
    );
  };

  return (
    <NodeShell
      selected={selected}
      className={Colors.action}
      data={data}
      label="Action"
      addTextLine={addTextLine}
      updateTextLine={updateTextLine}
      deleteTextLine={deleteTextLine}
    >
      <div className="mt-2 space-y-2">
        {data.actions.map((action, index) =>
          <NodeAction
            action={action}
            index={index}
            deletable={data.actions.length > 1}
            updateAction={updatedAction => updateAction(index, updatedAction)}
            deleteAction={() => deleteAction(index)}
            key={index}
          />
        )}
        <Button onClick={addAction}>Add action ⚡</Button>
      </div>
    </NodeShell>
  );
});

export default ActionNode;
