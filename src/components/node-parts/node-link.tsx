import { Handle, Position } from "reactflow";
import { type Link } from "../../entities/story-node";
import NodeRef from "./node-ref";
import Button from "../core/button";

interface Props {
  link: Link;
  index: number;
  editLink: (index: number) => void;
  deleteLink: (index: number) => void;
}

function weightStr(link: Link): string {
  const weight = Math.max(1, link.weight ?? 1);

  let str = "🎲".repeat(weight);

  if (link.weight && (link.weight - Math.floor(link.weight)) > 0) {
    str += ` x${link.weight}`;
  }

  return str;
}

export default function NodeLink({ link, index, editLink, deleteLink }: Props) {
  return (
    <div className="relative group text-sm bg-gradient-to-r from-transparent to-yellow-300 py-1 -mr-2" key={index}>
      <div>
        <div>
          <span className="mr-1">{weightStr(link)}</span>
          {link.condition && (
            <span className="mr-1">
              <span className="italic">if:</span> {link.condition}
            </span>
          )}
          <NodeRef id={link.id} />
        </div>
        <Handle id={String(index)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
      </div>
      <div className="absolute right-2 inset-y-0 space-x-1 hidden group-hover:block">
        <Button onClick={() => editLink(index)}>Edit</Button>
        <Button onClick={() => deleteLink(index)}>Delete</Button>
      </div>
    </div>
  );
}
