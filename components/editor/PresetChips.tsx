import React from 'react';
import { APP_CONFIG } from '@/config/app.config';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';

interface PresetChipsProps {
  onSelect: (prompt: string) => void;
}

export function PresetChips({ onSelect }: PresetChipsProps) {
  return (
    <div className="w-full border-b bg-background/50 backdrop-blur-sm">
      <ScrollArea className="w-full whitespace-nowrap py-3">
        <div className="flex space-x-2 px-4">
          <div className="flex items-center text-xs text-muted-foreground font-medium mr-1">
            <Sparkles className="w-3 h-3 mr-1 text-yellow-500" />
            灵感预设:
          </div>
          {APP_CONFIG.presets.map((preset) => (
            <Button
              key={preset.id}
              variant="secondary"
              size="sm"
              className="h-7 text-xs rounded-full bg-primary/5 hover:bg-primary/10 text-primary border border-primary/10 shadow-sm"
              onClick={() => onSelect(preset.prompt)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  );
}
