import { PropsWithChildren } from "react";
import type { StoryNodeType } from "../entities/story-node";
import { colors } from "../lib/constants";

interface Props {
  type: StoryNodeType;
  className?: string;
}

export default function ToolbarBlock({ type, className, children }: PropsWithChildren<Props>) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`flex justify-center gap-1 border border-gray-700 rounded-md p-1 cursor-grab ${colors[type].tw} ${className}`} onDragStart={(event) => onDragStart(event, type)} draggable>
      {children}
    </div>
  );
}
