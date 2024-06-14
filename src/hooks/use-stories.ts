import { fetchStories } from "@/lib/storage";
import { useState } from "react";

export function useStories() {
  const [stories, setStories] = useState(fetchStories());

  const reloadStories = () => setStories(fetchStories());

  return { stories, reloadStories } as const;
}
