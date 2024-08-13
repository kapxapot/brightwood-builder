import type { Node } from "reactflow";
import type { GraphNode } from "../entities/story-node";
import { TFunction } from "i18next";

export type NodeType = Node<GraphNode, string | undefined>;

export type Side = "right" | "left" | "top" | "bottom";

export type Translator = TFunction<"translation", undefined>;
