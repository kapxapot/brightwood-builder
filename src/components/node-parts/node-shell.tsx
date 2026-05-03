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
    clearShowMenuTimeout();
    clearHideMenuTimeout();
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

    if (actionsRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }

    setMenuVisible(false);
  }

  function scheduleHideMenu() {
    clearShowMenuTimeout();
    clearHideMenuTimeout();

    if (!menuVisible) {
      return;
    }

    hideMenuTimeoutRef.current = window.setTimeout(() => {
      hideMenu();
      hideMenuTimeoutRef.current = null;
    }, MENU_HIDE_DELAY_MS);
  }

  function handleActionsMouseUp(event: MouseEvent<HTMLDivElement>) {
    const button = (event.target as HTMLElement).closest("button");
    button?.blur();
  }

  useEffect(() => {
    return () => {
      clearShowMenuTimeout();
      clearHideMenuTimeout();
    };
  }, []);

  return (
    <div
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
          className="nodrag nopan"
          style={{ zIndex: 2000 }}
        >
          <div
            ref={actionsRef}
            onMouseEnter={showMenu}
            onMouseLeave={scheduleHideMenu}
            onMouseUpCapture={handleActionsMouseUp}
            className={cn(
              "origin-top-left w-max transition-opacity duration-150",
              menuVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            )}
            style={{ transform: `scale(${zoom})` }}
          >
            <div className="flex flex-col items-start gap-2">
              {actions}
            </div>
          </div>
        </NodeToolbar>
      )}
    </div>
  );
}
