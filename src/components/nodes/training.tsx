'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { TrainingNodeData } from '@/types/pipeline';
import { BaseNodeComponent } from './base-node-component';
import { NodeExecutionResult } from './shared/types';

// Node content component for training
function TrainingNodeContent({ data }: { data: TrainingNodeData }) {
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
      {data.config.epochs && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Epochs:</span>
          <span className="font-medium">{data.config.epochs}</span>
        </div>
      )}
      {data.config.batchSize && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Batch Size:</span>
          <span className="font-medium">{data.config.batchSize}</span>
        </div>
      )}
    </div>
  );
}

// Training node component
function TrainingNodeComponent(props: NodeProps) {
  const data = props.data as TrainingNodeData & Record<string, unknown>;
  
  return (
    <BaseNodeComponent {...props} data={data}>
      <TrainingNodeContent data={data} />
    </BaseNodeComponent>
  );
}

export const TrainingNode = memo(TrainingNodeComponent);

// Execute training
export async function executeTraining(config: any): Promise<NodeExecutionResult> {
  try {
    // Check cloud provider credentials
    if (config.cloudProvider !== 'local') {
      const hasCredentials = validateCloudCredentials(config);
      if (!hasCredentials) {
        return { 
          success: false, 
          message: `${config.cloudProvider.toUpperCase()} credentials not configured` 
        };
      }
    }

    // Simulate training
    const epochs = config.epochs || 10;
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      success: true,
      message: `Training completed (${epochs} epochs)`,
      data: {
        framework: config.framework,
        provider: config.cloudProvider,
        epochs,
        metrics: {
          loss: (Math.random() * 0.5).toFixed(4),
          accuracy: (0.85 + Math.random() * 0.1).toFixed(4),
        },
      },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

// Validate cloud credentials
function validateCloudCredentials(config: any): boolean {
  const creds = config.credentials || {};
  
  switch (config.cloudProvider) {
    case 'gcp':
      return !!(creds.gcpProjectId && creds.gcpServiceAccountKey);
    case 'aws':
      return !!(creds.awsAccessKeyId && creds.awsSecretAccessKey);
    case 'azure':
      return !!(creds.azureSubscriptionId && creds.azureClientId && creds.azureClientSecret);
    default:
      return true;
  }
}
