'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { DatasetNodeData } from '@/types/pipeline';
import { BaseNodeComponent } from './base-node-component';
import { formatToRegexPattern, extensionMap } from './shared/utils';
import { ConnectionCheckResult } from './shared/types';

// Node content component for dataset
function DatasetNodeContent({ data }: { data: DatasetNodeData }) {
  const regexPattern = formatToRegexPattern(data.config.format);
  const formatDisplay = Array.isArray(data.config.format) 
    ? data.config.format.join(', ')
    : data.config.format || 'Not set';
  
  return (
    <div className="space-y-1 text-xs">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Source:</span>
        <span className="font-medium">{data.config.source || 'Not set'}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Format:</span>
        <span className="font-medium">{formatDisplay}</span>
      </div>
      {regexPattern && (
        <div className="text-[10px] text-muted-foreground break-all">
          <span className="text-muted-foreground">Filter: </span>
          <span className="font-mono">{regexPattern}</span>
        </div>
      )}
      {data.config.path && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Path:</span>
          <span className="font-medium truncate max-w-[150px]">{data.config.path}</span>
        </div>
      )}
    </div>
  );
}

// Dataset node component
function DatasetNodeComponent(props: NodeProps) {
  const data = props.data as DatasetNodeData & Record<string, unknown>;
  
  return (
    <BaseNodeComponent {...props} data={data}>
      <DatasetNodeContent data={data} />
    </BaseNodeComponent>
  );
}

export const DatasetNode = memo(DatasetNodeComponent);

// Utility function to check dataset connection and count files
export async function checkDatasetConnection(config: any): Promise<ConnectionCheckResult> {
  try {
    // Check if path is provided (except for ClearML which uses datasetId)
    if (!config.path && config.source !== 'clearml') {
      return { success: false, fileCount: 0, error: 'Path not configured' };
    }

    if (config.source === 'clearml' && !config.datasetId && !config.datasetProject) {
      return { success: false, fileCount: 0, error: 'ClearML Dataset ID or Project not configured' };
    }

    // Call the API endpoint to check dataset connection
    const response = await fetch('/api/dataset/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: config.source,
        path: config.path,
        format: config.format,
        // S3/MinIO specific
        bucket: config.bucket,
        region: config.region,
        endpoint: config.endpoint,
        // Azure specific
        container: config.container,
        // ClearML specific
        datasetId: config.datasetId,
        datasetProject: config.datasetProject,
        // Credentials
        credentials: config.credentials,
      }),
    });

    if (!response.ok) {
      return { 
        success: false, 
        fileCount: 0, 
        error: `API request failed: ${response.statusText}` 
      };
    }

    const result = await response.json();
    return {
      success: result.success,
      fileCount: result.fileCount,
      error: result.error,
    };
  } catch (error) {
    return { success: false, fileCount: 0, error: (error as Error).message };
  }
}
