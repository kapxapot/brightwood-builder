import { memo } from "react";
import type { RedirectStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeLink from "../node-parts/node-link";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addLink, deleteLink, moveLinkDown, moveLinkUp, updateLink } from "../../lib/link-mutations";
import HandleIn from "../node-parts/handle-in";
import { useTranslation } from "react-i18next";

type Props = {
  data: RedirectStoryNode;
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);

  const totalWeight = data.links.reduce(
    (sum, link) => sum + link.weight,
    0
  );

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.redirect.tw}
    >
      <NodeTitle id={data.id} label={data.label ?? t(nodeLabels.redirect)} />

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
          totalWeight={totalWeight}
          deletable={true}
          nodeEditing={nodeEditing}
          isFirst={index === 0}
          isLast={index === data.links.length - 1}
          updateLink={updatedLink => updateLink(data, index, updatedLink)}
          deleteLink={() => deleteLink(data, index)}
          moveLinkDown={() => moveLinkDown(data, index)}
          moveLinkUp={() => moveLinkUp(data, index)}
          onEditStarted={startEdit}
          onEditFinished={finishEdit}
        />
      )}

      <div>
        <Button
          onClick={() => addLink(data)}
          disabled={nodeEditing}
        >
          {t("Add link")}
        </Button>
      </div>

      <HandleIn />
    </NodeShell>
  );
});

export default RedirectNode;
