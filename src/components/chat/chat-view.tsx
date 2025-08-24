"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, DocumentData } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Icons } from "../icons";

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    createTime: any;
    prompt: string;
    response?: string;
    status?: {
        state: string;
        error?: string;
    };
}

export function ChatView() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Effect to create a new chat session on component mount
    useEffect(() => {
        const newChatId = user?.uid + "_" + Date.now();
        setChatId(newChatId);
    }, [user]);

    // Effect to listen for new messages in the current chat session
    useEffect(() => {
        if (!chatId) return;

        const q = query(
            collection(db, `chats/${chatId}/messages`),
            orderBy("createTime", "asc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages: ChatMessage[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                newMessages.push({
                    id: doc.id,
                    role: data.role,
                    createTime: data.createTime,
                    prompt: data.prompt || (data.role === 'model' && data.response) || '',
                    response: data.response,
                    status: data.status,
                });
            });
            setMessages(newMessages);
            setIsLoading(newMessages.length > 0 && newMessages[newMessages.length - 1].status?.state === 'PROCESSING');
        });

        return () => unsubscribe();
    }, [chatId]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chatId || !user) return;

        const userMessage = {
            prompt: input.trim(),
            role: "user",
            createTime: serverTimestamp(),
            userId: user.uid,
        };

        setInput("");
        
        try {
            await addDoc(collection(db, `chats/${chatId}/messages`), userMessage);
        } catch (error) {
            console.error("Error sending message:", error);
            // Optionally show an error to the user
        }
    };
    
    const renderContent = (message: ChatMessage) => {
        if (message.role === 'user') {
            return message.prompt;
        }
        if (message.status?.state === 'COMPLETED') {
            return <ReactMarkdown>{message.response}</ReactMarkdown>;
        }
        if (message.status?.state === 'PROCESSING') {
             return <Icons.spinner className="animate-spin" />;
        }
        if (message.status?.state === 'ERRORED') {
            return <p className="text-destructive">An error occurred: {message.status.error}</p>;
        }
        return <Icons.spinner className="animate-spin" />;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] bg-card border rounded-lg">
             <div className="p-4 border-b">
                <h1 className="text-xl font-bold font-headline flex items-center gap-2">
                    <Sparkles className="text-primary h-5 w-5" />
                    AI Chatbot
                </h1>
                <p className="text-sm text-muted-foreground">
                    Powered by the Gemini API Firebase Extension. Chat ID: {chatId}
                </p>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                 <div className="space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={cn(
                            "flex items-start gap-3",
                            message.role === "user" && "flex-row-reverse"
                            )}
                        >
                            <Avatar
                                className={cn(
                                    "h-8 w-8",
                                    message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                            >
                                <AvatarFallback>
                                    {message.role === "user" ? <User size={16}/> : <Sparkles size={16}/>}
                                </AvatarFallback>
                            </Avatar>
                            <div
                                className={cn(
                                    "p-3 rounded-lg max-w-[85%] prose prose-sm dark:prose-invert",
                                    message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                            >
                                {renderContent(message)}
                            </div>
                        </div>
                    ))}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 bg-muted">
                                <AvatarFallback><Sparkles size={16}/></AvatarFallback>
                            </Avatar>
                            <div className="p-3 rounded-lg bg-muted">
                                <Icons.spinner className="animate-spin" />
                            </div>
                        </div>
                    )}
                 </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
                 <form onSubmit={handleSubmit} className="flex w-full gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about cooking..."
                        disabled={isLoading || !chatId}
                    />
                    <Button type="submit" disabled={isLoading || !input.trim() || !chatId}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
