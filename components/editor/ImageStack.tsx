import React, { useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Image from 'next/image';

export function ImageStack() {
  const { originalImage, history, currentIndex, setCurrentIndex } = useEditorStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to right when history updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        const scrollArea = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollArea) {
          scrollArea.scrollLeft = scrollArea.scrollWidth;
        }
      }, 100);
    }
  }, [history.length]);

  if (!originalImage) return null;

  return (
    <div className="w-full h-24 bg-background/50 backdrop-blur border-t flex items-center p-2 relative z-10">
      <ScrollArea className="w-full whitespace-nowrap" ref={scrollContainerRef}>
        <div className="flex space-x-4 p-2">
          {/* Original Image - Always first */}
          <div 
            onClick={() => setCurrentIndex(-1)}
            className={cn(
              "relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 shrink-0",
              currentIndex === -1 ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image 
              src={originalImage} 
              alt="Original" 
              fill 
              className="object-cover" 
            />
            <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-white text-center py-0.5">
              原图
            </div>
          </div>

          {/* History Items */}
          {history.map((item, idx) => (
            <div 
              key={item.id}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 shrink-0",
                currentIndex === idx ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image 
                src={item.image} 
                alt={`Edit ${idx + 1}`} 
                fill 
                className="object-cover" 
              />
              <div className="absolute bottom-0 w-full bg-black/60 text-[10px] text-white text-center py-0.5 truncate px-1">
                {idx + 1}. {item.prompt}
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
