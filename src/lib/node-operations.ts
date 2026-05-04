import type { Edge } from "reactflow";
import type { NodeType } from "./types";

export function updateConnection(node: NodeType, sourceHandle: string, target: string): NodeType {
  const data = node.data;
  const fromIndex = Number(sourceHandle);
  const toId = Number(target);

  switch (data.type) {
    case "action":
      if (data.actions) {
        node.data = {
          ...data,
          actions: data.actions.map((action, index) => {
            return index === fromIndex
              ? { ...action, id: toId }
              : action;
          })
        };
      }

      break;

    case "redirect":
      if (data.links) {
        node.data = {
          ...data,
          links: data.links.map((link, index) => {
            return index === fromIndex
              ? { ...link, id: toId }
              : link;
          })
        };
      }

      break;

    case "skip":
      node.data = {
        ...data,
        nextId: toId
      };

      break;

    case "storyInfo":
      if (fromIndex === 0) {
        node.data = {
          ...data,
          startId: toId
        };

        break;
      }

      if (data.data?.redirectTriggers) {
        node.data = {
          ...data,
          data: {
            ...data.data,
            redirectTriggers: data.data.redirectTriggers.map((redirectTrigger, index) => {
              return index === fromIndex - 1
                ? { ...redirectTrigger, targetId: toId }
                : redirectTrigger;
            })
          }
        };
      }

      break;
  }

  return node;
}

export function removeConnections(node: NodeType, edges: Edge[]): NodeType {
  const sourceHandles = edges.map(e => e.sourceHandle);
  const data = node.data;

  switch (data.type) {
    case "action":
      if (data.actions) {
        node.data = {
          ...data,
          actions: data.actions.map((action, index) => {
            if (sourceHandles.includes(String(index))) {
              const newAction = { ...action };
              delete newAction.id;

              return newAction;
            }

            return action;
          })
        };
      }

      break;

    case "redirect":
      if (data.links) {
        node.data = {
          ...data,
          links: data.links.map((link, index) => {
            if (sourceHandles.includes(String(index))) {
              const newLink = { ...link };
              delete newLink.id;

              return newLink;
            }

            return link;
          })
        };
      }

      break;

    case "skip": {
      const newSkipData = { ...data };
      delete newSkipData.nextId;

      node.data = newSkipData;
      break;
    }

    case "storyInfo": {
      const removedHandleIndexes = new Set(
        sourceHandles.map(sourceHandle => Number(sourceHandle ?? 0))
      );
      const newStoryInfoData = { ...data };

      if (removedHandleIndexes.has(0)) {
        delete newStoryInfoData.startId;
      }

      if (data.data) {
        const nextStoryData = { ...data.data };

        if (data.data.redirectTriggers) {
          nextStoryData.redirectTriggers = data.data.redirectTriggers.map((redirectTrigger, index) => {
            if (!removedHandleIndexes.has(index + 1)) {
              return redirectTrigger;
            }

            const nextRedirectTrigger = { ...redirectTrigger };
            delete nextRedirectTrigger.targetId;

            return nextRedirectTrigger;
          });
        }

        newStoryInfoData.data = Object.keys(nextStoryData).length
          ? nextStoryData
          : undefined;
      }

      node.data = newStoryInfoData;
      break;
    }
  }

  return node;
}
