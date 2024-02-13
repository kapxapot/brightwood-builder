import Button from "./core/button";
import ToolbarBlock from "./toolbar-block";
import { ArrowLongRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { Bolt, Cube, LoadStory, NewStory, SaveStory, Skip, Stop } from "./core/icons";
import ConditionalTooltip from "./core/conditional-tooltip";
import Tooltip from "./core/tooltip";
import { load, save } from "@/lib/storage";

interface Props {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
}

export default function Toolbar({ onNew, onSave, onLoad }: Props) {
  const initialExpanded = load<boolean>("toolbarExpanded", true);
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggleExpanded = () => {
    const newExpanded = !expanded;
    save("toolbarExpanded", newExpanded);
    setExpanded(newExpanded);
  }

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
          tooltip="Choice"
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="action">
            <Bolt />
            {expanded && "Choice"}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip="Random"
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="redirect">
            <Cube />
            {expanded && "Random"}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip="Skip"
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="skip">
            <Skip />
            {expanded && "Skip"}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip="Finish"
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="finish">
            <Stop />
            {expanded && "Finish"}
          </ToolbarBlock>
        </ConditionalTooltip>
      </div>

      <div className={`flex flex-col items-center ${expanded ? "space-y-3" : "space-y-2"}`}>
        <Tooltip tooltip="New story" side="right">
          <Button size={expanded ? "large" : "toolbar"} onClick={onNew}>
            <NewStory />
            {expanded && "New"}
          </Button>
        </Tooltip>

        <Tooltip
          tooltip="Save story"
          side="right"
        >
          <Button size={expanded ? "large" : "toolbar"} onClick={onSave}>
            <SaveStory />
            {expanded && "Save"}
          </Button>
        </Tooltip>

        <Tooltip
          tooltip="Load story"
          side="right"
        >
          <Button size={expanded ? "large" : "toolbar"} onClick={onLoad} disabled={true}>
            <LoadStory />
            {expanded && "Load"}
          </Button>
        </Tooltip>
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
