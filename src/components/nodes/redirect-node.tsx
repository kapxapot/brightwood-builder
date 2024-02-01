import { memo } from "react";
import type { Link, RedirectStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeLink from "../node-parts/node-link";
import { useNodeEditing } from "../../hooks/use-node-editing";

interface Props {
  data: RedirectStoryNode;
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  const addLink = () => {
    data.onChange?.({
      ...data,
      links: [
        ...data.links,
        {
          weight: 0
        }
      ]
    });
  }

  const updateLink = (updatedIndex: number, updatedLink: Link) => {
    data.onChange?.({
      ...data,
      links: data.links.map(
        (link, index) => index === updatedIndex ? updatedLink : link
      )
    });
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
      className={colors.redirect}
      data={data}
      label="Redirect"
      nodeEditing={nodeEditing}
      onEditStarted={startEdit}
      onEditFinished={finishEdit}
    >
      <div className="mt-2 space-y-2">
        {data.links.map((link, index) => 
          <NodeLink
            key={index}
            index={index}
            link={link}
            deletable={data.links.length > 1}
            updateLink={updatedLink => updateLink(index, updatedLink)}
            deleteLink={() => deleteLink(index)}
            nodeEditing={nodeEditing}
            onEditStarted={startEdit}
            onEditFinished={finishEdit}
          />
        )}
        <Button onClick={addLink} disabled={nodeEditing}>Add link 🎲</Button>
      </div>
    </NodeShell>
  );
});

export default RedirectNode;
