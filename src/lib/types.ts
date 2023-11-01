import type { Node } from "reactflow";
import type { StoryNode } from "../entities/story-node";

export type NodeType = Node<StoryNode, string | undefined>;
