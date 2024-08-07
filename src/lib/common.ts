export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || typeof value === "undefined") {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export const isEmpty = <T>(array: T[]) => array.length === 0;

export function truncateId(id: string): string {
  return id.split("-")[0];
}
