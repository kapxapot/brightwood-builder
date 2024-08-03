export function getSearchParams(...keys: string[]): Array<string | null> {
  const params = new URLSearchParams(location.search);

  return keys.reduce(
    (prev, cur) => [...prev, params.get(cur)],
    [] as Array<string | null>
  );
}

export function clearSearchParams() {
  if (location.search) {
    history.pushState({}, document.title, location.pathname);
  }
}
