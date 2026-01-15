'use client';

import React from 'react';
import { CanvasArea } from '@/components/editor/CanvasArea';
import { ChatController } from '@/components/editor/ChatController';

export default function Home() {
  return (
    <main className="flex h-screen w-screen bg-background overflow-hidden font-sans text-foreground">
      {/* Left: Canvas Area (Visuals) */}
      <div className="flex-1 h-full overflow-hidden relative">
        <CanvasArea />
      </div>

      {/* Right: Controller (Logic) */}
      <div className="h-full border-l shadow-2xl z-30">
        <ChatController />
      </div>
    </main>
  );
}
