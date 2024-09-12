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
