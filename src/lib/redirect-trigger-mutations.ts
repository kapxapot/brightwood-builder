import type { RedirectTrigger } from "@/entities/story-data";
import type { NodeEvent, StoryInfoGraphNode } from "@/entities/story-node";

function setStoryInfoRedirectTriggers(
  data: StoryInfoGraphNode,
  redirectTriggers: RedirectTrigger[] | undefined,
  event?: NodeEvent
) {
  const nextStoryData = {
    ...(data.data ?? {})
  };

  if (redirectTriggers?.length) {
    nextStoryData.redirectTriggers = redirectTriggers;
  } else {
    delete nextStoryData.redirectTriggers;
  }

  data.onChange?.(
    {
      ...data,
      data: Object.keys(nextStoryData).length ? nextStoryData : undefined
    },
    event
  );
}

export const addRedirectTrigger = (data: StoryInfoGraphNode) => {
  setStoryInfoRedirectTriggers(
    data,
    [
      ...(data.data?.redirectTriggers ?? []),
      {
        condition: ""
      }
    ]
  );
};

export const updateRedirectTrigger = (
  data: StoryInfoGraphNode,
  updatedIndex: number,
  updatedTrigger: RedirectTrigger
) => {
  setStoryInfoRedirectTriggers(
    data,
    (data.data?.redirectTriggers ?? []).map((redirectTrigger, index) =>
      index === updatedIndex ? updatedTrigger : redirectTrigger
    )
  );
};

export const setRedirectTriggers = (
  data: StoryInfoGraphNode,
  redirectTriggers: RedirectTrigger[]
) => {
  setStoryInfoRedirectTriggers(
    data,
    redirectTriggers,
    {
      type: "redirectTriggersReordered"
    }
  );
};

export const deleteRedirectTrigger = (
  data: StoryInfoGraphNode,
  index: number
) => {
  setStoryInfoRedirectTriggers(
    data,
    (data.data?.redirectTriggers ?? []).toSpliced(index, 1),
    {
      type: "handleRemoved",
      handle: String(index + 1)
    }
  );
};
