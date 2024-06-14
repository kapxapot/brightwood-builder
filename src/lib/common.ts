export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === null || typeof value === "undefined") {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

export function truncateId(id: string): string {
  const chunks = id.split("-");
  return `${chunks[0]}...`;
}
