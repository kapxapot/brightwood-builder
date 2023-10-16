import { Colors } from "../lib/constants";

interface Props {
  type: string;
  label: string;
}

export default function ToolbarBlock({ type, label }: Props) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`border border-gray-700 p-1 text-center cursor-grab ${Colors[type]}`} onDragStart={(event) => onDragStart(event, type)} draggable>
      {label}
    </div>
  )
};
