'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  GitBranch,
  Wand2,
  Cpu,
  FlaskConical,
  FileText,
  GripVertical,
} from 'lucide-react';
import { nodeTypeDefinitions, categoryLabels } from '@/config/node-definitions';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Database,
  GitBranch,
  Wand2,
  Cpu,
  FlaskConical,
  FileText,
};

interface NodePaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
}

export function NodePalette({ onDragStart }: NodePaletteProps) {
  // Group nodes by category
  const nodesByCategory = nodeTypeDefinitions.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = [];
    }
    acc[node.category].push(node);
    return acc;
  }, {} as Record<string, typeof nodeTypeDefinitions>);

  const categoryColorMap: Record<string, string> = {
    data: 'border-blue-500/50 bg-blue-500/10 hover:bg-blue-500/20',
    processing: 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20',
    training: 'border-orange-500/50 bg-orange-500/10 hover:bg-orange-500/20',
    tracking: 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20',
    output: 'border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b pr-10">
        <h2 className="font-semibold text-lg">Node Palette</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Drag nodes onto the canvas
        </p>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {Object.entries(nodesByCategory).map(([category, nodes]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-2">
                {nodes.map((node) => {
                  const Icon = iconMap[node.icon] || Database;
                  return (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => onDragStart(e, node.type)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-colors',
                        categoryColorMap[category]
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="p-2 rounded-md bg-background/50 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{node.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
