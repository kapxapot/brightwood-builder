import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { Link, RedirectStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import NodeRef from '../node-parts/node-ref';
import Button from '../core/button';

interface Props {
  data: RedirectStoryNode;
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const addLink = () => {
    data.onChange?.({
      ...data,
      links: [
        ...data.links,
        {}
      ]
    });
  }

  const editLink = (index: number) => {
    console.log(`Editing link ${index}...`);
  };

  const deleteLink = (index: number) => {
    data.onChange?.(
      {
        ...data,
        links: data.links.toSpliced(index, 1)
      },
      {
        type: "handleRemoved",
        handle: String(index)
      }
    );
  };

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
      <div className="mt-2 space-y-2">
        {data.links.map((link, index) => (
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
        ))}
        <Button onClick={addLink}>
          Add link 🎲
        </Button>
      </div>
    </NodeShell>
  );
});

export default RedirectNode;
