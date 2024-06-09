import { loadStories } from "@/lib/storage";
import { useState } from "react";

export function useStories() {
  const [stories, setStories] = useState(loadStories());

  const reloadStories = () => setStories(loadStories());

  return { stories, reloadStories } as const;
}
