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

    case "skip":
      const newData = { ...data };
      delete newData.nextId;

      node.data = newData;
      break;
  }

  return node;
}
