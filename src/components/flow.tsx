import "reactflow/dist/base.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type ReactFlowInstance, type Node, type Edge, type OnSelectionChangeParams, useKeyPress, useReactFlow, useUpdateNodeInternals } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import { StoryGraph, buildEdgeId, defaultViewport, nodeKey, normalizeEdgeIds, normalizeSourceHandle } from "../builders/story-graph-builder";
import { removeConnections, updateConnection } from "../lib/node-operations";
import { isAllowedConnection, isDeletable } from "../lib/node-checks";
import type { ActionStoryNode, GraphNode, NodeEvent, OnChangeHandler, RedirectStoryNode, StoryInfoGraphNode, StoryNode, StoryNodeType } from "../entities/story-node";
import StoryInfoNode from "./nodes/story-info-node";
import { buildNodeData } from "../builders/node-builder";
import { colors } from "../lib/constants";
import { removeCurrentStoryId, removeStory, storeCurrentStoryId, storeStory } from "@/lib/storage";
import { getParseErrorMessage, initStoryGraph, loadStoryGraph, newStoryGraph, parseStoryGraph } from "@/lib/story-graph";
import { NewStoryAlertDialog } from "./dialogs/new-story-alert-dialog";
import { LoadStoryDialog } from "./dialogs/load-story-dialog";
import { useStories } from "@/hooks/use-stories";
import { ImportStoryDialog } from "./dialogs/import-story-dialog";
import { ValidationMessage, validateNodes } from "@/lib/validation";
import { isEmpty, titleOrTruncatedId, truncateId } from "@/lib/common";
import { ValidationMessages } from "./validation-messages";
import { buildStory } from "@/builders/story-builder";
import { exportToJsonFile } from "@/lib/export";
import { ConfirmOverwriteStoryAlertDialog } from "./dialogs/confirm-overwrite-story-alert-dialog";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { clearSearchParams, getSearchParams } from "@/lib/search";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";
import CanvasOverlay from "./canvas-overlay";
import { autoArrangeStoryNodes } from "@/lib/node-auto-arrange";

const nodeTypes = {
  storyInfo: StoryInfoNode,
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

const canvasBusyReleaseDelayMs = 150;
const nodeInternalsRefreshDelayMs = 350;
const noStoryDataError = "Failed to get the current story data.";
const failedToReadFileError = "Failed to read the file.";

export default function Flow() {
  const { t } = useTranslation();
  const { languageCode } = useLanguage();

  const { showSuccess, showError } = useToastMessages();
  const { stories, reloadStories } = useStories();

  const [isEtherealStory, setIsEtherealStory] = useState(true);
  const [, setIsStoryFetching] = useState(false); // todo: show loading state

  const { setViewport } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    const [isNewStory, editStoryUrl] = getSearchParams("new", "edit");

    if (isNewStory !== null) {
      newStory();
    } else if (editStoryUrl) {
      fetchStoryData(editStoryUrl);
    } else {
      initAndSetStoryGraph();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setViewport]);

  function initAndSetStoryGraph() {
    const { storyGraph, isNewStory } = initStoryGraph(languageCode, onNodeDataChange);

    setStoryGraph(storyGraph);
    setIsEtherealStory(isNewStory);
  }

  const fetchStoryData = async (url: string) => {
    beginCanvasBusy(t("Loading story..."));
    setIsStoryFetching(true);

    try {
      if (!URL.canParse(url)) {
        throw new Error(t("Invalid story url."));
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(t("HTTP error: Status {{status}}.", { status: response.status }));
      }

      const storyData = await response.text();
      parseAndLoadStory(storyData);
    } catch (error) {
      const message = (error instanceof Error)
        ? error.message
        : t("Failed to fetch a story.");

      showError(message);

      // fallback to default strategy
      initAndSetStoryGraph();
    } finally {
      setIsStoryFetching(false);
      endCanvasBusy();
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const canvasBusyTimeoutRef = useRef<number | null>(null);
  const nodeInternalsRefreshFrameIdsRef = useRef<number[]>([]);
  const nodeInternalsRefreshTimeoutIdsRef = useRef<number[]>([]);

  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);
  const [canvasBusyMessage, setCanvasBusyMessage] = useState<string | null>(null);

  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([]);

  const [newStoryAlertDialogOpen, setNewStoryAlertDialogOpen] = useState(false);
  const [confirmOverwriteStoryAlertDialogOpen, setConfirmOverwriteStoryAlertDialogOpen] = useState(false);
  const [loadStoryDialogOpen, setLoadStoryDialogOpen] = useState(false);
  const [importStoryDialogOpen, setImportStoryDialogOpen] = useState(false);

  const newStoryAlertDialog = () => setNewStoryAlertDialogOpen(true);
  const confirmOverwriteStoryAlertDialog = () => setConfirmOverwriteStoryAlertDialogOpen(true);
  const loadStoryDialog = () => setLoadStoryDialogOpen(true);
  const importStoryDialog = () => setImportStoryDialogOpen(true);

  const deletePressed = useKeyPress(["Delete", "Backspace"]);
  const isCanvasBusy = canvasBusyMessage !== null;

  const beginCanvasBusy = useCallback((message: string, immediate = false) => {
    if (canvasBusyTimeoutRef.current !== null) {
      window.clearTimeout(canvasBusyTimeoutRef.current);
      canvasBusyTimeoutRef.current = null;
    }

    if (immediate) {
      flushSync(() => setCanvasBusyMessage(message));
      return;
    }

    setCanvasBusyMessage(message);
  }, []);

  const endCanvasBusy = useCallback((delay = canvasBusyReleaseDelayMs) => {
    if (canvasBusyTimeoutRef.current !== null) {
      window.clearTimeout(canvasBusyTimeoutRef.current);
    }

    canvasBusyTimeoutRef.current = window.setTimeout(() => {
      setCanvasBusyMessage(null);
      canvasBusyTimeoutRef.current = null;
    }, delay);
  }, []);

  useEffect(() => {
    return () => {
      if (canvasBusyTimeoutRef.current !== null) {
        window.clearTimeout(canvasBusyTimeoutRef.current);
      }

      nodeInternalsRefreshFrameIdsRef.current.forEach(window.cancelAnimationFrame);
      nodeInternalsRefreshTimeoutIdsRef.current.forEach(window.clearTimeout);
    };
  }, []);

  const scheduleNodeInternalsRefresh = useCallback((nodeId: string) => {
    const frameId = window.requestAnimationFrame(() => {
      updateNodeInternals(nodeId);

      nodeInternalsRefreshFrameIdsRef.current = nodeInternalsRefreshFrameIdsRef.current.filter(
        currentId => currentId !== frameId
      );

      const timeoutId = window.setTimeout(() => {
        updateNodeInternals(nodeId);

        nodeInternalsRefreshTimeoutIdsRef.current = nodeInternalsRefreshTimeoutIdsRef.current.filter(
          currentId => currentId !== timeoutId
        );
      }, nodeInternalsRefreshDelayMs);

      nodeInternalsRefreshTimeoutIdsRef.current.push(timeoutId);
    });

    nodeInternalsRefreshFrameIdsRef.current.push(frameId);
  }, [updateNodeInternals]);

  const getCurrentStoryData = useCallback(
    (): StoryInfoGraphNode | null => {
      const node = nodes.find(n => n.data.type === "storyInfo");
      return (node?.data as StoryInfoGraphNode) ?? null;
    },
    [nodes]
  );

  const currentStoryData = getCurrentStoryData();

  const getCurrentStoryGraph = useCallback(
    (): StoryGraph | null => reactFlowInstance
      ? reactFlowInstance.toObject() as StoryGraph
      : null,
    [reactFlowInstance]
  );

  useEffect(() => {
    const messages = validateNodes(t, nodes);
    setValidationMessages(messages);
  }, [t, nodes, edges]);

  const onConnect = useCallback(
    (conn: Connection) => {
      if (isCanvasBusy || !isAllowedConnection(conn, nodes)) {
        return;
      }

      setEdges(curEdges => {
        // remove any existing edge from the source if it exists
        // find an existing edge
        const existingEdge = curEdges.find(
          e => e.source === conn.source && e.sourceHandle === conn.sourceHandle
        );

        // update the node's data with new connection data
        const sourceHandle = conn.sourceHandle;
        const target = conn.target;

        if (sourceHandle !== null && target !== null) {
          setNodes(curNodes => curNodes.map(node => {
            return node.id === conn.source
              ? updateConnection(node, sourceHandle, target)
              : node;
          }));
        }

        // filter the existing edge from the resulting edges
        return addEdge(
          {
            ...conn,
            id: buildEdgeId(
              conn.source!,
              conn.target!,
              normalizeSourceHandle(conn.sourceHandle)
            )
          },
          curEdges.filter(e => e !== existingEdge)
        );
      });
    },
    [isCanvasBusy, nodes, setNodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodeEventHandler = useCallback(
    (data: GraphNode, event: NodeEvent) => {
      const nodeId = String(data.id);

      switch (event.type) {
        case "handleRemoved":
          // if the node's handle was removed, remove the corresponding edges
          setEdges(curEdges => {
            // remove the edge with the handler
            const filteredEdges = curEdges.filter(
              edge => edge.source !== nodeId || edge.sourceHandle !== event.handle
            );

            // update handlers for next edges (make them -1)
            return filteredEdges.map(edge => {
              const numHandle = Number(edge.sourceHandle);

              return (edge.source !== nodeId || numHandle < Number(event.handle))
                ? edge
                : (() => {
                  const sourceHandle = normalizeSourceHandle(numHandle - 1);

                  return {
                    ...edge,
                    id: buildEdgeId(edge.source, edge.target, sourceHandle),
                    sourceHandle
                  };
                })();
            });
          });

          scheduleNodeInternalsRefresh(nodeId);

          break;

        case "actionsReordered":
          // remove all node's edges and re-add them again
          setEdges(curEdges => {
            const actionData = data as ActionStoryNode;

            if (!actionData) {
              return curEdges;
            }

            // cut the node's edges
            let newEdges = curEdges.filter(
              edge => edge.source !== nodeId
            );

            // recreate node's edges
            for (let index = 0; index < actionData.actions.length; index++) {
              const action = actionData.actions[index];

              if (action.id) {
                newEdges = addEdge(
                  {
                    id: buildEdgeId(nodeId, action.id, index),
                    source: nodeId,
                    sourceHandle: normalizeSourceHandle(index),
                    target: String(action.id)
                  },
                  newEdges
                );
              }
            }

            return newEdges;
          });

          scheduleNodeInternalsRefresh(nodeId);

          break;

        case "linksReordered":
          // remove all node's edges and re-add them again
          setEdges(curEdges => {
            const redirectData = data as RedirectStoryNode;

            if (!redirectData) {
              return curEdges;
            }

            // cut the node's edges
            let newEdges = curEdges.filter(
              edge => edge.source !== nodeId
            );

            // recreate node's edges
            for (let index = 0; index < redirectData.links.length; index++) {
              const link = redirectData.links[index];

              if (link.id) {
                newEdges = addEdge(
                  {
                    id: buildEdgeId(nodeId, link.id, index),
                    source: nodeId,
                    sourceHandle: normalizeSourceHandle(index),
                    target: String(link.id)
                  },
                  newEdges
                );
              }
            }

            return newEdges;
          });

          scheduleNodeInternalsRefresh(nodeId);

          break;
        }
    },
    [scheduleNodeInternalsRefresh, setEdges]
  );

  const onNodeDataChange: OnChangeHandler = useCallback(
    (data: GraphNode, event?: NodeEvent) => {
      if (event) {
        nodeEventHandler(data, event);
      }

      setNodes(curNodes => curNodes.map(node => {
        if (node.data.id === data.id) {
          node.data = data;
        }

        return node;
      }));
    },
    [setNodes, nodeEventHandler]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (isCanvasBusy || !reactFlowWrapper?.current || !reactFlowInstance) {
        return;
      }

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      const nodeId = Math.max(...nodes.map(n => n.data.id)) + 1;
      const key = nodeKey(currentStoryData!.storyKey, nodeId);

      const newNode: Node<StoryNode> = {
        id: String(nodeId),
        type,
        dragHandle: ".custom-drag-handle",
        position,
        data: buildNodeData(nodeId, key, type as StoryNodeType, onNodeDataChange)
      };

      setNodes(curNodes => curNodes.concat(newNode));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCanvasBusy, reactFlowInstance, nodes, setNodes, onNodeDataChange]
  );

  const onEdgesDelete = useCallback(
    (curEdges: Edge[]) => {
      setNodes(curNodes => curNodes.map(node => {
        const nodeEdges = curEdges.filter(e => e.source === node.id);

        return nodeEdges.length
          ? removeConnections(node, nodeEdges)
          : node;
      }));
    },
    [setNodes]
  );

  const selectionChangeHandler = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodes(params.nodes);
      setSelectedEdges(params.edges);
    },
    []
  );

  const deleteEdges = useCallback(
    (selector: (edge: Edge) => boolean) => {
      setEdges(curEdges => {
        const edgesToDelete = curEdges.filter(selector);

        if (edgesToDelete.length) {
          onEdgesDelete(edgesToDelete);
        }

        return curEdges.filter(e => !edgesToDelete.includes(e));
      });
    },
    [setEdges, onEdgesDelete]
  );

  useEffect(() => {
    if (isCanvasBusy) {
      return;
    }

    // if storyInfo node is selected, do not allow deleting it
    // also do not allow deleting storyInfo edges if their targets are not deleted too
    const isNodeSelected = (node: Node) => selectedNodes.some(n => n.id === node.id);
    const isEdgeSelected = (edge: Edge) => selectedEdges.some(e => e.id === edge.id);

    deleteEdges(e => isEdgeSelected(e));

    setNodes(curNodes => {
      const nodesToDelete = curNodes.filter(n => isNodeSelected(n) && isDeletable(n));

      // find all the edges of the nodes to delete
      // delete these edges too
      deleteEdges(e => nodesToDelete.some(n => n.id === e.source || n.id === e.target));

      return curNodes.filter(n => !nodesToDelete.includes(n));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletePressed, isCanvasBusy]);

  const autoArrange = useCallback(() => {
    setNodes(curNodes => autoArrangeStoryNodes(curNodes as Node<GraphNode>[], edges));
    setEdges(curEdges => [...curEdges]);
  }, [edges, setEdges, setNodes]);

  const saveStory = useCallback(() => {
    if (isCanvasBusy) {
      return;
    }

    beginCanvasBusy(t("Saving story..."), true);

    try {
      const currentStoryData = getCurrentStoryData();
      const storyGraph = getCurrentStoryGraph();

      if (!currentStoryData || !storyGraph) {
        showError(t(noStoryDataError));
        return;
      }

      const { uuid: id, title } = currentStoryData;

      storeStory(
        { id, title },
        storyGraph
      );

      switchToStory(id);
      reloadStories();

      showSuccess(t("Story successfully saved."));
    } finally {
      endCanvasBusy();
    }
  }, [beginCanvasBusy, endCanvasBusy, getCurrentStoryData, getCurrentStoryGraph, isCanvasBusy, reloadStories, showError, showSuccess, t]);

  const checkThenSaveStory = useCallback(() => {
    if (isCanvasBusy) {
      return;
    }

    const currentStoryData = getCurrentStoryData();

    if (!currentStoryData) {
      showError(t(noStoryDataError));
      return;
    }

    // check if the current story is ethereal and a story with the same id
    // already exists, ask to overwrite
    reloadStories();
    const storyExists = stories.some(s => s.id === currentStoryData.uuid);

    if (!isEtherealStory || !storyExists) {
      saveStory();
      return;
    }

    confirmOverwriteStoryAlertDialog();
  }, [t, getCurrentStoryData, isCanvasBusy, isEtherealStory, reloadStories, saveStory, showError, stories]);

  function switchToEtherealStory() {
    removeCurrentStoryId();
    setIsEtherealStory(true);
  }

  function switchToStory(id: string) {
    storeCurrentStoryId(id);
    setIsEtherealStory(false);
    clearSearchParams();
  }

  function setStoryGraph(storyGraph: StoryGraph) {
    setNodes(storyGraph.nodes);
    setEdges(normalizeEdgeIds(storyGraph.edges));
    setViewport(storyGraph.viewport ?? defaultViewport);
  }

  function newStory() {
    setStoryGraph(
      newStoryGraph(languageCode, onNodeDataChange)
    );

    switchToEtherealStory();
  }

  function saveThenNewStory() {
    checkThenSaveStory();
    newStory();
  }

  function loadStory(id: string) {
    if (isCanvasBusy) {
      return;
    }

    beginCanvasBusy(t("Loading story..."), true);

    try {
      const storyGraph = loadStoryGraph(id, onNodeDataChange);

      if (!storyGraph) {
        showError(t("Failed to load story."));
        return;
      }

      setLoadStoryDialogOpen(false);
      setStoryGraph(storyGraph);

      switchToStory(id);
    } finally {
      endCanvasBusy();
    }
  }

  function deleteStory(id: string) {
    removeStory(id);
    showSuccess(t("Story successfully deleted."));
    reloadStories();
  }

  function importStory(file: File) {
    if (isCanvasBusy) {
      return;
    }

    beginCanvasBusy(t("Loading story..."), true);

    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        endCanvasBusy();
        showError(t(failedToReadFileError));
        return;
      }

      parseAndLoadStory(
        reader.result as string,
        t("Story successfully imported.")
      );

      endCanvasBusy();
    };

    reader.onerror = () => {
      endCanvasBusy();
      showError(t(failedToReadFileError));
    };

    reader.readAsText(file);
  }

  function parseAndLoadStory(storyData: string, customMessage?: string) {
    try {
      const storyGraph = parseStoryGraph(storyData, onNodeDataChange);

      setStoryGraph(storyGraph);
      switchToEtherealStory();

      showSuccess(
        customMessage ?? t("Story successfully loaded.")
      );
    } catch (error) {
      const message = getParseErrorMessage(t, error);
      showError(message);
    }
}

  function exportStory() {
    if (!isEmpty(validationMessages)) {
      return;
    }

    // convert current story graph to story (external format)
    const storyGraph = getCurrentStoryGraph();

    if (!storyGraph) {
      showError(t("Failed to get the current story graph."));
      return;
    }

    try {
      const story = buildStory(t, storyGraph);

      // download it
      const filename = `${story.title} - ${truncateId(story.id)}`;

      exportToJsonFile(story, filename);
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      }
    }
  }

  return (
    <>
      {newStoryAlertDialogOpen && currentStoryData &&
        <NewStoryAlertDialog
          storyName={titleOrTruncatedId(currentStoryData.title, currentStoryData.uuid)}
          open={newStoryAlertDialogOpen}
          onOpenChange={setNewStoryAlertDialogOpen}
          onSave={saveThenNewStory}
          onDontSave={newStory}
        />
      }
      {loadStoryDialogOpen &&
        <LoadStoryDialog
          stories={stories}
          open={loadStoryDialogOpen}
          onOpenChange={setLoadStoryDialogOpen}
          onLoadStory={loadStory}
          onDeleteStory={deleteStory}
        />
      }
      {importStoryDialogOpen &&
        <ImportStoryDialog
          open={importStoryDialogOpen}
          onOpenChange={setImportStoryDialogOpen}
          onImport={importStory}
        />
      }
      {confirmOverwriteStoryAlertDialogOpen && currentStoryData &&
        <ConfirmOverwriteStoryAlertDialog
          open={confirmOverwriteStoryAlertDialogOpen}
          onOpenChange={setConfirmOverwriteStoryAlertDialogOpen}
          onConfirm={saveStory}
          storyId={currentStoryData.uuid}
        />
      }
      <div className="w-screen h-screen flex flex-row flex-grow">
        <Toolbar
          onNew={newStoryAlertDialog}
          onSave={checkThenSaveStory}
          onLoad={loadStoryDialog}
          onImport={importStoryDialog}
          onExport={exportStory}
          exportEnabled={isEmpty(validationMessages)}
        />
        <div className="relative flex-grow w-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onSelectionChange={selectionChangeHandler}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeDragThreshold={1}
            onEdgesDelete={onEdgesDelete} // doesn't work currently
            deleteKeyCode={[]}
            className="bg-gray-100"
            nodeTypes={nodeTypes}
            disableKeyboardA11y={true}
            nodesDraggable={!isCanvasBusy}
            nodesConnectable={!isCanvasBusy}
            elementsSelectable={!isCanvasBusy}
            panOnDrag={!isCanvasBusy}
            zoomOnScroll={!isCanvasBusy}
            zoomOnPinch={!isCanvasBusy}
            zoomOnDoubleClick={!isCanvasBusy}
          >
            <Controls />

            <MiniMap
              zoomable
              pannable
              nodeColor={n => n.type ? colors[n.type as StoryNodeType].rgb : "gray"}
            />

            <CanvasOverlay
              nodes={nodes}
              onAutoArrange={autoArrange}
            />

            {!isEmpty(validationMessages) && (
              <ValidationMessages
                messages={validationMessages}
              />
            )}

            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>

          {isCanvasBusy && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/55 backdrop-blur-[2px]">
              <div className="flex items-center justify-center gap-4 rounded-2xl border border-stone-200 bg-white/95 px-6 py-5 shadow-xl">
                <div className="size-10 animate-spin rounded-full border-4 border-stone-300 border-t-stone-700" />
                <div className="text-xl font-semibold text-stone-700">
                  {canvasBusyMessage}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
