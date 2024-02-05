import { Handle, Position } from "reactflow";

interface Props {
  connected: boolean;
}

export default function HandleIn({ connected }: Props) {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className={`top-5 w-[7px] h-[7px] rounded ${connected ? "bg-slate-600" : "bg-red-600"} top-5`}
    />
  );
}
