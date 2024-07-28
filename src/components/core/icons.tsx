import { ArrowDownTrayIcon, ArrowLeftEndOnRectangleIcon, ArrowRightStartOnRectangleIcon, BoltIcon, CubeIcon, FlagIcon, FolderOpenIcon, ForwardIcon, NoSymbolIcon, PlusIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Tooltip from "./tooltip";
import { colors } from "@/lib/constants";

export const Bolt = () => <BoltIcon className={`w-5 shrink-0 ${colors.action.twIcon}`} />;
export const Cube = () => <CubeIcon className={`w-5 ${colors.redirect.twIcon}`} />;
export const Skip = () => <ForwardIcon className={`w-5 ${colors.skip.twIcon}`} />;
export const Stop = () => <NoSymbolIcon className={`w-5 ${colors.finish.twIcon}`} />;
export const Flag = () => <FlagIcon className={`w-5 ${colors.storyInfo.twIcon}`} />;

export const NewStory = () => <PlusIcon className="w-5 text-green-600" />;
export const SaveStory = () => <ArrowDownTrayIcon className="w-5 text-blue-600" />;
export const LoadStory = () => <FolderOpenIcon className="w-5 text-yellow-600" />;
export const ImportStory = () => <ArrowLeftEndOnRectangleIcon className="w-5 text-cyan-600" />;
export const ExportStory = () => <ArrowRightStartOnRectangleIcon className="w-5 text-pink-600" />;

export const Edit = () => (
  <Tooltip tooltip="Edit" side="top">
    <PencilIcon className="w-4" />
  </Tooltip>
);

export const Delete = () => (
  <Tooltip tooltip="Delete" side="top">
    <TrashIcon className="w-4 text-red-600" />
  </Tooltip>
);
