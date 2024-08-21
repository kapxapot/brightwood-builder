import { GraphNode } from "@/entities/story-node";
import { useEffect, useState } from "react";

export function useNodeEditing(data: GraphNode) {
  const [nodeEditing, setNodeEditing] = useState(false);

  const startEdit = () => setNodeEditing(true);
  const finishEdit = () => setNodeEditing(false);

  useEffect(() => finishEdit(), [data]);

  return { nodeEditing, startEdit, finishEdit } as const;
}
