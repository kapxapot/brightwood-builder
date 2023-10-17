import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Link, RedirectStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeTitle from '../node-parts/node-title';
import NodeText from '../node-parts/node-text';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: Partial<RedirectStoryNode>,
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const hasLinks = data.links && data.links.length;

  function linkStr(link: Link): string {
    return link.id ? String(link.id) : "?";
  }

  function weightStr(link: Link): string {
    const weight = Math.max(1, link.weight ?? 1);

    let str = "🎲".repeat(weight);

    if (link.weight && (link.weight - Math.floor(link.weight)) > 0) {
      str += ` x${link.weight}`;
    }

    return str;
  }

  return (
    <NodeShell selected={selected} className={Colors.redirect}>
      <NodeTitle id={data.id} label={data.label ?? "Redirect"} isStart={data.isStart} />
      <NodeText text={data.text} />

      {hasLinks && data.links?.map((link, index) => (
        <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-yellow-300 p-1 relative -mr-2" key={index}>
          <div>{weightStr(link)} <NodeRef id={link.id} /></div>
          <Handle id={linkStr(link)} type="source" position={Position.Right} className="bg-slate-600" isConnectable={true} />
        </div>
      ))}

      <Handle type="target" position={Position.Left} className="bg-slate-600 top-5" />
    </NodeShell>
  );
});

export default RedirectNode;
