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
import type { GraphNode, NodeEvent, OnChangeHandler, StoryNode, StoryNodeType } from "../entities/story-node";
import StoryInfoNode from "./nodes/story-info-node";

interface Props {
  fit: boolean;
}

const nodeTypes = {
  storyInfo: StoryInfoNode,
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

export default function Flow({ fit }: Props) {
  const storyGraph = buildStoryGraph(story as Story, (data, event) => onNodeDataChange(data, event));

  let maxNodeId = Math.max(...storyGraph.nodes.map(n => n.data.id));
  const getNextId = () => String(++maxNodeId);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(storyGraph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storyGraph.edges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!isAllowedConnection(conn, nodes)) {
        return;
      }

      setEdges(curEdges => {
        // remove any existing edge from the source if it exists
        // find an existing edge
        const existingEdge = curEdges.find(
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
          curEdges.filter(e => e !== existingEdge)
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

      const newNode: Node<StoryNode> = {
        id: nodeId,
        type,
        dragHandle: '.custom-drag-handle',
        position,
        data: buildNodeData(Number(nodeId), type as StoryNodeType)
      };

      setNodes(curNodes => curNodes.concat(newNode));
    },
    [reactFlowInstance]
  );

  const buildNodeData = (id: number, type: StoryNodeType): StoryNode => {
    switch (type) {
      case "action":
        return {
          id,
          type,
          text: "",
          actions: [],
          onChange: onNodeDataChange
        };

      case "skip":
        return {
          id,
          type,
          text: "",
          onChange: onNodeDataChange
        };

      case "redirect":
        return {
          id,
          type,
          text: "",
          links: [],
          onChange: onNodeDataChange
        };

      case "finish":
        return {
          id,
          type,
          onChange: onNodeDataChange
        };
    }
  };

  const onNodeDataChange: OnChangeHandler = (data: GraphNode, event?: NodeEvent) => {
    if (event) {
      nodeEventHandler(String(data.id), event);
    }

    setNodes(curNodes => curNodes.map(node => {
      if (node.data.id === data.id) {
        node.data = data;
      }

      return node;
    }));
  };

  const nodeEventHandler = (nodeId: string, event: NodeEvent) => {
    switch (event.type) {
      case "handleRemoved":
        // if the node's handle was removed, remove the corresponding edges
        setEdges(curEdges => {
            // remove the edge with the handler
            const filteredEdges = curEdges.filter(
              edge => edge.source !== nodeId || edge.sourceHandle !== event.handle
            );

            // update handlers for next edges (make them -1)
            return filteredEdges.map(edge => {
              const numHandle = Number(edge.sourceHandle);

              return (edge.source !== nodeId || numHandle < Number(event.handle))
                ? edge
                : {
                  ...edge,
                  sourceHandle: String(numHandle - 1)
                }
            });
          }
        );

        break;
    }
  };

  const onEdgesDelete = useCallback(
    (curEdges: Edge[]) => {
      setNodes(curNodes => curNodes.map(node => {
        const nodeEdges = curEdges.filter(e => e.source === node.id);

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
            deleteKeyCode="Delete"
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
                  case "storyInfo":
                    return "rgb(243, 232, 255)";

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
