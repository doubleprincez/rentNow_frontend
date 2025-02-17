'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { conversationApi, Conversation, Message } from '../api/conversationApi';
import { getUsers, User } from '../api/userApi';
import axios from 'axios';
import { AppDispatch, RootState } from '@/redux/store';
import { useDispatch, useSelector } from 'react-redux';

const Messages = () => {
    const [activeTab, setActiveTab] = useState('agents');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [adminId, setAdminId] = useState<number | null>(null);
    const { toast } = useToast();

    const { userId, isLoggedIn } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        if (!isLoggedIn || !userId) {
            toast({
                title: "Error",
                description: "You must be logged in as an admin to use the messaging system",
                variant: "destructive",
            });
            // You might want to redirect to login page here
        }
    }, [isLoggedIn, userId]);

    const BASE_URL = 'https://api.rent9ja.com.ng/api';

    const getAuthHeader = () => {
        const token = localStorage.getItem('adminToken');
        return {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            }
        };
    };

    // Fetch users when tab, page, or search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            loadUsers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [activeTab, currentPage, searchTerm]);

    // Load conversation when user is selected
    useEffect(() => {
        if (selectedUser) {
            loadOrCreateConversation();
        }
    }, [selectedUser]);

    useEffect(() => {
        const getAdminData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) {
                    toast({
                        title: "Error",
                        description: "Not authenticated",
                        variant: "destructive",
                    });
                    return;
                }

                // Get admin profile to get the correct ID
                const response = await axios.get(
                    `${BASE_URL}/admin/profile`,
                    getAuthHeader()
                );
                
                if (response.data?.data?.id) {
                    setAdminId(response.data.data.id);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to get admin profile",
                    variant: "destructive",
                });
            }
        };

        getAdminData();
    }, []);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const response = await getUsers(
                currentPage, 
                searchTerm, 
                activeTab === 'agents' ? 'agents' : 'users'
            );

            const filteredUsers = response.data.filter(user => 
                activeTab === 'agents' 
                    ? user.account.slug === 'agents'
                    : user.account.slug === 'users'
            );
            
            setUsers(filteredUsers);
            setTotalPages(Math.ceil(response.total / response.per_page));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load users",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadOrCreateConversation = async () => {
        if (!selectedUser || !userId) return;

        try {
            setIsLoading(true);
            const conversations = await conversationApi.getAllConversations();
            
            const existingConversation = conversations.find(conv => 
                conv.participants?.some(p => p.id === selectedUser.id)
            );

            if (existingConversation) {
                const conversation = await conversationApi.getConversation(existingConversation.id);
                setCurrentConversation(conversation);
            } else {
                const newConversation = await conversationApi.createConversation({
                    from_id: userId, // Use admin ID from Redux state
                    to_id: selectedUser.id,
                    message: 'Hello! How can I help you today?'
                });
                setCurrentConversation(newConversation);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load conversation: " + (error as any)?.message,
                variant: "destructive",
            });
            setCurrentConversation(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUserSelect = (user: User) => {
        setSelectedUser(user);
        setCurrentConversation(null); // Clear current conversation while loading
    };

    const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !userId || !newMessage.trim()) {
        toast({
            title: "Error",
            description: "Missing required information to send message",
            variant: "destructive",
        });
        return;
    }

    try {
        setIsLoading(true);
        
        const messageParams = {
            from_id: userId,
            to_id: selectedUser.id,
            message: newMessage.trim()
        };

        // If we have a current conversation, update it, otherwise create a new one
        const conversationId = currentConversation?.id || null;
        const updatedConversation = await conversationApi.sendMessage(conversationId, messageParams);
        
        setCurrentConversation(updatedConversation);
        setNewMessage('');
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to send message: " + (error as any)?.message,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
};

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setSelectedUser(null);
        setCurrentConversation(null);
        setCurrentPage(1);
        setSearchTerm('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="container mx-auto p-8">
            <Tabs defaultValue="agents" onValueChange={handleTabChange}>
                <TabsList className="grid w-[300px] grid-cols-2 mb-6 py-1 h-[40px] border-2 rounded-md border-black">
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-3 gap-4 h-[600px]">
                    {/* Users List */}
                    <Card className="col-span-1">
                        <div className="p-4">
                            <div className="relative w-full mb-4">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-[450px]">
                            <div className="px-4">
                                {isLoading && !currentConversation ? (
                                    <div className="text-center py-4">Loading...</div>
                                ) : users.length === 0 ? (
                                    <div className="text-center py-4">No users found</div>
                                ) : (
                                    users.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => handleUserSelect(user)}
                                            className={`p-3 cursor-pointer rounded-lg mb-2 ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-secondary'
                                            }`}
                                        >
                                            <h3 className="font-medium">{user.name}</h3>
                                            <p className="text-sm opacity-70">{user.email}</p>
                                            {user.phone && (
                                                <p className="text-sm opacity-70">{user.phone}</p>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                        <div className="flex justify-between p-4 border-t">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </Card>

                    {/* Chat Area */}
                    <Card className="col-span-2">
                        <CardContent className="p-4 h-[600px] flex flex-col">
                            {selectedUser ? (
                                <>
                                    <div className="border-b pb-4 mb-4">
                                        <h3 className="font-medium">Chat with {selectedUser.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    
                                    {isLoading && !currentConversation ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            Loading conversation...
                                        </div>
                                    ) : (
                                        <>
                                            <ScrollArea className="flex-1 mb-4">
                                                <div className="space-y-4">
                                                    {currentConversation?.messages?.map((message) => (
                                                        <div
                                                            key={message.id}
                                                            className={`max-w-[80%] ${
                                                                message.senderId === selectedUser.id
                                                                    ? 'mr-auto bg-secondary'
                                                                    : 'ml-auto bg-primary text-primary-foreground'
                                                            } rounded-lg p-3`}
                                                        >
                                                            <p>{message.content}</p>
                                                            <small className="text-xs opacity-70">
                                                                {formatDate(message.createdAt)}
                                                            </small>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>

                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                                <Input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1"
                                                    disabled={isLoading || !userId}
                                                />
                                                <Button type="submit" disabled={isLoading || !userId}>
                                                    Send
                                                </Button>
                                            </form>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Select a {activeTab === 'agents' ? 'agent' : 'user'} to start messaging
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </Tabs>
        </div>
    );
};

export default Messages;