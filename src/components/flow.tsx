import "reactflow/dist/base.css";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type Edge, ReactFlowProvider, type ReactFlowInstance, type Node } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import story from "../stories/test.json";
import { buildStoryGraph } from "../story-graph-builder";
import type { Story } from "../entities/story";

const nodeTypes = {
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

const storyGraph = buildStoryGraph(story as Story);

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
