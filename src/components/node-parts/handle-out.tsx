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
      className={`w-[7px] h-[7px] hover:w-[10px] hover:h-[10px] hover:right-[-5px] rounded-full transition-all ${connected ? "bg-slate-600" : "bg-red-600"}`}
    />
  );
}
