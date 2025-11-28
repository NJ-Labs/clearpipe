'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { VersioningNodeData } from '@/types/pipeline';
import { BaseNodeComponent } from './base-node-component';
import { NodeExecutionResult } from './shared/types';

// Node content component for versioning
function VersioningNodeContent({ data }: { data: VersioningNodeData }) {
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
      {data.config.commitHash && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Commit:</span>
          <span className="font-medium font-mono text-[10px]">
            {data.config.commitHash.substring(0, 7)}
          </span>
        </div>
      )}
      {data.config.remoteUrl && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Remote:</span>
          <span className="font-medium truncate max-w-[150px]">{data.config.remoteUrl}</span>
        </div>
      )}
    </div>
  );
}

// Versioning node component
function VersioningNodeComponent(props: NodeProps) {
  const data = props.data as VersioningNodeData & Record<string, unknown>;
  
  return (
    <BaseNodeComponent {...props} data={data}>
      <VersioningNodeContent data={data} />
    </BaseNodeComponent>
  );
}

export const VersioningNode = memo(VersioningNodeComponent);

// Execute versioning node
export async function executeVersioning(config: any): Promise<NodeExecutionResult> {
  try {
    // Check if tool is configured
    if (!config.tool) {
      return { success: false, message: 'Versioning tool not configured' };
    }

    // Simulate versioning operation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock versioning result
    const newVersion = config.version || '1.0.0';
    const commitHash = Math.random().toString(36).substring(2, 9);

    return {
      success: true,
      message: `Version ${newVersion} created`,
      data: {
        version: newVersion,
        commitHash,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
