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
import { Bounce } from "./motion/bounce";
import { motion } from "framer-motion";
import { GlobalLanguageSelector } from "./global-language-selector";

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

  const scale = {
    initial: {
      scale: 1
    },
    animate: {
      scale: expanded ? 1 : 1.2
    }
  };

  const slide = {
    initial: {
      x: 0
    },
    animate: {
      x: expanded ? 4 : 0
    }
  };

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
    <aside className={`flex flex-col gap-3 justify-between ${expanded ? "min-w-[8.5rem]" : "min-w-14"} bg-gray-300`}>
      <div>
        <div className={`my-1 flex items-center justify-center gap-2 ${expanded ? "p-2" : "p-1.5"}`}>
          <img src="/images/leaves.png" className="w-8 h-8 rounded-full" />
          {expanded && (
            <div className="text-left leading-[1.1]">
              Brightwood<br />
              Builder
            </div>
          )}
        </div>

        <div className={`flex flex-col bg-gray-200 ${expanded ? "p-2 space-y-3" : "p-1.5 space-y-2"}`}>
          <ConditionalTooltip
            tooltip={t("Drag")}
            show={!expanded}
            side="right"
          >
            <div className="flex gap-1 justify-center">
              <Bounce
                className="flex gap-1"
                xOffset={expanded ? 6 : 3}
                duration={expanded ? 0.8 : 0.4}
              >
                {expanded && t("Drag")}
                <ArrowLongRightIcon className="w-5 mt-1" />
              </Bounce>
            </div>
          </ConditionalTooltip>

          <ConditionalTooltip
            tooltip={t(nodeLabels.action)}
            show={!expanded}
            side="right"
          >
            <ToolbarBlock type="action" expanded={expanded}>
              <Bolt />
              {expanded && t(nodeLabels.action)}
            </ToolbarBlock>
          </ConditionalTooltip>

          <ConditionalTooltip
            tooltip={t(nodeLabels.redirect)}
            show={!expanded}
            side="right"
          >
            <ToolbarBlock type="redirect" expanded={expanded}>
              <Cube />
              {expanded && t(nodeLabels.redirect)}
            </ToolbarBlock>
          </ConditionalTooltip>

          <ConditionalTooltip
            tooltip={t(nodeLabels.skip)}
            show={!expanded}
            side="right"
          >
            <ToolbarBlock type="skip" expanded={expanded}>
              <Skip />
              {expanded && t(nodeLabels.skip)}
            </ToolbarBlock>
          </ConditionalTooltip>

          <ConditionalTooltip
            tooltip={t(nodeLabels.finish)}
            show={!expanded}
            side="right"
          >
            <ToolbarBlock type="finish" expanded={expanded}>
              <Stop />
              {expanded && t(nodeLabels.finish)}
            </ToolbarBlock>
          </ConditionalTooltip>
        </div>
      </div>

      <div className={`flex flex-col ${expanded ? "gap-1" : "gap-2 items-center"}`}>
        {storyButtons.map(({ label, tooltip, icon, handler, disabled, disabledTooltip }) => (
          <Tooltip
            tooltip={disabled ? (disabledTooltip ?? tooltip) : tooltip}
            side="right"
            key={label}
          >
            <motion.button
              className={`flex gap-1.5 ${expanded ? "pl-3" : "px-1 rounded-md"} py-1 items-center w-full transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={disabled ? undefined : handler}
              disabled={disabled}
              initial="initial"
              animate="initial"
              whileHover="animate"
              variants={scale}
            >
              <motion.span
                className="flex gap-1"
                variants={slide}
              >
                {icon}
                {expanded &&
                  <span>{label}</span>
                }
              </motion.span>
            </motion.button>
          </Tooltip>
        ))}
      </div>

      <div className={expanded ? "p-2" : "p-1.5"}>
        <Tooltip
          tooltip={t("Switch interface language")}
          side="right"
        >
          <GlobalLanguageSelector expanded={expanded} />
        </Tooltip>
      </div>

      <div className={`space-y-3 ${expanded ? "p-2" : "p-1.5"}`}>
        <div className={`flex ${!expanded && "flex-col"} items-center justify-center gap-3`}>
          <Tooltip
            tooltip={t("Brightwood Bot (Telegram)")}
            side={expanded ? "top" : "right"}
          >
            <a
              href="https://t.me/BrightwoodBot"
              target="_blank"
              className="opacity-75 hover:opacity-100 transition-opacity"
            >
              <img
                src="/images/tree.png"
                className="w-8 h-8 rounded-full"
              />
            </a>
          </Tooltip>

          <Tooltip
            tooltip={t("GitHub Repository")}
            side={expanded ? "top" : "right"}
          >
            <a
              href="https://github.com/kapxapot/brightwood-builder"
              target="_blank"
            >
              <GitHubIcon className="fill-gray-600 hover:fill-purple-800 w-8 h-8 transition-colors" />
            </a>
          </Tooltip>
        </div>

        <div className={expanded ? "text-right mr-1" : "text-center"}>
          <Tooltip
            tooltip={t(expanded ? "Collapse" : "Expand")}
            side={expanded ? "left" : "right"}
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
