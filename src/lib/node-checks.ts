import type { Connection, Node } from "reactflow";
import type { NodeType } from "./types";
import type { GraphNode } from "../entities/story-node";

export function isAllowedConnection(conn: Connection, nodes: NodeType[]): boolean {
  const sourceNode = nodes.find(n => n.id === conn.source);
  const targetNode = nodes.find(n => n.id === conn.target);

  if (sourceNode && sourceNode === targetNode && sourceNode.data.type === "skip") {
    return false;
  }

  return true;
}

export function isDeletable(node: Node<GraphNode>): boolean {
  return node.data.type !== "storyInfo";
}
