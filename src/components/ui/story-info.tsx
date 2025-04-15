import { useTranslation } from "react-i18next";
import { Node } from "reactflow";
import { GraphNode, StoryInfoGraphNode } from "@/entities/story-node";

type Props = {
  nodes: Node<GraphNode>[];
};

export default function StoryInfo({ nodes }: Props) {
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
    <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur rounded-md border border-stone-200 shadow-md p-2 flex gap-2 items-center">
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
  );
}
