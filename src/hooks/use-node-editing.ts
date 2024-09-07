import { GraphNode } from "@/entities/story-node";
import { useEffect, useState } from "react";

export function useNodeEditing(data: GraphNode) {
  const [init, setInit] = useState(false);
  const [nodeEditing, setNodeEditing] = useState(false);

  const startEdit = () => setNodeEditing(true);
  const finishEdit = () => setNodeEditing(false);

  useEffect(
    () => {
      if (init) {
        finishEdit();
      } else {
        setInit(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  return { nodeEditing, startEdit, finishEdit } as const;
}
