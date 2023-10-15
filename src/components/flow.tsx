import "reactflow/dist/base.css";
import { useCallback } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type Edge, type DefaultEdgeOptions, Panel } from "reactflow";
import CustomNode from "./custom-node";

const nodeTypes = {
  custom: CustomNode
};

const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 100 },
    data: { name: "Jane Doe", job: "CEO", emoji: "😎" }
  },
  {
    id: "2",
    type: "custom",
    position: { x: 350, y: 150 },
    data: { name: "Tyler Weary", job: "Designer", emoji: "🤓" }
  },
  {
    id: "3",
    type: "custom",
    position: { x: 600, y: 100 },
    data: { name: "Kristi Price", job: "Developer", emoji: "🤩" }
  },
  {
    id: "4",
    position: { x: 300, y: 300 },
    data: {
      label: <div className="bg-red-200">Bare styled node</div>
    }
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2"
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    animated: true
  },
];

const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

export default function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        deleteKeyCode={"Delete"}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-gray-200"
        nodeTypes={nodeTypes}
      >
        <Panel position="top-left">I am a panel</Panel>
        <Controls />
        <MiniMap zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
