import "reactflow/dist/base.css";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, ReactFlowProvider, type ReactFlowInstance, type Node } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import story from "../stories/test.json";
import { buildStoryGraph } from "../story-graph-builder";
import type { Story } from "../entities/story";

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
      return setEdges(edges => {
        // remove any existing edge from the source if it exists
        // find an existing edge
        const existingEdge = edges.find(
          e => e.source === conn.source && e.sourceHandle === conn.sourceHandle
        );

        if (existingEdge) {
          // update the node's data with new connection data
          setNodes(currentNodes => currentNodes.map(node => {
            if (node.id == conn.source) {
              // update the node's corresponding link
              const data = node.data;

              // modify it
              switch (data.type) {
                case "action":
                  const actions = data.actions.map(action => {
                    return action.id === Number(existingEdge.target)
                      ? { ...action, id: Number(conn.target) }
                      : action;
                  })

                  node.data = { ...data, actions };
                  break;

                case "redirect":
                  const links = data.links.map(link => {
                    return link.id === Number(existingEdge.target)
                      ? { ...link, id: Number(conn.target) }
                      : link;
                  });

                  node.data = { ...data, links };
                  break;

                case "skip":
                  node.data = {
                    ...data,
                    nextId: Number(conn.target)
                  };

                  break;
              }
            }

            return node;
          }));
        }

        // filter the existing edge from the resulting edges
        return addEdge(conn, edges.filter(e => e !== existingEdge));
      })
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
            fitView={fit}
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
