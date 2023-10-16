import "reactflow/dist/base.css";
import { useCallback, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type Edge, ReactFlowProvider, type ReactFlowInstance, type Node } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";

const nodeTypes = {
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

const initialNodes = [
  {
    id: "1",
    type: "action",
    position: { x: 100, y: 100 },
    data: {
      id: 1,
      type: "action",
      label: "Начало",
      text: [
        "Ты гуляешь с Эмили и Робертом. Внезапно Роберт говорит:",
        "— Дальше не пойдем."
      ],
      actions: [
        {
          id: 3,
          label: "Почему?"
        }
      ]
    }
  },
  {
    id: "2",
    type: "action",
    position: { x: 400, y: 200 },
    data: {
      id: 2,
      type: "action",
      label: "Мама исчезла",
      text: "Ты приш{ел|ла} домой. Исчезла твоя мама.",
      actions: [
        {
          id: 5,
          label: "Пойти в полицию"
        },
        {
          id: 6,
          label: "Пойти в тайную местность"
        }
      ]
    }
  },
  {
    id: "3",
    type: "action",
    position: { x: 700, y: 300 },
    data: {
      id: 3,
      type: "action",
      label: "Там тайная местность",
      text: [
        "Роберт:",
        "— Там тайная местность. Там исчезают люди."
      ],
      actions: [
        {
          id: 2,
          label: "Пойти домой"
        },
        {
          id: 6,
          label: "Пойдем туда!"
        }
      ]
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
    target: "3"
  },
];

let id = 4;
const getId = () => String(id++);

export default function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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

      const nodeId = getId();

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
