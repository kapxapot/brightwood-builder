export function useCharLimit(value: string, charLimit: number) {
  const hasCharLimit = charLimit > 0;
  const showCharLimit = hasCharLimit && (value.length > charLimit * 0.8);
  const valueTooLong = hasCharLimit && value.length > charLimit;

  return { hasCharLimit, showCharLimit, valueTooLong } as const;
}
