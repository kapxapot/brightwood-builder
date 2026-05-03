import { type DragEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StoryNode } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import { addTextLine, deleteTextLine, moveTextLine, updateTextLine } from "../../lib/node-data-mutations";
import { colors } from "../../lib/constants";
import Button from "../core/button";
import NodeTextLine from "./node-text-line";

type Props = {
  data: StoryNode;
  allowEmpty?: boolean;
  expanded?: boolean;
  readonly?: boolean;
  showAddButton?: boolean;
  onEditStarted: () => void;
  onEditFinished: () => void;
};

export default function NodeText({
  data,
  allowEmpty,
  expanded = false,
  readonly,
  showAddButton = true,
  onEditStarted,
  onEditFinished
}: Props) {
  const { t } = useTranslation();

  const text = data.text;
  const lines = toArray(text);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropTargetClassName = colors[data.type].dropTargetTw;

  function handleDragStart(index: number, event: DragEvent<HTMLDivElement>) {
    setDraggedIndex(index);
    setDropIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
  }

  function handleDragEnter(index: number) {
    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    setDropIndex(index);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function clearDragState() {
    setDraggedIndex(null);
    setDropIndex(null);
  }

  function handleDrop(index: number, event: DragEvent<HTMLDivElement>) {
    event.preventDefault();

    if (draggedIndex === null) {
      clearDragState();
      return;
    }

    const sourceIndex = draggedIndex;

    clearDragState();

    if (sourceIndex !== index) {
      moveTextLine(data, sourceIndex, index);
    }
  }

  return (
    <>
      {lines.map((line, index) =>
        <NodeTextLine
          key={`${line}-${index}`}
          index={index}
          line={line}
          deletable={allowEmpty || lines.length > 1}
          expanded={expanded}
          readonly={readonly}
          charLimit={1000}
          reorderable={!readonly && lines.length > 1}
          isDragging={draggedIndex === index}
          isDropTarget={dropIndex === index && draggedIndex !== index}
          dropTargetClassName={dropTargetClassName}
          updateLine={updatedLine => updateTextLine(data, index, updatedLine)}
          deleteLine={() => deleteTextLine(data, index)}
          onDragStart={event => handleDragStart(index, event)}
          onDragEnter={() => handleDragEnter(index)}
          onDragOver={handleDragOver}
          onDrop={event => handleDrop(index, event)}
          onDragEnd={clearDragState}
          onEditStarted={onEditStarted}
          onEditFinished={onEditFinished}
        />
      )}

      {showAddButton && (
        <Button
          onClick={() => addTextLine(data)}
          disabled={readonly}
        >
          {t("Add text")}
        </Button>
      )}
    </>
  );
}
