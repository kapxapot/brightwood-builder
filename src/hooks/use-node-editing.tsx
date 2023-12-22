import { useState } from "react";

export function useNodeEditing() {
  const [nodeEditing, setNodeEditing] = useState(false);
  const startEdit = () => setNodeEditing(true);
  const finishEdit = () => setNodeEditing(false);

  return [nodeEditing, startEdit, finishEdit] as const;
}
