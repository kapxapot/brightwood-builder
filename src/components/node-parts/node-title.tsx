import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import Button from "../core/button";

type Props = {
  id: number;
  label: string | number;
  expanded?: boolean;
  onToggleExpanded?: () => void;
}

export default function NodeTitle({ id, label, expanded, onToggleExpanded }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <div className="custom-drag-handle flex min-w-0 flex-1 cursor-grab items-center gap-2">
        {id > 0 && <span className="shrink-0 rounded-xl border border-gray-500 bg-gray-50 px-2">{id}</span>}
        <span className="min-w-0 flex-1 truncate font-semibold">{label}</span>
      </div>

      {onToggleExpanded && (
        <Button
          size="small"
          className="nodrag nopan shrink-0 border-transparent bg-transparent p-0.5 text-slate-600 enabled:hover:bg-black/5 enabled:hover:text-slate-900"
          aria-label={expanded ? t("Collapse") : t("Expand")}
          onClick={onToggleExpanded}
        >
          {expanded
            ? <ChevronDownIcon className="size-4" />
            : <ChevronRightIcon className="size-4" />
          }
        </Button>
      )}
    </div>
  )
}
