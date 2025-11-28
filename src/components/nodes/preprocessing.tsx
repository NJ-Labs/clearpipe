'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { PreprocessingNodeData } from '@/types/pipeline';
import { BaseNodeComponent } from './base-node-component';
import { NodeExecutionResult } from './shared/types';

// Node content component for preprocessing
function PreprocessingNodeContent({ data }: { data: PreprocessingNodeData }) {
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
      {data.config.inputColumns && data.config.inputColumns.length > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Input:</span>
          <span className="font-medium">{data.config.inputColumns.length} columns</span>
        </div>
      )}
    </div>
  );
}

// Preprocessing node component
function PreprocessingNodeComponent(props: NodeProps) {
  const data = props.data as PreprocessingNodeData & Record<string, unknown>;
  
  return (
    <BaseNodeComponent {...props} data={data}>
      <PreprocessingNodeContent data={data} />
    </BaseNodeComponent>
  );
}

export const PreprocessingNode = memo(PreprocessingNodeComponent);

// Execute preprocessing steps
export async function executePreprocessing(config: any): Promise<NodeExecutionResult> {
  try {
    const steps = config.steps || [];
    
    if (steps.length === 0) {
      return { success: false, message: 'No preprocessing steps configured' };
    }

    // Simulate preprocessing
    const enabledSteps = steps.filter((s: any) => s.enabled);
    
    for (let i = 0; i < enabledSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    return {
      success: true,
      message: `Executed ${enabledSteps.length} preprocessing steps`,
      data: {
        stepsExecuted: enabledSteps.length,
        totalSteps: steps.length,
      },
    };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
