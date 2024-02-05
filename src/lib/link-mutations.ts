import { Link, RedirectStoryNode } from "../entities/story-node";
import { weights } from "./constants";

export const addLink = (data: RedirectStoryNode) => {
  data.onChange?.({
    ...data,
    links: [
      ...data.links,
      {
        weight: weights.min
      }
    ]
  });
}

export const updateLink = (data: RedirectStoryNode, updatedIndex: number, updatedLink: Link) => {
  data.onChange?.({
    ...data,
    links: data.links.map(
      (link, index) => index === updatedIndex ? updatedLink : link
    )
  });
};

export const deleteLink = (data: RedirectStoryNode, index: number) => {
  data.onChange?.(
    {
      ...data,
      links: data.links.toSpliced(index, 1)
    },
    {
      type: "handleRemoved",
      handle: String(index)
    }
  );
};
