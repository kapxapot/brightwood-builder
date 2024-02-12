import { CubeIcon } from "@heroicons/react/24/outline";
import { BoltIcon, ForwardIcon, NoSymbolIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import Tooltip from "./tooltip";

export const Bolt = () => <BoltIcon className={`w-5 text-green-600`} />;
export const Cube = () => <CubeIcon className={`w-5 text-yellow-600`} />;
export const Skip = () => <ForwardIcon className={`w-5 text-cyan-600`} />;
export const Stop = () => <NoSymbolIcon className={`w-5 text-red-600`} />;

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
