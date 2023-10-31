import type { Edge, Node } from "reactflow";
import type { StoryNode } from "../entities/story-node";

type NodeType = Node<StoryNode, string | undefined>;

export function updateConnection(node: NodeType, from?: string, to?: string): NodeType {
  const data = node.data;
  const fromId = Number(from);
  const toId = Number(to);

  switch (data.type) {
    case "action":
      if (data.actions) {
        node.data = {
          ...data,
          actions: data.actions.map(action => {
            return action.id === fromId
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
          links: data.links.map(link => {
            return link.id === fromId
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
          actions: data.actions.map(action => {
            if (sourceHandles.includes(String(action.id))) {
              const newAction = { ...action, id: 0 };
              // delete newAction.id;

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
          links: data.links.map(link => {
            if (sourceHandles.includes(String(link.id))) {
              const newLink = { ...link, id: 0 };
              // delete newLink.id;

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
