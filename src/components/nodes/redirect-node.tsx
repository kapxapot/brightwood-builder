import { Reorder } from "framer-motion";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { NodeProps } from "reactflow";
import type { Link, RedirectStoryNode } from "../../entities/story-node";
import { colors, nodeLabels } from "../../lib/constants";
import NodeShell from "../node-parts/node-shell";
import Button from "../core/button";
import NodeLink from "../node-parts/node-link";
import { useNodeEditing } from "../../hooks/use-node-editing";
import NodeTitle from "../node-parts/node-title";
import NodeEffect, { type NodeEffectHandle } from "../node-parts/node-effect";
import NodeText from "../node-parts/node-text";
import { addLink, deleteLink, setLinks, updateLink } from "../../lib/link-mutations";
import HandleIn from "../node-parts/handle-in";
import { useTranslation } from "react-i18next";
import { addTextLine } from "../../lib/node-data-mutations";
import { type ReorderListItem, haveReorderValuesChanged, syncReorderItems } from "../../lib/reorder-items";
import { useReorderNodeInternalsRefresh } from "@/hooks/use-reorder-node-internals-refresh";
import { Collapse, Cube, Expand, Sparkles, Text } from "../core/icons";

type Props = Pick<NodeProps<RedirectStoryNode>, "data" | "selected" | "dragging">;

function areLinksEqual(left: Link, right: Link) {
  return (
    left.id === right.id
    && left.weight === right.weight
    && (left.condition ?? "") === (right.condition ?? "")
    && JSON.stringify(left.effects ?? []) === JSON.stringify(right.effects ?? [])
  );
}

const RedirectNode = memo(function RedirectNode({ data, selected, dragging }: Props) {
  const { t } = useTranslation();

  const { nodeEditing, startEdit, finishEdit } = useNodeEditing(data);
  const entryEffectRef = useRef<NodeEffectHandle>(null);
  const [expanded, setExpanded] = useState(false);
  const nextLinkIdRef = useRef(0);

  const [linkItems, setLinkItems] = useState<ReorderListItem<Link>[]>(() =>
    data.links.map(link => ({
      id: `link-item-${data.id}-${nextLinkIdRef.current++}`,
      value: link
    }))
  );

  const [linksReordering, setLinksReordering] = useState(false);
  const linkItemsRef = useRef<ReorderListItem<Link>[]>(linkItems);
  const editingOrDragging = nodeEditing || dragging;

  const totalWeight = data.links.reduce(
    (sum, link) => sum + link.weight,
    0
  );

  const shellActions = (
    <>
      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => setExpanded(current => !current)}
      >
        {expanded ? (
          <>
            <Collapse />
            <span>{t("Collapse")}</span>
          </>
        ) : (
          <>
            <Expand />
            <span>{t("Expand")}</span>
          </>
        )}
      </Button>

      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => addTextLine(data)}
      >
        <Text />
        {t("Add text")}
      </Button>

      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => addLink(data)}
      >
        <Cube />
        {t("Add link")}
      </Button>

      <Button
        className="backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
        onClick={() => entryEffectRef.current?.startEdit()}
      >
        <Sparkles />
        {t("Add entry effect")}
      </Button>
    </>
  );

  useReorderNodeInternalsRefresh(data.id, linkItems, linksReordering);

  useLayoutEffect(() => {
    const nextLinks = data.links;

    setLinkItems(previousItems => {
      const nextItems = syncReorderItems(
        previousItems,
        nextLinks,
        areLinksEqual,
        () => `link-item-${data.id}-${nextLinkIdRef.current++}`
      );

      if (
        previousItems.length === nextItems.length
        && previousItems.every((item, index) => item === nextItems[index])
      ) {
        linkItemsRef.current = previousItems;
        return previousItems;
      }

      linkItemsRef.current = nextItems;
      return nextItems;
    });
  }, [data.id, data.links]);

  useEffect(() => {
    linkItemsRef.current = linkItems;
  }, [linkItems]);

  function handleReorder(nextItems: ReorderListItem<Link>[]) {
    linkItemsRef.current = nextItems;
    setLinkItems(nextItems);
  }

  function handleReorderStart() {
    setLinksReordering(true);
  }

  function handleReorderEnd() {
    setLinksReordering(false);

    const reorderedLinks = linkItemsRef.current.map(item => item.value);

    if (haveReorderValuesChanged(linkItemsRef.current, data.links, areLinksEqual)) {
      setLinks(data, reorderedLinks);
    }
  }

  return (
    <NodeShell
      key={data.key}
      selected={selected}
      color={colors.redirect.tw}
      selectedClassName={colors.redirect.selectedTw}
      actions={shellActions}
      readonly={editingOrDragging}
    >
      <NodeTitle
        id={data.id}
        label={data.label ?? t(nodeLabels.redirect)}
      />

      <NodeEffect
        ref={entryEffectRef}
        effects={data.entryEffects}
        expanded={expanded}
        readonly={editingOrDragging}
        updateEffects={entryEffects => data.onChange?.({ ...data, entryEffects })}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <NodeText
        data={data}
        expanded={expanded}
        readonly={editingOrDragging}
        showAddButton={false}
        onEditStarted={startEdit}
        onEditFinished={finishEdit}
      />

      <Reorder.Group
        as="div"
        axis="y"
        className="flex flex-col gap-2"
        values={linkItems}
        onReorder={handleReorder}
      >
        {linkItems.map((item, index) => 
          <NodeLink
            key={item.id}
            value={item}
            index={index}
            link={item.value}
            expanded={expanded}
            totalWeight={totalWeight}
            deletable={true}
            readonly={editingOrDragging}
            interactionsDisabled={linksReordering}
            reorderable={!editingOrDragging && linkItems.length > 1}
            updateLink={updatedLink => updateLink(data, index, updatedLink)}
            deleteLink={() => deleteLink(data, index)}
            onReorderStart={handleReorderStart}
            onReorderEnd={handleReorderEnd}
            onEditStarted={startEdit}
            onEditFinished={finishEdit}
          />
        )}
      </Reorder.Group>
      <HandleIn />
    </NodeShell>
  );
});

export default RedirectNode;
