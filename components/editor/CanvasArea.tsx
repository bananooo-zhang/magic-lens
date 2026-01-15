import React, { useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { ImageStack } from './ImageStack';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle2, ScanEye } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function CanvasArea() {
  const { originalImage, getCurrentImage, setOriginalImage, reset } = useEditorStore();
  const currentImage = getCurrentImage();
  const [isComparing, setIsComparing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          setOriginalImage(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `magic-lens-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (confirm("图片已保存！是否开启新的一张修图？")) {
        reset();
      }
    }
  };

  // Empty State
  if (!originalImage) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-muted/20 relative">
        <div className="text-center p-10 border-2 border-dashed border-muted-foreground/25 rounded-xl hover:border-primary/50 transition-colors bg-background/50">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">上传照片开始修图</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
            支持 JPG, PNG 格式。上传后即可开始对话式修图。
          </p>
          <div className="relative">
            <Button size="lg" className="px-8">
              选择图片
            </Button>
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
            />
          </div>
        </div>
      </div>
    );
  }

  // Display State
  // Determine which image to show: if comparing, show original, else show current
  const displayImage = isComparing ? originalImage : currentImage;

  return (
    <div className="flex-1 h-full flex flex-col relative bg-muted/10 overflow-hidden">
      {/* Main Canvas */}
      <div className="flex-1 relative flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayImage} // Animate when image changes
            initial={{ opacity: 0.9, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full max-w-4xl max-h-[80vh] shadow-2xl rounded-lg overflow-hidden border bg-black/5"
          >
            {displayImage && (
              <Image 
                src={displayImage} 
                alt="Canvas" 
                fill 
                className="object-contain" 
                priority
              />
            )}
            
            {/* Compare Badge Overlay */}
            {isComparing && (
               <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md pointer-events-none">
                 原始图片
               </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
           {/* Compare Button */}
           {originalImage !== currentImage && (
            <Button
              variant={isComparing ? "destructive" : "secondary"}
              className="shadow-lg backdrop-blur-md bg-white/80 hover:bg-white/90"
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onMouseLeave={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
            >
              <ScanEye className="w-4 h-4 mr-2" />
              {isComparing ? "松开结束对比" : "按住对比原图"}
            </Button>
           )}

           {/* Finish Button */}
           <Button onClick={handleDownload} className="shadow-lg">
             <CheckCircle2 className="w-4 h-4 mr-2" />
             就这张了
           </Button>
        </div>
      </div>

      {/* History Strip */}
      <ImageStack />
    </div>
  );
}
