import { ArrowDownTrayIcon, ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, ArrowsPointingInIcon, ArrowsPointingOutIcon, BoltIcon, ChatBubbleBottomCenterTextIcon, CubeIcon, FlagIcon, FolderOpenIcon, ForwardIcon, NoSymbolIcon, PlusIcon, SparklesIcon, VariableIcon } from "@heroicons/react/24/outline";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Tooltip from "./tooltip";
import { colors } from "@/lib/constants";
import { useTranslation } from "react-i18next";

export const Bolt = () => <BoltIcon className={`size-5 shrink-0 ${colors.action.twIcon}`} />;
export const Cube = () => <CubeIcon className={`size-5 shrink-0 ${colors.redirect.twIcon}`} />;
export const Skip = () => <ForwardIcon className={`size-5 shrink-0 ${colors.skip.twIcon}`} />;
export const Stop = () => <NoSymbolIcon className={`size-5 shrink-0 ${colors.finish.twIcon}`} />;
export const Flag = () => <FlagIcon className={`size-5 shrink-0 ${colors.storyInfo.twIcon}`} />;
export const Sparkles = () => <SparklesIcon className="size-5 shrink-0 text-red-600" />;
export const Condition = () => <VariableIcon className="size-5 shrink-0 text-current" />;
export const Collapse = () => <ArrowsPointingInIcon className="size-5 shrink-0" />;
export const Expand = () => <ArrowsPointingOutIcon className="size-5 shrink-0" />;
export const Text = () => <ChatBubbleBottomCenterTextIcon className="size-5 shrink-0" />;

export const NewStory = () => <PlusIcon className="size-5 shrink-0 text-green-600" />;
export const SaveStory = () => <ArrowDownTrayIcon className="size-5 shrink-0 text-blue-600" />;
export const LoadStory = () => <FolderOpenIcon className="size-5 shrink-0 text-yellow-600" />;
export const ImportStory = () => <ArrowLeftEndOnRectangleIcon className="size-5 shrink-0 text-cyan-600" />;
export const ExportStory = () => <ArrowRightStartOnRectangleIcon className="size-5 shrink-0 text-pink-600" />;

export function DragHandle() {
  return <DragHandleDots2Icon className="size-4" />;
}

export function Edit() {
  const { t } = useTranslation();

  return (
    <Tooltip tooltip={t("Edit")} side="top">
      <PencilIcon className="size-4" />
    </Tooltip>
  );
}

export function Delete() {
  const { t } = useTranslation();

  return (
    <Tooltip tooltip={t("Delete")} side="top">
      <TrashIcon className="size-4 text-red-600" />
    </Tooltip>
  );
}
