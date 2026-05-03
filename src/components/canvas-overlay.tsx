import { useTranslation } from "react-i18next";
import { Node } from "reactflow";
import { GraphNode, StoryInfoGraphNode } from "@/entities/story-node";
import { RectangleGroupIcon } from "@heroicons/react/24/outline";
import Button from "./core/button";

type Props = {
  nodes: Node<GraphNode>[];
  onAutoArrange?: () => void;
};

export default function CanvasOverlay({ nodes, onAutoArrange }: Props) {
  const { t } = useTranslation();

  const storyInfo = nodes.find(n => n.data.type === "storyInfo");
  const storyInfoData = storyInfo?.data as StoryInfoGraphNode | undefined;
  const storyTitle = storyInfoData?.title || t("Untitled Story");

  const nodeStats = {
    action: nodes.filter(n => n.data.type === "action").length,
    skip: nodes.filter(n => n.data.type === "skip").length,
    redirect: nodes.filter(n => n.data.type === "redirect").length,
    finish: nodes.filter(n => n.data.type === "finish").length
  };

  return (
    <div className="pointer-events-none absolute top-4 right-4 z-50 flex flex-col items-end gap-2">
      <div className="pointer-events-auto bg-white/90 backdrop-blur rounded-md border border-stone-200 shadow-md py-2 px-3 flex gap-2 items-center">
        <h2 className="font-semibold">{storyTitle}</h2>
        <div className="flex gap-1 text-sm font-semibold">
          <div className="text-green-600">
            {nodeStats.action}
          </div>
          <div className="text-cyan-600">
            {nodeStats.skip}
          </div>
          <div className="text-yellow-600">
            {nodeStats.redirect}
          </div>
          <div className="text-red-600">
            {nodeStats.finish}
          </div>
        </div>
      </div>
      <Button
        onClick={onAutoArrange}
        disabled={!storyInfoData?.startId}
        className="pointer-events-auto backdrop-blur shadow-md gap-1.5 px-2 py-1.5"
      >
        <RectangleGroupIcon className="w-5 shrink-0" />
        {t("Auto-arrange")}
      </Button>
    </div>
  );
}
