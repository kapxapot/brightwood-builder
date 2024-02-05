import { Action, ActionStoryNode } from "../entities/story-node";

export const addAction = (data: ActionStoryNode) => {
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

export const updateAction = (data: ActionStoryNode, updatedIndex: number, updatedAction: Action) => {
  data.onChange?.({
    ...data,
    actions: data.actions.map(
      (action, index) => index === updatedIndex ? updatedAction : action
    )
  });
};

export const deleteAction = (data: ActionStoryNode, index: number) => {
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
