import type { StoryNodeType } from "../entities/story-node";
import { colors } from "../lib/constants";

interface Props {
  type: StoryNodeType;
  label: string;
}

export default function ToolbarBlock({ type, label }: Props) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`border border-gray-700 rounded-md p-1 text-center cursor-grab ${colors[type]}`} onDragStart={(event) => onDragStart(event, type)} draggable>
      {label}
    </div>
  )
};
