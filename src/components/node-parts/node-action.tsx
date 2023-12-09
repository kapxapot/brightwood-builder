import { Handle, Position } from "reactflow";
import { type Action } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";

interface Props {
  action: Action;
  index: number;
  editAction: (index: number) => void;
  deleteAction: (index: number) => void;
}

export default function NodeAction({ action, index, editAction, deleteAction }: Props) {
  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-green-300 py-1 -mr-2">
      <div>
        <div>
          ⚡ <span className={`mr-1 ${!action.label.length && "opacity-30"}`}>{action.label || `Action ${index + 1}`}</span>
          <NodeRef id={action.id} />
        </div>
        <Handle id={String(index)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
      </div>
      <div className="absolute right-2 inset-y-0 space-x-1 hidden group-hover:block">
        <Button onClick={() => editAction(index)}>Edit</Button>
        <Button onClick={() => deleteAction(index)}>Delete</Button>
      </div>
    </div>
  );
}
