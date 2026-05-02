import { memo, useRef, useState } from "react";
import type { RedirectStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeLink from "../node-parts/node-link";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addLink, deleteLink, moveLinkDown, moveLinkUp, updateLink } from "../../lib/link-mutations";
import HandleIn from "../node-parts/handle-in";
import { useTranslation } from "react-i18next";
import { addTextLine } from "../../lib/node-data-mutations";

type Props = {
  data: RedirectStoryNode;
  selected: boolean;
}

const RedirectNode = memo(function RedirectNode({ data, selected }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const [textExpanded, setTextExpanded] = useState(false);

  const totalWeight = data.links.reduce(
    (sum, link) => sum + link.weight,
    0
  );
  const hasEntryEffects = !!data.entryEffects?.length;

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.redirect.tw}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.redirect)}
        expanded={textExpanded}
        onToggleExpanded={() => setTextExpanded(current => !current)}
      />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        readonly={nodeEditing}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        expanded={textExpanded}
        readonly={nodeEditing}
        showAddButton={false}
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

      {selected && (
        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            onClick={() => addTextLine(data)}
            disabled={nodeEditing}
          >
            {t("Add text")}
          </Button>
          <Button
            onClick={() => addLink(data)}
            disabled={nodeEditing}
          >
            {t("Add link")}
          </Button>

          {!hasEntryEffects && (
            <Button
              onClick={() => entryEffectRef.current?.startEdit()}
              disabled={nodeEditing}
            >
              {t("Add entry effect")}
            </Button>
          )}
        </div>
      )}

      <HandleIn />
    </NodeShell>
  );
});

export default RedirectNode;
