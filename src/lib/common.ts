export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || typeof value === "undefined") {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export const isEmpty = <T>(array: T[]) => array.length === 0;

export const truncateId = (id: string) => id.split("-")[0];

export function titleOrTruncatedId(title: string | undefined, id: string) {
  return title ?? `${truncateId(id)}...`;
}

export function moveElementDown<T>(array: T[], index: number): T[] {
  if (index >= array.length - 1) {
    return [...array];
  }

  return [
    ...array.slice(0, index),
    array[index + 1],
    array[index],
    ...array.slice(index + 2)
  ];
}

export function moveElement<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex
    || fromIndex < 0
    || fromIndex >= array.length
    || toIndex < 0
    || toIndex >= array.length
  ) {
    return [...array];
  }

  const nextArray = [...array];
  const [element] = nextArray.splice(fromIndex, 1);

  nextArray.splice(toIndex, 0, element);

  return nextArray;
}

export function moveElementUp<T>(array: T[], index: number): T[] {
  if (index <= 0) {
    return [...array];
  }

  return [
    ...array.slice(0, index - 1),
    array[index],
    array[index - 1],
    ...array.slice(index + 1)
  ];
}
