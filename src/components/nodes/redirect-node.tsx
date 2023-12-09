import { memo } from 'react';
import type { RedirectStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import Button from '../core/button';
import NodeLink from '../node-parts/node-link';

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

  return (
    <NodeShell
      selected={selected}
      className={Colors.redirect}
      data={data}
      label="Redirect"
    >
      <div className="mt-2 space-y-2">
        {data.links.map((link, index) => 
          <NodeLink
            link={link}
            index={index}
            editLink={editLink}
            deleteLink={deleteLink}
            key={index}
          />
        )}
        <Button onClick={addLink}>
          Add link 🎲
        </Button>
      </div>
    </NodeShell>
  );
});

export default RedirectNode;
