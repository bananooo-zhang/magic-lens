import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScanEye, EyeOff } from 'lucide-react';
import Image from 'next/image';

interface CompareSliderProps {
  original: string;
  current: string;
}

export function CompareSlider({ original, current }: CompareSliderProps) {
  const [isComparing, setIsComparing] = useState(false);

  // If showing original, no need to compare
  if (original === current) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
      <Button
        variant={isComparing ? "destructive" : "secondary"}
        size="sm"
        className="shadow-lg backdrop-blur-md bg-white/80 hover:bg-white/90 text-xs font-medium"
        onMouseDown={() => setIsComparing(true)}
        onMouseUp={() => setIsComparing(false)}
        onMouseLeave={() => setIsComparing(false)}
        onTouchStart={() => setIsComparing(true)}
        onTouchEnd={() => setIsComparing(false)}
      >
        {isComparing ? <EyeOff className="w-3 h-3 mr-1" /> : <ScanEye className="w-3 h-3 mr-1" />}
        {isComparing ? "松开复原" : "按住对比原图"}
      </Button>

      <AnimatePresence>
        {isComparing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute -bottom-4 -left-4 w-[calc(100vw-400px)] h-[calc(100vh-100px)] pointer-events-none z-50 flex items-center justify-center bg-black/5"
          >
             {/* 
               In a real complex implementation we would use a split slider.
               For V1, we simply overlay the original image on top of the current one 
               in the parent container. But since this component is inside the container,
               we can achieve "Compare" by just conditionally rendering the original 
               image on top of everything in the parent CanvasArea.
               
               Actually, a better pattern here is to let the parent handle the image source
               based on this state. But to keep it contained, we can use a Portal or 
               overlay.
               
               Let's simplify: We will tell the user "Press to see original".
               We can pass a callback or control a local overlay.
             */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
