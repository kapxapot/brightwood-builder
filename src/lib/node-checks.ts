import type { Connection } from "reactflow";
import type { NodeType } from "./types";

export function isAllowedConnection(conn: Connection, nodes: NodeType[]): boolean {
  const sourceNode = nodes.find(n => n.id === conn.source);
  const targetNode = nodes.find(n => n.id === conn.target);

  if (sourceNode && sourceNode === targetNode && sourceNode.data.type === "skip") {
    return false;
  }

  return true;
}
