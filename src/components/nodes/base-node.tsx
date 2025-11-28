'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Database,
  GitBranch,
  Wand2,
  Cpu,
  FlaskConical,
  FileText,
  Settings,
  Trash2,
  Copy,
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { PipelineNodeData, NodeStatus } from '@/types/pipeline';
import { usePipelineStore } from '@/stores/pipeline-store';
import { categoryColors } from '@/config/node-definitions';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  dataset: Database,
  versioning: GitBranch,
  preprocessing: Wand2,
  training: Cpu,
  experiment: FlaskConical,
  report: FileText,
};

const statusIconMap: Record<NodeStatus, React.ComponentType<{ className?: string }>> = {
  idle: AlertCircle,
  running: Loader2,
  completed: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const statusColorMap: Record<NodeStatus, string> = {
  idle: 'text-gray-400',
  running: 'text-blue-500 animate-spin',
  completed: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
};

const categoryColorMap: Record<string, string> = {
  data: 'border-blue-500/50 bg-blue-500/5',
  processing: 'border-purple-500/50 bg-purple-500/5',
  training: 'border-orange-500/50 bg-orange-500/5',
  tracking: 'border-green-500/50 bg-green-500/5',
  output: 'border-pink-500/50 bg-pink-500/5',
};

const getCategoryFromType = (type: string): string => {
  switch (type) {
    case 'dataset':
    case 'versioning':
      return 'data';
    case 'preprocessing':
      return 'processing';
    case 'training':
      return 'training';
    case 'experiment':
      return 'tracking';
    case 'report':
      return 'output';
    default:
      return 'data';
  }
};

interface BaseNodeProps extends NodeProps {
  data: PipelineNodeData & Record<string, unknown>;
}

function BaseNode({ id, data, selected }: BaseNodeProps) {
  const { selectNode, deleteNode, duplicateNode } = usePipelineStore();
  
  const Icon = iconMap[data.type] || Database;
  const StatusIcon = statusIconMap[data.status];
  const category = getCategoryFromType(data.type);

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateNode(id);
  };

  return (
    <div
      className={cn(
        'relative min-w-[280px] rounded-lg border-2 bg-card shadow-lg transition-all',
        categoryColorMap[category],
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />

      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'p-2 rounded-md',
              category === 'data' && 'bg-blue-500/20',
              category === 'processing' && 'bg-purple-500/20',
              category === 'training' && 'bg-orange-500/20',
              category === 'tracking' && 'bg-green-500/20',
              category === 'output' && 'bg-pink-500/20'
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <p className="text-xs text-muted-foreground">{data.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <StatusIcon className={cn('w-4 h-4', statusColorMap[data.status])} />
        </div>
      </div>

      {/* Content - varies by node type */}
      <div className="p-3">
        <NodeContent data={data} />
      </div>

      {/* Footer with actions */}
      <div className="flex items-center justify-between p-2 border-t border-border/50 bg-muted/30">
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {data.type}
          </Badge>
          {data.statusMessage && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {data.statusMessage}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleConfigure}
          >
            <Settings className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDuplicate}
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background"
      />
    </div>
  );
}

// Node content renderer based on type
function NodeContent({ data }: { data: PipelineNodeData }) {
  switch (data.type) {
    case 'dataset':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Source:</span>
            <span className="font-medium">{data.config.source || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format:</span>
            <span className="font-medium">{data.config.format || 'Not set'}</span>
          </div>
          {data.config.path && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Path:</span>
              <span className="font-medium truncate max-w-[150px]">{data.config.path}</span>
            </div>
          )}
        </div>
      );

    case 'versioning':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tool:</span>
            <span className="font-medium">{data.config.tool || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version:</span>
            <span className="font-medium">{data.config.version || 'Not set'}</span>
          </div>
        </div>
      );

    case 'preprocessing':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Steps:</span>
            <span className="font-medium">{data.config.steps?.length || 0} configured</span>
          </div>
          {data.config.steps?.slice(0, 2).map((step) => (
            <div key={step.id} className="text-muted-foreground truncate">
              • {step.name}
            </div>
          ))}
          {(data.config.steps?.length || 0) > 2 && (
            <div className="text-muted-foreground">
              +{data.config.steps!.length - 2} more...
            </div>
          )}
        </div>
      );

    case 'training':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Framework:</span>
            <span className="font-medium">{data.config.framework}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Provider:</span>
            <span className="font-medium">{data.config.cloudProvider}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Instance:</span>
            <span className="font-medium">{data.config.instanceType || 'Not set'}</span>
          </div>
        </div>
      );

    case 'experiment':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tracker:</span>
            <span className="font-medium">{data.config.tracker}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium truncate max-w-[150px]">
              {data.config.projectName || 'Not set'}
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {data.config.logMetrics && <Badge variant="secondary" className="text-[10px] px-1">Metrics</Badge>}
            {data.config.logArtifacts && <Badge variant="secondary" className="text-[10px] px-1">Artifacts</Badge>}
            {data.config.logHyperparameters && <Badge variant="secondary" className="text-[10px] px-1">Params</Badge>}
          </div>
        </div>
      );

    case 'report':
      return (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium truncate max-w-[150px]">{data.config.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format:</span>
            <span className="font-medium uppercase">{data.config.outputFormat}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {data.config.includeMetrics && <Badge variant="secondary" className="text-[10px] px-1">Metrics</Badge>}
            {data.config.includeVisualizations && <Badge variant="secondary" className="text-[10px] px-1">Charts</Badge>}
            {data.config.includeModelCard && <Badge variant="secondary" className="text-[10px] px-1">Model Card</Badge>}
          </div>
        </div>
      );

    default:
      return null;
  }
}

export const DatasetNode = memo(BaseNode);
export const VersioningNode = memo(BaseNode);
export const PreprocessingNode = memo(BaseNode);
export const TrainingNode = memo(BaseNode);
export const ExperimentNode = memo(BaseNode);
export const ReportNode = memo(BaseNode);

export const nodeTypes = {
  dataset: DatasetNode,
  versioning: VersioningNode,
  preprocessing: PreprocessingNode,
  training: TrainingNode,
  experiment: ExperimentNode,
  report: ReportNode,
};
