'use client';

import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CinematicThemeSwitcher from '@/components/ui/cinematic-theme-switcher';

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences.
          </DialogDescription>
        </DialogHeader>
        <Separator className="my-4" />
        <div className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Appearance</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode for the interface.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <CinematicThemeSwitcher size="sm" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
