import "reactflow/dist/base.css";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type Edge, ReactFlowProvider, type ReactFlowInstance, type Node } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import mysteryStory from "../stories/mystery.json";
import { buildStoryGraph } from "../story-graph-builder";
import type { Story } from "../entities/story";

const nodeTypes = {
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

const positions = [
  { id: 1, x: 50, y: 50 },
  { id: 2, x: 650, y: 50 },
  { id: 3, x: 350, y: 50 },
  { id: 5, x: 950, y: 50 },
  { id: 6, x: 950, y: 250 },
  { id: 7, x: 1250, y: 335 },
  { id: 8, x: 1250, y: 500 },
  { id: 9, x: 3650, y: 400 },
  { id: 10, x: 1550, y: 250 },
  { id: 11, x: 1850, y: 400 },
  { id: 12, x: 2150, y: 400 },
  { id: 13, x: 2450, y: 300 },
  { id: 14, x: 2750, y: 700 },
  { id: 15, x: 3050, y: 500 },
  { id: 16, x: 3050, y: 800 },
  { id: 17, x: 3350, y: 800 },
  { id: 18, x: 3650, y: 800 },
  { id: 19, x: 2750, y: 300 },
];

const storyGraph = buildStoryGraph(mysteryStory as Story, positions);

let maxNodeId = Math.max(...storyGraph.nodes.map(n => n.data.id));
const getNextId = () => String(++maxNodeId);

export default function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(storyGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storyGraph.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper?.current || !reactFlowInstance) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeId = getNextId();

      const newNode: Node = {
        id: nodeId,
        type,
        position,
        data: { id: Number(nodeId), type, text: "Some text" }
      };

      setNodes(nodes => nodes.concat(newNode));
    },
    [reactFlowInstance]
  );

  return (
    <div className="h-screen w-screen flex flex-row flex-grow">
      <ReactFlowProvider>
        <Toolbar />
        <div className="flex-grow w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            deleteKeyCode={"Delete"}
            className="bg-gray-100"
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap zoomable pannable />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
