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
    position: { x: 50, y: 50 },
    data: {
      id: 1,
      type: "action",
      label: "Начало",
      text: [
        "Ты гуляешь с Эмили и Робертом. Внезапно Роберт говорит:",
        "— Дальше не пойдем."
      ],
      actions: [
        { id: 3, label: "Почему?" }
      ]
    }
  },
  {
    id: "2",
    type: "action",
    position: { x: 650, y: 50 },
    data: {
      id: 2,
      type: "action",
      label: "Мама исчезла",
      text: "Ты приш{ел|ла} домой. Исчезла твоя мама.",
      actions: [
        { id: 5, label: "Пойти в полицию" },
        { id: 6, label: "Пойти в тайную местность" }
      ]
    }
  },
  {
    id: "3",
    type: "action",
    position: { x: 350, y: 50 },
    data: {
      id: 3,
      type: "action",
      label: "Там тайная местность",
      text: [
        "Роберт:",
        "— Там тайная местность. Там исчезают люди."
      ],
      actions: [
        { id: 2, label: "Пойти домой" },
        { id: 6, label: "Пойдем туда!" }
      ]
    }
  },
  {
    id: "5",
    type: "action",
    position: { x: 950, y: 50 },
    data: {
      id: 5,
      type: "action",
      label: "Лучше не идти",
      text: "— Лучше не идти, — говорит Роберт.",
      actions: [
        { id: 9, label: "Все равно пойти" },
        { id: 10, label: "Не идти!" }
      ]
    }
  },
  {
    id: "6",
    type: "action",
    position: { x: 950, y: 250 },
    data: {
      id: 6,
      type: "action",
      label: "Эмили не хочет",
      text: [
        "Ты предлагаешь Эмили и Роберту пойти в тайную местность.",
        "Эмили не хочет идти."
      ],
      actions: [
        { id: 7, label: "Трусиха!" },
        { id: 8, label: "Пусть не идет" }
      ]
    }
  },
  {
    id: "7",
    type: "skip",
    position: { x: 1250, y: 335 },
    data: {
      id: 7,
      type: "skip",
      label: "Эмили идет",
      nextId: 10,
      text: "Эмили все-таки решает идти с вами."
    }
  },
  {
    id: "8",
    type: "skip",
    position: { x: 1250, y: 500 },
    data: {
      id: 8,
      type: "skip",
      label: "Идете с Робертом",
      nextId: 11,
      text: "Вы с Робертом идете в тайную местность."
    }
  },
  {
    id: "9",
    type: "finish",
    position: { x: 2450, y: 300 },
    data: {
      id: 9,
      type: "finish",
      label: "Проигрыш",
      text: "Ты проиграл{|а}... 🙁 Попробуй еще раз!"
    }
  },
  {
    id: "10",
    type: "skip",
    position: { x: 1550, y: 250 },
    data: {
      id: 10,
      type: "skip",
      label: "Идете втроем",
      nextId: 11,
      text: "Вы с Эмили и Робертом идете в тайную местность."
    }
  },
  {
    id: "11",
    type: "action",
    position: { x: 1850, y: 400 },
    data: {
      id: 11,
      type: "action",
      label: "Крепость",
      text: "Спустя какое-то время вы подходите к мрачной крепости.",
      actions: [
        { id: 12, label: "Зайти внутрь" }
      ]
    }
  },
  {
    id: "12",
    type: "action",
    position: { x: 2150, y: 400 },
    data: {
      id: 12,
      type: "action",
      label: "Дракон",
      text: [
        "Вы заходите внутрь крепости, повсюду разбросаны кости, видимо, это все, что осталось от пропавших людей. 😥",
        "Вдруг вы видите огромного... <b>ДРАКОНА</b>!!! 🐉",
        "Он увидел вас и собирается напасть! 🔥"
      ],
      actions: [
        { "id": 13, "label": "Бежать" },
        { "id": 9, "label": "Уворачиваться" }
      ]
    }
  },
  {
    id: "13",
    type: "action",
    position: { x: 2450, y: 700 },
    data: {
      id: 13,
      type: "action",
      label: "Сокровищница",
      text: [
        "Вы прибежали в другую комнату. Там целый клад! 👑",
        "Вокруг драгоценности, доспехи и оружие.",
        "Из этой комнаты нет другого выхода — только назад.",
        "Прежде, чем вернуться назад..."
      ],
      actions: [
        { id: 19, label: "Набрать золота" },
        { id: 14, label: "Взять мечи получше" }
      ]
    }
  },
];

const initialEdges = [
  { id: "e1-3", source: "1", sourceHandle: "3", target: "3" },
  { id: "e3-2", source: "3", sourceHandle: "2", target: "2" },
  { id: "e2-5", source: "2", sourceHandle: "5", target: "5" },
  { id: "e2-6", source: "2", sourceHandle: "6", target: "6" },
  { id: "e3-6", source: "3", sourceHandle: "6", target: "6" },
  { id: "e5-9", source: "5", sourceHandle: "9", target: "9" },
  { id: "e5-10", source: "5", sourceHandle: "10", target: "10" },
  { id: "e6-7", source: "6", sourceHandle: "7", target: "7" },
  { id: "e6-8", source: "6", sourceHandle: "8", target: "8" },
  { id: "e7-10", source: "7", sourceHandle: "10", target: "10" },
  { id: "e8-11", source: "8", sourceHandle: "11", target: "11" },
  { id: "e10-11", source: "10", sourceHandle: "11", target: "11" },
  { id: "e11-12", source: "11", sourceHandle: "12", target: "12" },
  { id: "e12-9", source: "12", sourceHandle: "9", target: "9" },
  { id: "e12-13", source: "12", sourceHandle: "13", target: "13" },
];

let maxNodeId = Math.max(...initialNodes.map(n => n.data.id));
const getNextId = () => String(++maxNodeId);

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
