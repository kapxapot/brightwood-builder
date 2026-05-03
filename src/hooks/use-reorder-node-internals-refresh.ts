import { useCallback, useEffect, useRef } from "react";
import { useUpdateNodeInternals } from "reactflow";

const nodeInternalsRefreshDelayMs = 350;

export function useReorderNodeInternalsRefresh(
  nodeId: string | number,
  items: unknown[],
  isReordering: boolean
) {
  const updateNodeInternals = useUpdateNodeInternals();
  const frameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const wasReorderingRef = useRef(false);

  const clearScheduledRefresh = useCallback(() => {
    if (frameIdRef.current !== null) {
      window.cancelAnimationFrame(frameIdRef.current);
      frameIdRef.current = null;
    }

    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  const scheduleNodeInternalsRefresh = useCallback(() => {
    clearScheduledRefresh();

    frameIdRef.current = window.requestAnimationFrame(() => {
      frameIdRef.current = null;
      updateNodeInternals(String(nodeId));

      timeoutIdRef.current = window.setTimeout(() => {
        timeoutIdRef.current = null;
        updateNodeInternals(String(nodeId));
      }, nodeInternalsRefreshDelayMs);
    });
  }, [clearScheduledRefresh, nodeId, updateNodeInternals]);

  useEffect(() => clearScheduledRefresh, [clearScheduledRefresh]);

  useEffect(() => {
    if (isReordering || wasReorderingRef.current) {
      scheduleNodeInternalsRefresh();
    }

    wasReorderingRef.current = isReordering;
  }, [isReordering, items, scheduleNodeInternalsRefresh]);
}
