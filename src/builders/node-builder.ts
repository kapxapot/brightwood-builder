import { OnChangeHandler, StoryNode, StoryNodeType } from "../entities/story-node";

export const buildNodeData = (
  id: number,
  type: StoryNodeType,
  changeHandler: OnChangeHandler
): StoryNode => {
  switch (type) {
    case "action":
      return {
        id,
        type,
        text: "",
        actions: [],
        onChange: changeHandler
      };

    case "skip":
      return {
        id,
        type,
        text: "",
        onChange: changeHandler
      };

    case "redirect":
      return {
        id,
        type,
        text: "",
        links: [],
        onChange: changeHandler
      };

    case "finish":
      return {
        id,
        type,
        onChange: changeHandler
      };
  }
};
