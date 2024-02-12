import type { Node } from "reactflow";
import type { GraphNode } from "../entities/story-node";

export type NodeType = Node<GraphNode, string | undefined>;

export type Side = "right" | "left" | "top" | "bottom";
