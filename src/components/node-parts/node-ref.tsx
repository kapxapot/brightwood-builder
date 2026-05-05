import type { MouseEvent, PointerEvent } from "react";
import { useReactFlow, useStoreApi } from "reactflow";
import { cn } from "@/lib/utils";
import Tooltip from "../core/tooltip";

type Props = {
  id?: number;
  className?: string;
}

const nodeRefPadding = 1.8;
const nodeRefMaxZoom = 1.15;
const nodeRefAnimationDurationMs = 250;

export default function NodeRef({ id, className }: Props) {
  const { fitView, getNode } = useReactFlow();
  const reactFlowStore = useStoreApi();

  if (!id) {
    return null;
  }

  const nodeId = String(id);
  const label = "Go to";

  function stopPointerPropagation(event: PointerEvent<HTMLButtonElement>) {
    event.stopPropagation();
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!getNode(nodeId)) {
      return;
    }

    reactFlowStore.getState().addSelectedNodes([nodeId]);

    fitView({
      nodes: [{ id: nodeId }],
      padding: nodeRefPadding,
      maxZoom: nodeRefMaxZoom,
      duration: nodeRefAnimationDurationMs
    });
  }

  return (
    <Tooltip tooltip={label} side="top">
      <button
        type="button"
        aria-label={label}
        className={cn(
          "rounded-xl border border-gray-500 bg-gray-50 px-1 opacity-40 transition hover:opacity-100",
          className
        )}
        onPointerDown={stopPointerPropagation}
        onClick={handleClick}
      >
        {id}
      </button>
    </Tooltip>
  );
}
