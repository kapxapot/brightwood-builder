import { Handle, Position } from "reactflow";

export default function HandleIn() {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className="top-[14px] w-[7px] h-[7px] rounded bg-slate-600"
    />
  );
}
