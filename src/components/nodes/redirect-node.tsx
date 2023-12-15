import { memo } from 'react';
import type { RedirectStoryNode } from '../../entities/story-node';
import { Colors } from '../../lib/constants';
import NodeShell from '../node-parts/node-shell';
import Button from '../core/button';
import NodeLink from '../node-parts/node-link';
import { toArray } from '../../lib/common';

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

  const addTextLine = () => {
    data.onChange?.({
      ...data,
      text: [
        ...toArray(data.text),
        ""
      ]
    });
  };

  const updateTextLine = (updatedIndex: number, updatedLine: string) => {
    data.onChange?.({
      ...data,
      text: toArray(data.text).map(
        (line, index) => index === updatedIndex ? updatedLine : line
      )
    });
  };

  const deleteTextLine = (index: number) => {
    data.onChange?.(
      {
        ...data,
        text: toArray(data.text).toSpliced(index, 1)
      }
    );
  };

  return (
    <NodeShell
      selected={selected}
      className={Colors.redirect}
      data={data}
      label="Redirect"
      addTextLine={addTextLine}
      updateTextLine={updateTextLine}
      deleteTextLine={deleteTextLine}
    >
      <div className="mt-2 space-y-2">
        {data.links.map((link, index) => 
          <NodeLink
            link={link}
            index={index}
            deletable={data.links.length > 1}
            editLink={editLink}
            deleteLink={deleteLink}
            key={index}
          />
        )}
        <Button onClick={addLink}>Add link 🎲</Button>
      </div>
    </NodeShell>
  );
});

export default RedirectNode;
