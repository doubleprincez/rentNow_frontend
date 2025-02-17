'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { conversationApi, Conversation, Message, User } from '../api/conversationApi';

const Messages = () => {
    const [activeTab, setActiveTab] = useState('agents');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch conversations on component mount
    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await conversationApi.getAllConversations();
            setConversations(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setError('Failed to load conversations. Please try again later.');
            setConversations([]); // Ensure conversations is always an array
        } finally {
            setIsLoading(false);
        }
    };

    const filterConversations = (accountType: string) => {
        if (!Array.isArray(conversations)) return [];
        return conversations.filter(conv => 
            conv.participants?.some(p => p.accountType === accountType)
        );
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedConversation || !newMessage.trim()) return;

        try {
            await conversationApi.sendMessage(selectedConversation.id, newMessage);
            // Refresh conversation to get new message
            const updated = await conversationApi.getConversation(selectedConversation.id);
            setSelectedConversation(updated);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-[600px]">Loading conversations...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <Tabs defaultValue="agents" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                {['agents', 'users'].map((tab) => (
                    <TabsContent key={tab} value={tab} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4 h-[600px]">
                            {/* Conversations List */}
                            <Card className="col-span-1">
                                <ScrollArea className="h-[600px] w-full p-4">
                                    {filterConversations(tab === 'agents' ? 'agent' : 'user')
                                        .map((conv) => (
                                            <div
                                                key={conv.id}
                                                className={`p-3 cursor-pointer rounded-lg mb-2 ${
                                                    selectedConversation?.id === conv.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'hover:bg-secondary'
                                                }`}
                                                onClick={() => setSelectedConversation(conv)}
                                            >
                                                <h3 className="font-medium">
                                                    {conv.participants
                                                        ?.map(p => p.name)
                                                        .join(', ')}
                                                </h3>
                                                <p className="text-sm opacity-70">
                                                    {formatDate(conv.updatedAt)}
                                                </p>
                                            </div>
                                        ))}
                                </ScrollArea>
                            </Card>

                            {/* Messages Area */}
                            <Card className="col-span-2">
                                <CardContent className="p-4 h-[600px] flex flex-col">
                                    {selectedConversation ? (
                                        <>
                                            <ScrollArea className="flex-1 mb-4">
                                                {selectedConversation.messages?.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`mb-4 max-w-[80%] ${
                                                            message.senderId === selectedConversation.participants[0].id
                                                                ? 'ml-auto bg-primary text-primary-foreground'
                                                                : 'bg-secondary'
                                                        } rounded-lg p-3`}
                                                    >
                                                        <p>{message.content}</p>
                                                        <small className="text-xs opacity-70">
                                                            {formatDate(message.createdAt)}
                                                        </small>
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                                <Input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1"
                                                />
                                                <Button type="submit">Send</Button>
                                            </form>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground">
                                            Select a conversation to start messaging
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default Messages;