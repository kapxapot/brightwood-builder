import type { Data } from "./data";
import type { Node } from "./node";

export type Story = {
  title: string;
  description?: string;
  startId: number;
  prefix?: string;
  data?: Data;
  nodes: Node[];
};
