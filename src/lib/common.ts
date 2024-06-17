export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || typeof value === "undefined") {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export const isEmpty = <T>(array: T[]) => array.length === 0;

export function truncateId(id: string): string {
  const chunks = id.split("-");

  return (chunks.length > 1)
    ? `${chunks[0]}...`
    : chunks[0];
}
