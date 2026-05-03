import { Reorder } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import type { Action, ActionStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import NodeAction from "../node-parts/node-action";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import HandleIn from "../node-parts/handle-in";
import { addAction, deleteAction, setActions, updateAction } from "../../lib/action-mutations";
import { useTranslation } from "react-i18next";
import Button from "../core/button";
import { addTextLine } from "../../lib/node-data-mutations";
import { type ReorderListItem, haveReorderValuesChanged, syncReorderItems } from "../../lib/reorder-items";
import { useReorderNodeInternalsRefresh } from "@/hooks/use-reorder-node-internals-refresh";

type Props = {
  data: ActionStoryNode;
  selected: boolean;
  dragging?: boolean;
};

function areActionsEqual(left: Action, right: Action) {
  return (
    left.id === right.id
    && left.label === right.label
    && (left.condition ?? "") === (right.condition ?? "")
    && JSON.stringify(left.effects ?? []) === JSON.stringify(right.effects ?? [])
  );
}

const ActionNode = memo(function ActionNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const [textExpanded, setTextExpanded] = useState(false);
  const nextActionIdRef = useRef(0);
  const [actionItems, setActionItems] = useState<ReorderListItem<Action>[]>(() =>
    data.actions.map(action => ({
      id: `action-item-${data.id}-${nextActionIdRef.current++}`,
      value: action
    }))
  );
  const [actionsReordering, setActionsReordering] = useState(false);
  const actionItemsRef = useRef<ReorderListItem<Action>[]>(actionItems);

  const editingOrDragging = nodeEditing || dragging;
  const editingDraggingOrReordering = editingOrDragging || actionsReordering;
  const hasEntryEffects = !!data.entryEffects?.length;

  useReorderNodeInternalsRefresh(data.id, actionItems, actionsReordering);

  useEffect(() => {
    const nextActions = data.actions;

    setActionItems(previousItems => {
      const nextItems = syncReorderItems(
        previousItems,
        nextActions,
        areActionsEqual,
        () => `action-item-${data.id}-${nextActionIdRef.current++}`
      );

      if (
        previousItems.length === nextItems.length
        && previousItems.every((item, index) => item === nextItems[index])
      ) {
        actionItemsRef.current = previousItems;
        return previousItems;
      }

      actionItemsRef.current = nextItems;
      return nextItems;
    });
  }, [data.actions, data.id]);

  useEffect(() => {
    actionItemsRef.current = actionItems;
  }, [actionItems]);

  function handleReorder(nextItems: ReorderListItem<Action>[]) {
    actionItemsRef.current = nextItems;
    setActionItems(nextItems);
  }

  function handleReorderStart() {
    setActionsReordering(true);
  }

  function handleReorderEnd() {
    setActionsReordering(false);

    const reorderedActions = actionItemsRef.current.map(item => item.value);

    if (haveReorderValuesChanged(actionItemsRef.current, data.actions, areActionsEqual)) {
      setActions(data, reorderedActions);
    }
  }

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.action.tw}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.action)}
        expanded={textExpanded}
        onToggleExpanded={() => setTextExpanded(current => !current)}
      />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        readonly={editingOrDragging}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        expanded={textExpanded}
        readonly={editingOrDragging}
        showAddButton={false}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <Reorder.Group
        as="div"
        axis="y"
        className="flex flex-col gap-2"
        values={actionItems}
        onReorder={handleReorder}
      >
        {actionItems.map((item, index) =>
          <NodeAction
            key={item.id}
            value={item}
            index={index}
            action={item.value}
            deletable={true}
            readonly={editingOrDragging}
            interactionsDisabled={actionsReordering}
            charLimit={100}
            reorderable={!editingOrDragging && actionItems.length > 1}
            updateAction={updatedAction => updateAction(data, index, updatedAction)}
            deleteAction={() => deleteAction(data, index)}
            onReorderStart={handleReorderStart}
            onReorderEnd={handleReorderEnd}
            onEditStarted={startEdit}
            onEditFinished={finishEdit}
          />
        )}
      </Reorder.Group>

      {selected && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            onClick={() => addTextLine(data)}
            disabled={editingDraggingOrReordering}
          >
            {t("Add text")}
          </Button>
          <Button
            onClick={() => addAction(data)}
            disabled={editingDraggingOrReordering}
          >
            {t("Add action")}
          </Button>

          {!hasEntryEffects && (
            <Button
              onClick={() => entryEffectRef.current?.startEdit()}
              disabled={editingDraggingOrReordering}
            >
              {t("Add entry effect")}
            </Button>
          )}
        </div>
      )}

      <HandleIn />
    </NodeShell>
  );
});

export default ActionNode;
