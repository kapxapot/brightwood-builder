import { load, save } from "@/lib/storage";
import { useState } from "react";

export function useExpanded(key: string, initial: boolean = false) {
  const initialExpanded = load<boolean>(key) ?? initial;
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpanded = () => {
    const newExpanded = !expanded;
    save(key, newExpanded);
    setExpanded(newExpanded);
  }

  return { expanded, toggleExpanded } as const;
}
