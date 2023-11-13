import "reactflow/dist/base.css";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, ReactFlowProvider, type ReactFlowInstance, type Node, type Edge } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import story from "../stories/test.json";
import { buildStoryGraph } from "../story-graph-builder";
import type { Story } from "../entities/story";
import { removeConnections, updateConnection } from "../lib/node-operations";
import { isAllowedConnection } from "../lib/node-checks";

interface Props {
  fit: boolean;
}

const nodeTypes = {
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

const storyGraph = buildStoryGraph(story as Story);

let maxNodeId = Math.max(...storyGraph.nodes.map(n => n.data.id));
const getNextId = () => String(++maxNodeId);

export default function Flow({ fit }: Props) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(storyGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storyGraph.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (conn: Connection) => {
      // console.log("Connection: ", conn);

      if (!isAllowedConnection(conn, nodes)) {
        return;
      }

      setEdges(edges => {
        // remove any existing edge from the source if it exists
        // find an existing edge
        const existingEdge = edges.find(
          e => e.source === conn.source && e.sourceHandle === conn.sourceHandle
        );

        // update the node's data with new connection data
        const sourceHandle = conn.sourceHandle;
        const target = conn.target;

        if (sourceHandle !== null && target !== null) {
          setNodes(curNodes => curNodes.map(node => {
            return node.id === conn.source
              ? updateConnection(node, sourceHandle, target)
              : node;
          }));
        }

        // filter the existing edge from the resulting edges
        return addEdge(
          conn,
          edges.filter(e => e !== existingEdge)
        );
      });
    },
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

  const onEdgesDelete = useCallback(
    (edges: Edge[]) => {
      // console.log('Edges deleted:', edges);

      setNodes(curNodes => curNodes.map(node => {
        const nodeEdges = edges.filter(e => e.source === node.id);

        return nodeEdges.length
          ? removeConnections(node, nodeEdges)
          : node;
      }));
    },
    []
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
            onEdgesDelete={onEdgesDelete}
            deleteKeyCode={"Delete"}
            className="bg-gray-100"
            nodeTypes={nodeTypes}
            fitView={fit}
          >
            <Controls />
            <MiniMap
              zoomable
              pannable
              nodeColor={n => {
                switch (n.type) {
                  case "action":
                    return "rgb(220, 252, 231)";

                  case "redirect":
                    return "rgb(254, 249, 195)";

                  case "skip":
                    return "rgb(207, 250, 254)";

                  case "finish":
                    return "rgb(254, 226, 226)";
                }

                return "gray";
              }}
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
}
