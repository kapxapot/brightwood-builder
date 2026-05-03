import { cn } from "@/lib/utils";
import { type MouseEvent, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from "react";
import { NodeToolbar, Position, useViewport } from "reactflow";

type Props = {
  selected: boolean;
  color?: string;
  spaceY?: "normal" | "none";
  actions?: ReactNode;
  readonly?: boolean;
}

const MENU_SHOW_DELAY_MS = 500;
const MENU_HIDE_DELAY_MS = 500;
const MENU_HANDOFF_HIDE_DELAY_MS = 120;

type NodeShellMenuController = {
  show: () => void;
  hide: () => void;
};

const nodeShellMenuControllers = new WeakMap<HTMLElement, NodeShellMenuController>();
const lastPointerPosition = { x: 0, y: 0, ready: false };
let pointerTrackingRefCount = 0;
let visibleNodeShell: HTMLElement | null = null;

function handlePointerMove(event: PointerEvent) {
  lastPointerPosition.x = event.clientX;
  lastPointerPosition.y = event.clientY;
  lastPointerPosition.ready = true;
}

function beginPointerTracking() {
  if (pointerTrackingRefCount === 0) {
    window.addEventListener("pointermove", handlePointerMove);
  }

  pointerTrackingRefCount += 1;
}

function endPointerTracking() {
  pointerTrackingRefCount = Math.max(0, pointerTrackingRefCount - 1);

  if (pointerTrackingRefCount === 0) {
    window.removeEventListener("pointermove", handlePointerMove);
  }
}

function findNodeShellAtPointer() {
  if (!lastPointerPosition.ready) {
    return null;
  }

  const element = document.elementFromPoint(lastPointerPosition.x, lastPointerPosition.y);

  if (!(element instanceof Element)) {
    return null;
  }

  return element.closest<HTMLElement>("[data-node-shell='true']");
}

function isPointerInsideRect(rect: DOMRect) {
  if (!lastPointerPosition.ready) {
    return false;
  }

  return lastPointerPosition.x >= rect.left
    && lastPointerPosition.x <= rect.right
    && lastPointerPosition.y >= rect.top
    && lastPointerPosition.y <= rect.bottom;
}

export default function NodeShell({
  selected,
  color,
  spaceY = "normal",
  actions,
  readonly = false,
  children
}: PropsWithChildren<Props>) {
  const [menuVisible, setMenuVisible] = useState(false);
  const showMenuTimeoutRef = useRef<number | null>(null);
  const hideMenuTimeoutRef = useRef<number | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const actionsGroupRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const { zoom } = useViewport();

  const hasActions = !!actions && !readonly;

  function clearShowMenuTimeout() {
    if (showMenuTimeoutRef.current !== null) {
      window.clearTimeout(showMenuTimeoutRef.current);
      showMenuTimeoutRef.current = null;
    }
  }

  function clearHideMenuTimeout() {
    if (hideMenuTimeoutRef.current !== null) {
      window.clearTimeout(hideMenuTimeoutRef.current);
      hideMenuTimeoutRef.current = null;
    }
  }

  function showMenu() {
    const rootElement = rootRef.current;

    clearShowMenuTimeout();
    clearHideMenuTimeout();

    if (rootElement && visibleNodeShell && visibleNodeShell !== rootElement) {
      nodeShellMenuControllers.get(visibleNodeShell)?.hide();
    }

    if (rootElement) {
      visibleNodeShell = rootElement;
    }

    setMenuVisible(true);
  }

  function scheduleShowMenu() {
    clearHideMenuTimeout();

    if (menuVisible || showMenuTimeoutRef.current !== null) {
      return;
    }

    showMenuTimeoutRef.current = window.setTimeout(() => {
      setMenuVisible(true);
      showMenuTimeoutRef.current = null;
    }, MENU_SHOW_DELAY_MS);
  }

  function hideMenu() {
    clearShowMenuTimeout();
    clearHideMenuTimeout();

    if (actionsRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }

    if (visibleNodeShell === rootRef.current) {
      visibleNodeShell = null;
    }

    setMenuVisible(false);
  }

  function showMenuAtPointer() {
    const hoveredNodeShell = findNodeShellAtPointer();

    if (!hoveredNodeShell) {
      return;
    }

    nodeShellMenuControllers.get(hoveredNodeShell)?.show();
  }

  function getHideDelay() {
    const hoveredNodeShell = findNodeShellAtPointer();

    if (hoveredNodeShell && hoveredNodeShell !== rootRef.current) {
      return MENU_HANDOFF_HIDE_DELAY_MS;
    }

    return MENU_HIDE_DELAY_MS;
  }

  function isPointerInsideNode() {
    const rootElement = rootRef.current;

    return !!rootElement && isPointerInsideRect(rootElement.getBoundingClientRect());
  }

  function isPointerInsideMenuArea() {
    const actionsGroupElement = actionsGroupRef.current;

    if (!actionsGroupElement) {
      return false;
    }

    const buttonRects = Array.from(actionsGroupElement.querySelectorAll<HTMLElement>("button"))
      .map(button => button.getBoundingClientRect())
      .sort((left, right) => {
        if (left.top === right.top) {
          return left.left - right.left;
        }

        return left.top - right.top;
      });

    if (buttonRects.length === 0) {
      return false;
    }

    return buttonRects.some((rect, index) => {
      const previousRect = buttonRects[index - 1];
      const nextRect = buttonRects[index + 1];
      const top = previousRect ? (previousRect.bottom + rect.top) / 2 : rect.top;
      const bottom = nextRect ? (rect.bottom + nextRect.top) / 2 : rect.bottom;

      return isPointerInsideRect(new DOMRect(rect.left, top, rect.width, bottom - top));
    });
  }

  function syncMenuVisibilityToPointer() {
    if (!menuVisible) {
      return;
    }

    if (isPointerInsideNode() || isPointerInsideMenuArea()) {
      clearHideMenuTimeout();
      return;
    }

    scheduleHideMenu();
  }

  function scheduleHideMenu() {
    clearShowMenuTimeout();
    clearHideMenuTimeout();

    if (!menuVisible) {
      return;
    }

    const hideDelay = getHideDelay();

    hideMenuTimeoutRef.current = window.setTimeout(() => {
      hideMenu();
      hideMenuTimeoutRef.current = null;

      window.requestAnimationFrame(() => {
        showMenuAtPointer();
      });
    }, hideDelay);
  }

  function handleActionsMouseUp(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest("button");
    button?.blur();
  }

  useEffect(() => {
    beginPointerTracking();

    return () => {
      clearShowMenuTimeout();
      clearHideMenuTimeout();
      endPointerTracking();
    };
  }, []);

  useEffect(() => {
    const rootElement = rootRef.current;

    if (!rootElement || !hasActions) {
      return;
    }

    nodeShellMenuControllers.set(rootElement, {
      show: showMenu,
      hide: hideMenu
    });

    return () => {
      if (visibleNodeShell === rootElement) {
        visibleNodeShell = null;
      }

      nodeShellMenuControllers.delete(rootElement);
    };
  }, [hasActions]);

  useEffect(() => {
    if (!hasActions || !menuVisible) {
      return;
    }

    function handlePointerUpdate() {
      syncMenuVisibilityToPointer();
    }

    window.addEventListener("pointermove", handlePointerUpdate);
    window.addEventListener("scroll", handlePointerUpdate, true);

    handlePointerUpdate();

    return () => {
      window.removeEventListener("pointermove", handlePointerUpdate);
      window.removeEventListener("scroll", handlePointerUpdate, true);
    };
  }, [hasActions, menuVisible]);

  return (
    <div
      ref={rootRef}
      data-node-shell="true"
      className={cn(
        "group/node relative w-[250px] cursor-default rounded-md border p-2 shadow-md",
        selected ? "border-stone-600" : "border-stone-400",
        color
      )}
      onMouseEnter={hasActions ? scheduleShowMenu : undefined}
      onMouseLeave={hasActions ? scheduleHideMenu : undefined}
    >
      <div className={spaceY === "normal" ? "space-y-2" : ""}>
        {children}
      </div>
      {hasActions && (
        <NodeToolbar
          isVisible={menuVisible}
          position={Position.Right}
          align="start"
          offset={6 * zoom}
          className="nodrag nopan pointer-events-none"
          style={{ zIndex: 2000 }}
        >
          <div
            ref={actionsRef}
            onMouseUpCapture={handleActionsMouseUp}
            className={cn("origin-top-left w-max transition-opacity duration-150 pointer-events-none", menuVisible ? "opacity-100" : "opacity-0")}
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              ref={actionsGroupRef}
              className={cn(
                "pointer-events-none flex flex-col items-start gap-2 [&>*]:pointer-events-auto",
                !menuVisible && "[&>*]:pointer-events-none"
              )}
            >
              {actions}
            </div>
          </div>
        </NodeToolbar>
      )}
    </div>
  );
}
