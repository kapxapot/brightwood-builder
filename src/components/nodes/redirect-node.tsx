import { memo } from "react";
import type { RedirectStoryNode } from "../../entities/story-node";
import { colors } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeLink from "../node-parts/node-link";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addLink, deleteLink, updateLink } from "../../lib/link-mutations";
import HandleIn from "../node-parts/handle-in";
import { PlusIcon } from "@heroicons/react/24/solid";

interface Props {
  data: RedirectStoryNode;
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const [nodeEditing, startEdit, finishEdit] = useNodeEditing();

  return (
    <NodeShell
      selected={selected}
      color={colors.redirect.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? "Random"} />

      <NodeEffect effect={data.effect} />

      <NodeText
        data={data}
        readonly={nodeEditing}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      {data.links.map((link, index) => 
        <NodeLink
          key={index}
          index={index}
          link={link}
          deletable={true}
          updateLink={updatedLink => updateLink(data, index, updatedLink)}
          deleteLink={() => deleteLink(data, index)}
          nodeEditing={nodeEditing}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      )}

      <div>
        <Button
          onClick={() => addLink(data)}
          disabled={nodeEditing}
        >
          <PlusIcon className="w-4 text-green-600" /> Link
        </Button>
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default RedirectNode;
