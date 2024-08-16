import { Handle, Position } from "reactflow";

export default function HandleIn() {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className="top-[14px] left-[-3px] w-[7px] h-[7px] hover:w-[10px] hover:h-[10px] hover:left-[-5px] rounded-full transition-all bg-slate-600"
    />
  );
}
