'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Save,
  FolderOpen,
  FileDown,
  FileUp,
  Play,
  Square,
  RotateCcw,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react';
import { usePipelineStore } from '@/stores/pipeline-store';

export function PipelineToolbar() {
  const {
    currentPipeline,
    savedPipelines,
    isDirty,
    savePipeline,
    loadPipeline,
    createNewPipeline,
    deletePipeline,
    exportPipeline,
    importPipeline,
    reset,
  } = usePipelineStore();

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState(currentPipeline?.name || '');
  const [pipelineDescription, setPipelineDescription] = useState(
    currentPipeline?.description || ''
  );

  const handleSave = () => {
    if (pipelineName.trim()) {
      savePipeline(pipelineName.trim(), pipelineDescription.trim());
      setSaveDialogOpen(false);
    }
  };

  const handleExport = () => {
    const json = exportPipeline();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentPipeline?.name || 'pipeline'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importPipeline(text);
        if (!success) {
          alert('Failed to import pipeline. Please check the file format.');
        }
      }
    };
    input.click();
  };

  const handleRun = () => {
    // TODO: Implement pipeline execution
    console.log('Running pipeline...');
  };

  return (
    <div className="flex items-center gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg p-2 shadow-lg">
      {/* Pipeline Name */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-medium">
          {currentPipeline?.name || 'Untitled Pipeline'}
        </span>
        {isDirty && (
          <Badge variant="secondary" className="text-xs">
            Unsaved
          </Badge>
        )}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* New Pipeline */}
      <Button variant="ghost" size="sm" onClick={createNewPipeline}>
        <Plus className="w-4 h-4 mr-1" />
        New
      </Button>

      {/* Save */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Pipeline</DialogTitle>
            <DialogDescription>
              Give your pipeline a name and optional description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={pipelineName}
                onChange={(e) => setPipelineName(e.target.value)}
                placeholder="My ML Pipeline"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                value={pipelineDescription}
                onChange={(e) => setPipelineDescription(e.target.value)}
                placeholder="A brief description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Pipeline</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <FolderOpen className="w-4 h-4 mr-1" />
            Open
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open Pipeline</DialogTitle>
            <DialogDescription>
              Select a saved pipeline to open.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            {savedPipelines.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No saved pipelines yet.
              </p>
            ) : (
              <div className="space-y-2">
                {savedPipelines.map((pipeline) => (
                  <div
                    key={pipeline.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      loadPipeline(pipeline.id);
                      setLoadDialogOpen(false);
                    }}
                  >
                    <div>
                      <p className="font-medium">{pipeline.name}</p>
                      {pipeline.description && (
                        <p className="text-xs text-muted-foreground">
                          {pipeline.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {pipeline.nodes.length} nodes •{' '}
                        {new Date(pipeline.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePipeline(pipeline.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-6 w-px bg-border" />

      {/* Export/Import */}
      <Button variant="ghost" size="sm" onClick={handleExport}>
        <FileDown className="w-4 h-4 mr-1" />
        Export
      </Button>
      <Button variant="ghost" size="sm" onClick={handleImport}>
        <FileUp className="w-4 h-4 mr-1" />
        Import
      </Button>

      <div className="h-6 w-px bg-border" />

      {/* Run Controls */}
      <Button variant="default" size="sm" onClick={handleRun}>
        <Play className="w-4 h-4 mr-1" />
        Run Pipeline
      </Button>

      {/* More Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Canvas
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Pipeline
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
