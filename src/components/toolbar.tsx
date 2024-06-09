import Button from "./core/button";
import ToolbarBlock from "./toolbar-block";
import { ArrowLongRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { Bolt, Cube, ExportStory, ImportStory, LoadStory, NewStory, SaveStory, Skip, Stop } from "./core/icons";
import ConditionalTooltip from "./core/conditional-tooltip";
import Tooltip from "./core/tooltip";
import { nodeLabels } from "@/lib/constants";
import { useExpanded } from "@/hooks/use-expanded";

type Handler = () => void;

type StoryButton = {
  label: string;
  tooltip: string;
  icon: ReactNode;
  handler: Handler;
};

interface Props {
  onNew: Handler;
  onSave: Handler;
  onLoad: Handler;
  onImport: Handler;
  onExport: Handler;
}

export default function Toolbar({ onNew, onSave, onLoad, onImport, onExport }: Props) {
  const { expanded, toggleExpanded } = useExpanded("toolbarExpanded", true);

  const storyButtons: StoryButton[] = [
    {
      label: "New",
      tooltip: "New story",
      icon: <NewStory />,
      handler: onNew
    },
    {
      label: "Save",
      tooltip: "Save story",
      icon: <SaveStory />,
      handler: onSave
    },
    {
      label: "Load",
      tooltip: "Load story",
      icon: <LoadStory />,
      handler: onLoad
    },
    {
      label: "Import",
      tooltip: "Import story",
      icon: <ImportStory />,
      handler: onImport
    },
    {
      label: "Export",
      tooltip: "Export story",
      icon: <ExportStory />,
      handler: onExport
    }
  ];

  return (
    <aside className={`flex flex-col justify-between ${expanded ? "w-36 p-2" : "w-14 p-1.5"} bg-gray-300 text-center`}>
      <div className={`flex flex-col bg-gray-100 ${expanded ? "p-2 space-y-3" : "p-1.5 space-y-2"} rounded-md`}>
        <ConditionalTooltip
          tooltip="Drag"
          show={!expanded}
          side="right"
        >
          <div className="flex gap-1 justify-center">
            {expanded && "Drag"}
            <ArrowLongRightIcon className="w-5 mt-1" />
          </div>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={nodeLabels.action}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="action">
            <Bolt />
            {expanded && nodeLabels.action}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={nodeLabels.redirect}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="redirect">
            <Cube />
            {expanded && nodeLabels.redirect}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={nodeLabels.skip}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="skip">
            <Skip />
            {expanded && nodeLabels.skip}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={nodeLabels.finish}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="finish">
            <Stop />
            {expanded && nodeLabels.finish}
          </ToolbarBlock>
        </ConditionalTooltip>
      </div>

      <div className={`flex flex-col items-center ${expanded ? "space-y-3" : "space-y-2"}`}>
        {storyButtons.map(({ label, tooltip, icon, handler }) => (
          <Tooltip
            tooltip={tooltip}
            side="right"
            key={label}
          >
            <Button size={expanded ? "large" : "toolbar"} onClick={handler}>
              {icon}
              {expanded && label}
            </Button>
          </Tooltip>
        ))}
      </div>

      <div className="text-right mr-1">
        <Tooltip
          tooltip={expanded ? "Collapse" : "Expand"}
          side="right"
        >
          <button className="hover:bg-gray-200 rounded-full p-1 transition ease-in-out duration-300" onClick={toggleExpanded}>
            {expanded
              ? <ChevronLeftIcon className="w-6" />
              : <ChevronRightIcon className="w-6" />
            }
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
