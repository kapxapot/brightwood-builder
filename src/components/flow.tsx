import "reactflow/dist/base.css";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, BackgroundVariant, type Connection, type ReactFlowInstance, type Node, type Edge, type OnSelectionChangeParams, useKeyPress, useReactFlow } from "reactflow";
import Toolbar from "./toolbar";
import ActionNode from "./nodes/action-node";
import SkipNode from "./nodes/skip-node";
import RedirectNode from "./nodes/redirect-node";
import FinishNode from "./nodes/finish-node";
import { StoryGraph, defaultViewport } from "../builders/story-graph-builder";
import { removeConnections, updateConnection } from "../lib/node-operations";
import { isAllowedConnection, isDeletable } from "../lib/node-checks";
import type { GraphNode, NodeEvent, OnChangeHandler, StoryInfoGraphNode, StoryNode, StoryNodeType } from "../entities/story-node";
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
import { isEmpty, truncateId } from "@/lib/common";
import { ValidationMessages } from "./validation-messages";
import { buildStory } from "@/builders/story-builder";
import { exportToJsonFile } from "@/lib/export";
import { ConfirmOverwriteStoryAlertDialog } from "./dialogs/confirm-overwrite-story-alert-dialog";
import { useToastMessages } from "@/hooks/use-toast-messages";
import { clearSearchParams, getSearchParams } from "@/lib/search";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/use-language";

const nodeTypes = {
  storyInfo: StoryInfoNode,
  action: ActionNode,
  skip: SkipNode,
  redirect: RedirectNode,
  finish: FinishNode
};

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
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

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
      if (!isAllowedConnection(conn, nodes)) {
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
          conn,
          curEdges.filter(e => e !== existingEdge)
        );
      });
    },
    [nodes, setNodes, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const nodeEventHandler = useCallback(
    (nodeId: string, event: NodeEvent) => {
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
                  : {
                    ...edge,
                    sourceHandle: String(numHandle - 1)
                  }
              });
            }
          );

          break;
      }
    },
    [setEdges]
  );

  const onNodeDataChange: OnChangeHandler = useCallback(
    (data: GraphNode, event?: NodeEvent) => {
      if (event) {
        nodeEventHandler(String(data.id), event);
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

      if (!reactFlowWrapper?.current || !reactFlowInstance) {
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

      const newNode: Node<StoryNode> = {
        id: String(nodeId),
        type,
        dragHandle: ".custom-drag-handle",
        position,
        data: buildNodeData(nodeId, type as StoryNodeType, onNodeDataChange)
      };

      setNodes(curNodes => curNodes.concat(newNode));
    },
    [reactFlowInstance, nodes, setNodes, onNodeDataChange]
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
  }, [deletePressed]);

  const saveStory = useCallback(() => {
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
  }, [t, getCurrentStoryData, getCurrentStoryGraph, reloadStories, showError, showSuccess]);

  const checkThenSaveStory = useCallback(() => {
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
  }, [t, getCurrentStoryData, isEtherealStory, reloadStories, saveStory, showError, stories]);

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
    setEdges(storyGraph.edges);
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
    const storyGraph = loadStoryGraph(id, onNodeDataChange);

    if (!storyGraph) {
      showError(t("Failed to load story."));
      return;
    }

    setLoadStoryDialogOpen(false);
    setStoryGraph(storyGraph);

    switchToStory(id);
  }

  function deleteStory(id: string) {
    removeStory(id);
    showSuccess(t("Story successfully deleted."));
    reloadStories();
  }

  function importStory(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      if (!reader.result) {
        showError(t(failedToReadFileError));
        return;
      }

      parseAndLoadStory(
        reader.result as string,
        t("Story successfully imported.")
      );
    };

    reader.onerror = () => {
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
      {newStoryAlertDialogOpen &&
        <NewStoryAlertDialog
          currentStoryTitle={currentStoryData?.title}
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
        <div className="flex-grow w-full" ref={reactFlowWrapper}>
          <ReactFlow
            key={currentStoryData?.uuid}
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
          >
            <Controls />
            <MiniMap
              zoomable
              pannable
              nodeColor={n => n.type ? colors[n.type as StoryNodeType].rgb : "gray"}
            />
            {!isEmpty(validationMessages) && (
              <ValidationMessages
                messages={validationMessages}
              />
            )}
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
    </>
  );
}
