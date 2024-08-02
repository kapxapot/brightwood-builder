import { useEffect } from "react";

export type SearchParams = {
  new: boolean;
  edit: string | null;
};

export function useSearchParams(): SearchParams {
  const params = new URLSearchParams(location.search);

  const resultParams = {
    new: params.get("new") !== null,
    edit: params.get("edit")
  } as const;

  useEffect(() => {
    if (location.search) {
      history.pushState({}, document.title, location.pathname);
    }
  }, []);

  return resultParams;
}
