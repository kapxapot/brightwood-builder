import { PropsWithChildren } from "react";
import type { StoryNodeType } from "../entities/story-node";
import { colors } from "../lib/constants";
import { Bounce } from "./motion/bounce";

type Props = {
  type: StoryNodeType;
  expanded: boolean;
  className?: string;
}

export default function ToolbarBlock({ type, expanded, className, children }: PropsWithChildren<Props>) {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Bounce
      xOffset={expanded ? 6 : 3}
      duration={expanded ? 0.8 : 0.4}
    >
      <div
        className={`flex justify-center gap-1 border border-gray-700 rounded-md p-1 cursor-grab ${colors[type].tw} ${className}`}
        onDragStart={(event) => onDragStart(event, type)}
        draggable
      >
        {children}
      </div>
    </Bounce>
  );
}
