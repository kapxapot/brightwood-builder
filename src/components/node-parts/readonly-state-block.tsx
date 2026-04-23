import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

type Props = {
  label: string;
  value: unknown;
};

const formatJson = (value: unknown) => JSON.stringify(value, null, 2);

export default function ReadonlyStateBlock({ label, value }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (value === undefined) {
    return null;
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        className="w-full flex items-center gap-1 text-left"
        onClick={() => setExpanded(current => !current)}
        aria-expanded={expanded}
      >
        <span className="text-xs opacity-50 font-bold">
          {label}
        </span>
        {expanded
          ? <ChevronDownIcon className="w-3 h-3 opacity-70" />
          : <ChevronRightIcon className="w-3 h-3 opacity-70" />
        }
      </button>
      {expanded && (
        <pre className="border border-black border-opacity-20 rounded-lg border-dashed bg-white bg-opacity-50 px-2 py-1 text-xs whitespace-pre-wrap break-words nowheel">
          {formatJson(value)}
        </pre>
      )}
    </div>
  );
}
