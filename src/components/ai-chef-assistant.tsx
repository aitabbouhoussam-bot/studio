
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChefHat, Send } from "lucide-react";
import { Icons } from "./icons";
import { cn } from "@/lib/utils";
import { chatWithAssistant } from "@/lib/assistant-actions";
import { useToast } from "@/hooks/use-toast";

interface AiChefAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiChefAssistant({ isOpen, onClose }: AiChefAssistantProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Bonjour! I am Chef G, your personal AI Chef. 🍳 How can I help you cook up something wonderful today? You can ask me for recipe ideas, substitutions, or cooking advice." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        const result = await chatWithAssistant(newMessages);

        setIsLoading(false);

        if (result.success && result.data) {
            const assistantResponse: Message = { role: 'assistant', content: result.data };
            setMessages(prev => [...prev, assistantResponse]);
        } else {
             toast({
                variant: "destructive",
                title: "AI Assistant Error",
                description: result.error || "There was a problem communicating with the chef.",
            });
            // remove the user message if the call fails
            setMessages(messages);
        }
    };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            AI Chef Assistant
          </SheetTitle>
          <SheetDescription>
            Your culinary companion for suggestions, substitutions, and more.
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="flex-1 my-4 -mx-6 px-6" ref={scrollAreaRef}>
            <div className="space-y-6">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? "justify-end" : "")}>
                         {message.role === 'assistant' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback><ChefHat /></AvatarFallback>
                            </Avatar>
                         )}
                         <div className={cn(
                            "p-3 rounded-lg max-w-[80%]", 
                            message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                         )}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                         </div>
                         {message.role === 'user' && (
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                         )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                           <AvatarFallback><ChefHat /></AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-secondary">
                           <Icons.spinner className="animate-spin h-5 w-5" />
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>

        <SheetFooter className="mt-auto">
           <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for a low-carb recipe..." 
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
           </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
