import { type PropsWithChildren } from "react";
import { Handle, Position } from "reactflow";
import NodeTitle from "./node-title";
import type { StoryNode } from "../../entities/story-node";
import NodeEffect from "./node-effect";
import NodeText from "./node-text";
import { addTextLine, deleteTextLine, updateTextLine } from "../../lib/node-data-mutations";

interface Props {
  className?: string,
  selected: boolean;
  data: StoryNode;
  label: string;
  allowNoText?: boolean;
  nodeEditing: boolean;
  onEditStarted: () => void;
  onEditFinished: () => void;
}

export default function NodeShell({ className, selected, children, data, label, allowNoText, nodeEditing, onEditStarted, onEditFinished }: PropsWithChildren<Props>) {
  return (
    <div className={`p-2 shadow-md rounded-md border w-[250px] ${selected ? "border-stone-600" : "border-stone-400"} ${className} cursor-default`}>
      <NodeTitle id={data.id} label={data.label ?? label} />
      <NodeEffect effect={data.effect} />
      <NodeText
        text={data.text}
        allowEmpty={allowNoText ?? false}
        readonly={nodeEditing}
        addLine={() => addTextLine(data)}
        updateLine={(index, updatedLine) => updateTextLine(data, index, updatedLine)}
        deleteLine={(index) => deleteTextLine(data, index)}
        onEditStarted={onEditStarted}
        onEditFinished={onEditFinished}
      />

      {children}

      <Handle type="target" position={Position.Left} className="bg-slate-600 top-5" />
    </div>
  );
}
