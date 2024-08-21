import { OnChangeHandler, StoryNode, StoryNodeType } from "../entities/story-node";

export const buildNodeData = (
  id: number,
  key: string,
  type: StoryNodeType,
  changeHandler: OnChangeHandler
): StoryNode => {
  switch (type) {
    case "action":
      return {
        id,
        key,
        type,
        text: "",
        actions: [],
        onChange: changeHandler
      };

    case "skip":
      return {
        id,
        key,
        type,
        text: "",
        onChange: changeHandler
      };

    case "redirect":
      return {
        id,
        key,
        type,
        text: "",
        links: [],
        onChange: changeHandler
      };

    case "finish":
      return {
        id,
        key,
        type,
        text: "",
        onChange: changeHandler
      };
  }
};
