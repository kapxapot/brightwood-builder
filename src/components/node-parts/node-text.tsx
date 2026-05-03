import { Reorder } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StoryNode } from "../../entities/story-node";
import { toArray } from "../../lib/common";
import { addTextLine, deleteTextLine, setTextLines, updateTextLine } from "../../lib/node-data-mutations";
import Button from "../core/button";
import NodeTextLine from "./node-text-line";

type LineItem = {
  id: string;
  line: string;
};

function syncLineItems(previousItems: LineItem[], lines: string[], nextId: () => string): LineItem[] {
  const usedIndexes = new Set<number>();

  return lines.map((line, index) => {
    const samePositionItem = previousItems[index];

    if (samePositionItem && samePositionItem.line === line && !usedIndexes.has(index)) {
      usedIndexes.add(index);
      return samePositionItem;
    }

    const matchingIndex = previousItems.findIndex(
      (item, itemIndex) => !usedIndexes.has(itemIndex) && item.line === line
    );

    if (matchingIndex >= 0) {
      usedIndexes.add(matchingIndex);
      return previousItems[matchingIndex];
    }

    if (samePositionItem && previousItems.length === lines.length && !usedIndexes.has(index)) {
      usedIndexes.add(index);

      return {
        ...samePositionItem,
        line
      };
    }

    return {
      id: nextId(),
      line
    };
  });
}

function hasLineOrderChanged(items: LineItem[], lines: string[]) {
  return (
    items.length !== lines.length
    || items.some((item, index) => item.line !== lines[index])
  );
}

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
  const nextLineIdRef = useRef(0);
  const [lineItems, setLineItems] = useState<LineItem[]>(() =>
    lines.map(line => ({
      id: `text-line-${data.id}-${nextLineIdRef.current++}`,
      line
    }))
  );
  const [isReordering, setIsReordering] = useState(false);
  const lineItemsRef = useRef<LineItem[]>(lineItems);

  useLayoutEffect(() => {
    const nextLines = toArray(text);

    setLineItems(previousItems => {
      const nextItems = syncLineItems(
        previousItems,
        nextLines,
        () => `text-line-${data.id}-${nextLineIdRef.current++}`
      );

      if (
        previousItems.length === nextItems.length
        && previousItems.every((item, index) => item === nextItems[index])
      ) {
        lineItemsRef.current = previousItems;
        return previousItems;
      }

      lineItemsRef.current = nextItems;
      return nextItems;
    });
  }, [data.id, text]);

  useEffect(() => {
    lineItemsRef.current = lineItems;
  }, [lineItems]);

  function handleReorder(nextItems: LineItem[]) {
    lineItemsRef.current = nextItems;
    setLineItems(nextItems);
  }

  function handleReorderStart() {
    setIsReordering(true);
  }

  function handleReorderEnd() {
    setIsReordering(false);

    const reorderedLines = lineItemsRef.current.map(item => item.line);

    if (hasLineOrderChanged(lineItemsRef.current, lines)) {
      setTextLines(data, reorderedLines);
    }
  }

  return (
    <>
      <Reorder.Group
        as="div"
        axis="y"
        className="flex flex-col gap-2"
        values={lineItems}
        onReorder={handleReorder}
      >
        {lineItems.map((item, index) =>
          <NodeTextLine
            key={item.id}
            value={item}
            index={index}
            line={item.line}
            deletable={allowEmpty || lineItems.length > 1}
            expanded={expanded}
            readonly={readonly}
            interactionsDisabled={isReordering}
            charLimit={1000}
            reorderable={!readonly && lineItems.length > 1}
            updateLine={updatedLine => updateTextLine(data, index, updatedLine)}
            deleteLine={() => deleteTextLine(data, index)}
            onReorderStart={handleReorderStart}
            onReorderEnd={handleReorderEnd}
            onEditStarted={onEditStarted}
            onEditFinished={onEditFinished}
          />
        )}
      </Reorder.Group>

      {showAddButton && (
        <Button
          onClick={() => addTextLine(data)}
          disabled={readonly || isReordering}
        >
          {t("Add text")}
        </Button>
      )}
    </>
  );
}
