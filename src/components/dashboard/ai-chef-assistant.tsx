
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useRef, useEffect, FormEvent } from 'react';
import type { Message } from '@/ai/schemas/assistant-schemas';
import { getAssistantResponseAction } from '@/lib/actions/assistant-actions';
import { Icons } from '../icons';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';

interface AiChefAssistantProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialMessages: Message[] = [
  {
    role: 'model',
    content: "Bonjour! I am Chef AI, your personal culinary guide. 🍳 What delicious creation can I help you with today? Feel free to ask me for recipes, cooking advice, or ingredient substitutions!",
  },
];

export function AiChefAssistant({ isOpen, onOpenChange }: AiChefAssistantProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    const newMessages: Message[] = [
      ...messages,
      { role: 'user', content: userMessageContent },
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await getAssistantResponseAction({ history: newMessages });

      if (result.success && result.data) {
        setMessages((prev) => [
          ...prev,
          { role: 'model', content: result.data }, // Correctly use result.data as the content
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: `I'm sorry, something went wrong. Please try again. Error: ${result.error || 'Unknown error'}`,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `An unexpected error occurred. Please try again later.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Chef Assistant
          </SheetTitle>
          <SheetDescription>
            Your culinary companion for suggestions, substitutions, and more.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-4 -mr-6 my-4">
          <div className="space-y-6" ref={scrollAreaRef}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <Avatar
                  className={cn(
                    'h-8 w-8',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <AvatarFallback>
                    {message.role === 'user' ? 'U' : 'AI'}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'p-3 rounded-lg max-w-[85%] prose prose-sm dark:prose-invert',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 bg-muted">
                    <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="p-3 rounded-lg bg-muted">
                    <Icons.spinner className="animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <SheetFooter>
          <form onSubmit={handleSubmit} className="flex w-full gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for a recipe..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
