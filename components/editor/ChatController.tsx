import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import { PresetChips } from './PresetChips';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ImagePlus, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function ChatController() {
  const { 
    originalImage, 
    setOriginalImage, 
    addHistoryItem, 
    isProcessing, 
    setIsProcessing,
    getCurrentImage 
  } = useEditorStore();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', content: '你好！我是你的专属修图助理。请上传照片，告诉我你想怎么修？比如“模拟CCD质感”或“把天空调蓝一点”。' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing || !originalImage) return;

    const userPrompt = input;
    setInput(''); // Clear input
    
    // 1. Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userPrompt };
    setMessages(prev => [...prev, userMsg]);
    
    // 2. Start Processing
    setIsProcessing(true);
    const tempId = 'processing-' + Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'assistant', content: '正在施展魔法中...' }]);

    try {
      // Get current image as context
      const currentImg = getCurrentImage();
      if (!currentImg) throw new Error("No image selected");

      // CALL API
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImg,
          prompt: userPrompt
        })
      });

      if (!response.ok) {
        // Try to parse error message from backend
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `请求失败 (状态码: ${response.status})`);
      }
      
      const data = await response.json();
      
      // 3. Update State with Result
      if (data.image) {
        addHistoryItem(data.image, userPrompt);
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { ...m, content: '修图完成！你可以继续输入指令进行微调。' } : m
        ));
      } else {
        throw new Error(data.error || '未收到图片数据');
      }

    } catch (error: any) {
      console.error(error);
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...m, content: `😿 修图遭遇了小挫折...\n原因：${error.message || "未知错误"}\n请稍后重试。` } : m
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          // Confirm if overriding
          if (originalImage && !confirm("上传新图片将清空当前的修图记录，确定吗？")) {
             return;
          }
          setOriginalImage(e.target.result);
          setMessages([
            { id: Date.now().toString(), role: 'assistant', content: '图片已加载！试试点击上方的预设词，或者直接告诉我你想怎么修。' }
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-l w-[350px] shadow-xl z-20">
      {/* 1. Header & Presets */}
      <div className="flex-none">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">AI 修图助手</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            Gemini 3.0 Pro
          </span>
        </div>
        <PresetChips onSelect={(txt) => setInput(txt)} />
      </div>

      {/* 2. Chat Area */}
      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3 text-sm",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="w-8 h-8 border">
                {msg.role === 'assistant' ? (
                  <>
                    <AvatarImage src="/bot-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="w-4 h-4" /></AvatarFallback>
                  </>
                ) : (
                  <>
                     <AvatarFallback className="bg-muted"><User className="w-4 h-4" /></AvatarFallback>
                  </>
                )}
              </Avatar>
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[80%]",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-foreground"
                )}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-3">
               <Avatar className="w-8 h-8 border">
                 <AvatarFallback className="bg-primary text-primary-foreground"><Sparkles className="w-4 h-4" /></AvatarFallback>
               </Avatar>
               <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground">
                 <Loader2 className="w-3 h-3 animate-spin" />
                 正在思考与绘制...
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 3. Input Area */}
      <div className="flex-none p-4 border-t bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="shrink-0"
            onClick={handleUploadClick}
            title="上传新图"
          >
            <ImagePlus className="w-4 h-4 text-muted-foreground" />
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入修图指令..."
            className="flex-1"
            disabled={isProcessing}
          />
          
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!input.trim() || isProcessing}
            className={cn(isProcessing && "opacity-50")}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <div className="text-[10px] text-center text-muted-foreground mt-2">
          AI 生成内容可能不准确，请仔细甄别。
        </div>
      </div>
    </div>
  );
}
