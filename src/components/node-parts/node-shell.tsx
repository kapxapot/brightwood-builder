import { cn } from "@/lib/utils";
import { type MouseEvent, type PropsWithChildren, type ReactNode, useEffect, useRef, useState } from "react";

type Props = {
  selected: boolean;
  color?: string;
  spaceY?: "normal" | "none";
  actions?: ReactNode;
  readonly?: boolean;
}

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
  const hideMenuTimeoutRef = useRef<number | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const hasActions = !!actions && !readonly;

  function clearHideMenuTimeout() {
    if (hideMenuTimeoutRef.current !== null) {
      window.clearTimeout(hideMenuTimeoutRef.current);
      hideMenuTimeoutRef.current = null;
    }
  }

  function showMenu() {
    clearHideMenuTimeout();
    setMenuVisible(true);
  }

  function hideMenu() {
    if (actionsRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur?.();
    }

    setMenuVisible(false);
  }

  function scheduleHideMenu() {
    clearHideMenuTimeout();
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
      onMouseEnter={hasActions ? showMenu : undefined}
      onMouseLeave={hasActions ? scheduleHideMenu : undefined}
    >
      <div className={spaceY === "normal" ? "space-y-2" : ""}>
        {children}
      </div>
      {hasActions && (
        <div
          ref={actionsRef}
          onMouseUpCapture={handleActionsMouseUp}
          className={cn(
            "absolute left-full top-0 z-20 w-max pl-1.5 transition-opacity duration-150",
            menuVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <div className="flex flex-col items-start gap-2">
            {actions}
          </div>
        </div>
      )}
    </div>
  );
}
