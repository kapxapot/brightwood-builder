import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Link, RedirectStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';

interface Props {
  data: Partial<RedirectStoryNode>,
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const hasLinks = data.links && data.links.length;

  function weightStr(link: Link): string {
    const weight = Math.max(1, link.weight ?? 1);

    let str = "🎲".repeat(weight);

    if (link.weight && (link.weight - Math.floor(link.weight)) > 0) {
      str += ` x${link.weight}`;
    }

    return str;
  }

  return (
    <NodeShell
      selected={selected}
      className={Colors.redirect}
      data={data}
      label="Redirect"
    >
      {hasLinks && data.links?.map((link, index) => (
        <div className="mt-2 text-sm bg-gradient-to-r from-transparent to-yellow-300 py-1 relative -mr-2" key={index}>
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
      ))}
    </NodeShell>
  );
});

export default RedirectNode;
