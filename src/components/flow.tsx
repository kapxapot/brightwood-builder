import "reactflow/dist/base.css";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type ReactFlowInstance, type Node, type Edge, type OnSelectionChangeParams, useKeyPress, useReactFlow } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import importStory from "../stories/test.json";
import { StoryGraph, buildStoryGraph, defaultViewport } from "../builders/story-graph-builder";
import type { Story, StoryShortcut } from "../entities/story";
import { removeConnections, updateConnection } from "../lib/node-operations";
import { isAllowedConnection, isDeletable } from "../lib/node-checks";
import type { GraphNode, NodeEvent, OnChangeHandler, StoryInfoGraphNode, StoryNode, StoryNodeType } from "../entities/story-node";
import StoryInfoNode from "./nodes/story-info-node";
import { buildNodeData } from "../builders/node-builder";
import { colors } from "../lib/constants";
import { load, save } from "../lib/storage";
import { useToast } from "./ui/use-toast";

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

const storyKey = (storyId: string) => `story-${storyId}`;

function updateStoryList(storyId: string, storyTitle: string) {
  let stories = (load('stories') ?? []) as StoryShortcut[];

  const oldStory = stories.find(s => s.id === storyId);

  const newStory = {
    id: storyId,
    title: storyTitle
  };

  if (!oldStory) {
    stories.push(newStory);
  } else {
    stories = stories.map(s => s.id === storyId ? newStory : s);
  }

  save('stories', stories);
}

export default function Flow({ fit }: Props) {
  const { toast } = useToast();

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { setViewport } = useReactFlow();

  function initStoryGraph(story: Story, changeHandler: OnChangeHandler) {
    const reStory = load<StoryGraph>(storyKey(story.id));

    if (!reStory) {
      return buildStoryGraph(story, changeHandler);
    }

    return {
      nodes: reStory.nodes.map(node => {
        node.data.onChange = changeHandler;

        return node;
      }),
      edges: reStory.edges,
      viewport: reStory.viewport
    };
  }

  const story = importStory as Story;
  const { nodes: initialNodes, edges: initialEdges, viewport = defaultViewport } = initStoryGraph(
    story,
    (data, event) => onNodeDataChange(data, event)
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setViewport(viewport);
  }, [setViewport, viewport]);

  const [selectedNodes, setSelectedNodes] = useState([] as Node[]);
  const [selectedEdges, setSelectedEdges] = useState([] as Edge[]);

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
    [nodes, setNodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodeEventHandler = useCallback(
    (nodeId: string, event: NodeEvent) => {
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
    },
    [setEdges]
  );

  const onNodeDataChange: OnChangeHandler = useCallback(
    (data: GraphNode, event?: NodeEvent) => {
      if (event) {
        nodeEventHandler(String(data.id), event);
      }

      setNodes(curNodes => curNodes.map(node => {
        if (node.data.id === data.id) {
          node.data = data;
        }

        return node;
      }));
    },
    [setNodes, nodeEventHandler]
  );

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

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeId = Math.max(...nodes.map(n => n.data.id)) + 1;

      const newNode: Node<StoryNode> = {
        id: String(nodeId),
        type,
        dragHandle: '.custom-drag-handle',
        position,
        data: buildNodeData(nodeId, type as StoryNodeType, onNodeDataChange)
      };

      setNodes(curNodes => curNodes.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, onNodeDataChange]
  );

  const onEdgesDelete = useCallback(
    (curEdges: Edge[]) => {
      setNodes(curNodes => curNodes.map(node => {
        const nodeEdges = curEdges.filter(e => e.source === node.id);

        return nodeEdges.length
          ? removeConnections(node, nodeEdges)
          : node;
      }));
    },
    [setNodes]
  );

  const selectionChangeHandler = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodes(params.nodes);
      setSelectedEdges(params.edges);
    },
    []
  );

  const deleteEdges = useCallback(
    (selector: (edge: Edge) => boolean) => {
      setEdges(curEdges => {
        const edgesToDelete = curEdges.filter(selector);

        if (edgesToDelete.length) {
          onEdgesDelete(edgesToDelete);
        }

        return curEdges.filter(e => !edgesToDelete.includes(e));
      });
     },
    [setEdges, onEdgesDelete]
  );

  const deletePressed = useKeyPress(["Delete", "Backspace"]);

  useEffect(function handleDelete() {
    // if storyInfo node is selected, do not allow deleting it
    // also do not allow deleting storyInfo edges if their targets are not deleted too
    const isNodeSelected = (node: Node) => selectedNodes.some(n => n.id === node.id);
    const isEdgeSelected = (edge: Edge) => selectedEdges.some(e => e.id === edge.id);

    deleteEdges(e => isEdgeSelected(e));

    setNodes(curNodes => {
      const nodesToDelete = curNodes.filter(n => isNodeSelected(n) && isDeletable(n));

      // find all the edges of the nodes to delete
      // delete these edges too
      deleteEdges(e => nodesToDelete.some(n => n.id === e.source || n.id === e.target));

      return curNodes.filter(n => !nodesToDelete.includes(n));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletePressed]);

  const saveStory = useCallback(() => {
    const storyInfoNode = nodes.find(n => n.data.type === "storyInfo");

    if (!storyInfoNode || !reactFlowInstance) {
      return;
    }

    const { uuid: storyId, title } = storyInfoNode.data as StoryInfoGraphNode;

    save(
      storyKey(storyId),
      reactFlowInstance.toObject()
    );

    updateStoryList(storyId, title);

    toast({ description: `✔ Story was successfully saved.` });
  }, [reactFlowInstance, nodes, toast]);

  function loadStory() {

  }

  return (
    <div className="w-screen h-screen flex flex-row flex-grow">
      <Toolbar
        onSave={saveStory}
        onLoad={loadStory}
      />
      <div className="flex-grow w-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onSelectionChange={selectionChangeHandler}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgesDelete={onEdgesDelete} // doesn't work currently
          deleteKeyCode={[]}
          className="bg-gray-100"
          nodeTypes={nodeTypes}
          fitView={fit}
        >
          <Controls />
          <MiniMap
            zoomable
            pannable
            nodeColor={n => n.type ? colors[n.type as StoryNodeType].rgb : "gray"}
          />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
