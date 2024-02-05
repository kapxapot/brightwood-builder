import { Handle, Position } from "reactflow";

interface Props {
  id?: string;
  connected: boolean;
}

export default function HandleOut({ id = "0", connected }: Props) {
  return (
    <Handle
      id={id}
      type="source"
      position={Position.Right}
      className={`w-[7px] h-[7px] rounded ${connected ? "bg-slate-600" : "bg-red-600"}`}
    />
  );
}
