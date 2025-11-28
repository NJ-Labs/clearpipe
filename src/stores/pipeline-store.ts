import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
} from '@xyflow/react';
import {
  Pipeline,
  PipelineNode,
  PipelineEdge,
  PipelineNodeData,
  NodeStatus,
} from '@/types/pipeline';

interface PipelineState {
  // Current pipeline data
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  
  // Selected node for configuration panel
  selectedNodeId: string | null;
  
  // Pipeline metadata
  currentPipeline: Pipeline | null;
  savedPipelines: Pipeline[];
  
  // UI State
  isConfigPanelOpen: boolean;
  isDirty: boolean;
  
  // Node actions
  onNodesChange: OnNodesChange<PipelineNode>;
  onEdgesChange: OnEdgesChange<PipelineEdge>;
  onConnect: OnConnect;
  
  // CRUD operations
  addNode: (type: PipelineNodeData['type'], position: { x: number; y: number }) => string;
  updateNodeData: (nodeId: string, data: Partial<PipelineNodeData>) => void;
  updateNodeStatus: (nodeId: string, status: NodeStatus, message?: string) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  
  // Selection
  selectNode: (nodeId: string | null) => void;
  
  // Pipeline operations
  savePipeline: (name: string, description?: string) => void;
  loadPipeline: (pipelineId: string) => void;
  createNewPipeline: () => void;
  deletePipeline: (pipelineId: string) => void;
  exportPipeline: () => string;
  importPipeline: (jsonString: string) => boolean;
  
  // UI actions
  setConfigPanelOpen: (open: boolean) => void;
  
  // Reset
  reset: () => void;
}

// Default node configurations
const getDefaultNodeData = (type: PipelineNodeData['type']): PipelineNodeData => {
  const baseData = {
    status: 'idle' as NodeStatus,
    lastUpdated: new Date().toISOString(),
  };

  switch (type) {
    case 'dataset':
      return {
        ...baseData,
        type: 'dataset',
        label: 'Dataset',
        description: 'Load and configure your data source',
        config: {
          source: 'local',
          path: '',
          format: 'csv',
        },
      };
    case 'versioning':
      return {
        ...baseData,
        type: 'versioning',
        label: 'Data Versioning',
        description: 'Version your data and models',
        config: {
          tool: 'dvc',
          version: '1.0.0',
        },
      };
    case 'preprocessing':
      return {
        ...baseData,
        type: 'preprocessing',
        label: 'Preprocessing',
        description: 'Transform and prepare your data',
        config: {
          steps: [],
        },
      };
    case 'training':
      return {
        ...baseData,
        type: 'training',
        label: 'Model Training',
        description: 'Train your ML model',
        config: {
          framework: 'pytorch',
          cloudProvider: 'local',
          instanceType: 'local',
          instanceConfig: {},
          credentials: {},
          hyperparameters: {},
        },
      };
    case 'experiment':
      return {
        ...baseData,
        type: 'experiment',
        label: 'Experiment Tracking',
        description: 'Track experiments and metrics',
        config: {
          tracker: 'clearml',
          projectName: '',
          experimentName: '',
          credentials: {},
          logMetrics: true,
          logArtifacts: true,
          logHyperparameters: true,
        },
      };
    case 'report':
      return {
        ...baseData,
        type: 'report',
        label: 'Model Report',
        description: 'Generate model report and documentation',
        config: {
          title: 'Model Report',
          includeMetrics: true,
          includeVisualizations: true,
          includeModelCard: true,
          outputFormat: 'html',
        },
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};

// Nanoid polyfill for browser
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const usePipelineStore = create<PipelineState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      currentPipeline: null,
      savedPipelines: [],
      isConfigPanelOpen: false,
      isDirty: false,

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as PipelineNode[],
          isDirty: true,
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges) as PipelineEdge[],
          isDirty: true,
        });
      },

      onConnect: (connection: Connection) => {
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              animated: true,
            },
            get().edges
          ) as PipelineEdge[],
          isDirty: true,
        });
      },

      addNode: (type, position) => {
        const id = generateId();
        const newNode: PipelineNode = {
          id,
          type,
          position,
          data: getDefaultNodeData(type),
        };

        set({
          nodes: [...get().nodes, newNode],
          isDirty: true,
        });

        return id;
      },

      updateNodeData: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    ...data,
                    lastUpdated: new Date().toISOString(),
                  } as PipelineNodeData,
                }
              : node
          ),
          isDirty: true,
        });
      },

      updateNodeStatus: (nodeId, status, message) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    status,
                    statusMessage: message,
                    lastUpdated: new Date().toISOString(),
                  } as PipelineNodeData,
                }
              : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
          selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
          isDirty: true,
        });
      },

      duplicateNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const newId = generateId();
        const newNode: PipelineNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          data: {
            ...node.data,
            label: `${node.data.label} (copy)`,
          } as PipelineNodeData,
        };

        set({
          nodes: [...get().nodes, newNode],
          isDirty: true,
        });
      },

      selectNode: (nodeId) => {
        set({
          selectedNodeId: nodeId,
          isConfigPanelOpen: nodeId !== null,
        });
      },

      savePipeline: (name, description) => {
        const { nodes, edges, savedPipelines, currentPipeline } = get();
        const now = new Date().toISOString();

        const pipeline: Pipeline = {
          id: currentPipeline?.id || generateId(),
          name,
          description,
          nodes,
          edges,
          createdAt: currentPipeline?.createdAt || now,
          updatedAt: now,
          version: '1.0.0',
        };

        const existingIndex = savedPipelines.findIndex((p) => p.id === pipeline.id);
        const updatedPipelines =
          existingIndex >= 0
            ? savedPipelines.map((p, i) => (i === existingIndex ? pipeline : p))
            : [...savedPipelines, pipeline];

        set({
          currentPipeline: pipeline,
          savedPipelines: updatedPipelines,
          isDirty: false,
        });
      },

      loadPipeline: (pipelineId) => {
        const pipeline = get().savedPipelines.find((p) => p.id === pipelineId);
        if (pipeline) {
          set({
            nodes: pipeline.nodes,
            edges: pipeline.edges,
            currentPipeline: pipeline,
            selectedNodeId: null,
            isConfigPanelOpen: false,
            isDirty: false,
          });
        }
      },

      createNewPipeline: () => {
        set({
          nodes: [],
          edges: [],
          currentPipeline: null,
          selectedNodeId: null,
          isConfigPanelOpen: false,
          isDirty: false,
        });
      },

      deletePipeline: (pipelineId) => {
        set({
          savedPipelines: get().savedPipelines.filter((p) => p.id !== pipelineId),
          currentPipeline:
            get().currentPipeline?.id === pipelineId ? null : get().currentPipeline,
        });
      },

      exportPipeline: () => {
        const { nodes, edges, currentPipeline } = get();
        const exportData = {
          ...currentPipeline,
          nodes,
          edges,
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importPipeline: (jsonString) => {
        try {
          const data = JSON.parse(jsonString);
          if (data.nodes && data.edges) {
            set({
              nodes: data.nodes,
              edges: data.edges,
              currentPipeline: data.id ? data : null,
              isDirty: true,
            });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      setConfigPanelOpen: (open) => {
        set({ isConfigPanelOpen: open });
      },

      reset: () => {
        set({
          nodes: [],
          edges: [],
          selectedNodeId: null,
          currentPipeline: null,
          isConfigPanelOpen: false,
          isDirty: false,
        });
      },
    }),
    {
      name: 'clearpipe-storage',
      partialize: (state) => ({
        savedPipelines: state.savedPipelines,
      }),
    }
  )
);
