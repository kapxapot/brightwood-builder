import Button from "./core/button";
import ToolbarBlock from "./toolbar-block";
import { ArrowLongRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";
import { Bolt, Cube, ExportStory, ImportStory, LoadStory, NewStory, SaveStory, Skip, Stop } from "./core/icons";
import ConditionalTooltip from "./core/conditional-tooltip";
import Tooltip from "./core/tooltip";
import { nodeLabels } from "@/lib/constants";
import { useExpanded } from "@/hooks/use-expanded";
import GitHubIcon from "./github-icon";
import { useTranslation } from "react-i18next";

type Handler = () => void;

type StoryButton = {
  label: string;
  tooltip: string;
  icon: ReactNode;
  handler: Handler;
  disabled?: boolean;
  disabledTooltip?: string;
};

interface Props {
  onNew: Handler;
  onSave: Handler;
  onLoad: Handler;
  onImport: Handler;
  onExport: Handler;
  exportEnabled: boolean;
}

export default function Toolbar({ onNew, onSave, onLoad, onImport, onExport, exportEnabled }: Props) {
  const { t } = useTranslation();
  const { expanded, toggleExpanded } = useExpanded("toolbarExpanded", true);

  const storyButtons: StoryButton[] = [
    {
      label: t("New"),
      tooltip: t("New story"),
      icon: <NewStory />,
      handler: onNew
    },
    {
      label: t("Save"),
      tooltip: t("Save story"),
      icon: <SaveStory />,
      handler: onSave
    },
    {
      label: t("Load"),
      tooltip: t("Load story"),
      icon: <LoadStory />,
      handler: onLoad
    },
    {
      label: t("Import"),
      tooltip: t("Import story"),
      icon: <ImportStory />,
      handler: onImport
    },
    {
      label: t("Export"),
      tooltip: t("Export story"),
      icon: <ExportStory />,
      handler: onExport,
      disabled: !exportEnabled,
      disabledTooltip: t("Can't export with validation issues")
    }
  ];

  return (
    <aside className={`flex flex-col gap-3 justify-between ${expanded ? "w-36 p-2" : "w-14 p-1.5"} bg-gray-300 text-center`}>
      <div className={`flex flex-col bg-gray-100 ${expanded ? "p-2 space-y-3" : "p-1.5 space-y-2"} rounded-md`}>
        <ConditionalTooltip
          tooltip={t("Drag")}
          show={!expanded}
          side="right"
        >
          <div className="flex gap-1 justify-center">
            {expanded && t("Drag")}
            <ArrowLongRightIcon className="w-5 mt-1" />
          </div>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={t(nodeLabels.action)}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="action">
            <Bolt />
            {expanded && t(nodeLabels.action)}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={t(nodeLabels.redirect)}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="redirect">
            <Cube />
            {expanded && t(nodeLabels.redirect)}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={t(nodeLabels.skip)}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="skip">
            <Skip />
            {expanded && t(nodeLabels.skip)}
          </ToolbarBlock>
        </ConditionalTooltip>

        <ConditionalTooltip
          tooltip={t(nodeLabels.finish)}
          show={!expanded}
          side="right"
        >
          <ToolbarBlock type="finish">
            <Stop />
            {expanded && t(nodeLabels.finish)}
          </ToolbarBlock>
        </ConditionalTooltip>
      </div>

      <div className={`flex flex-col items-center ${expanded ? "space-y-3" : "space-y-2"}`}>
        {storyButtons.map(({ label, tooltip, icon, handler, disabled, disabledTooltip }) => (
          <Tooltip
            tooltip={disabled ? disabledTooltip ?? tooltip : tooltip}
            side="right"
            key={label}
          >
            <Button
              size={expanded ? "large" : "toolbar"}
              onClick={disabled ? undefined : handler}
              disabled={disabled}
            >
              {icon}
              {expanded && label}
            </Button>
          </Tooltip>
        ))}
      </div>

      <div className="space-y-5">
        <div className={`flex ${!expanded && "flex-col"} items-center justify-center gap-3`}>
          <Tooltip
            tooltip={t("Brightwood Bot (Telegram)")}
            side="right"
          >
            <a href="https://t.me/BrightwoodBot" target="_blank" className="opacity-75 hover:opacity-100 transition-opacity">
              <img src="/images/tree.png" className="w-8 h-8 rounded-full" />
            </a>
          </Tooltip>

          <Tooltip
            tooltip={t("GitHub Repository")}
            side="right"
          >
            <a href="https://github.com/kapxapot/brightwood-builder" target="_blank">
              <GitHubIcon className="fill-gray-600 hover:fill-purple-800 w-8 h-8 transition-colors" />
            </a>
          </Tooltip>
        </div>

        <div className="text-right mr-1">
          <Tooltip
            tooltip={expanded ? t("Collapse") : t("Expand")}
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
      </div>
    </aside>
  );
}
