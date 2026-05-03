export type ReorderListItem<T> = {
  id: string;
  value: T;
};

export function syncReorderItems<T>(
  previousItems: ReorderListItem<T>[],
  values: T[],
  areEqual: (left: T, right: T) => boolean,
  nextId: () => string
): ReorderListItem<T>[] {
  const usedIndexes = new Set<number>();

  return values.map((value, index) => {
    const samePositionItem = previousItems[index];

    if (samePositionItem && areEqual(samePositionItem.value, value) && !usedIndexes.has(index)) {
      usedIndexes.add(index);
      return samePositionItem;
    }

    const matchingIndex = previousItems.findIndex(
      (item, itemIndex) => !usedIndexes.has(itemIndex) && areEqual(item.value, value)
    );

    if (matchingIndex >= 0) {
      usedIndexes.add(matchingIndex);
      return previousItems[matchingIndex];
    }

    if (samePositionItem && previousItems.length === values.length && !usedIndexes.has(index)) {
      usedIndexes.add(index);

      return {
        ...samePositionItem,
        value
      };
    }

    return {
      id: nextId(),
      value
    };
  });
}

export function haveReorderValuesChanged<T>(
  items: ReorderListItem<T>[],
  values: T[],
  areEqual: (left: T, right: T) => boolean
) {
  return (
    items.length !== values.length
    || items.some((item, index) => !areEqual(item.value, values[index]))
  );
}
