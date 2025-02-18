'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scrollArea";
import { Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { conversationApi, Conversation } from '@/features/admin/dashboard/api/conversationApi';
import { getUsers, User } from '../api/userApi';
import axios from 'axios';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

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
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messagePollingInterval, setMessagePollingInterval] = useState<NodeJS.Timeout | null>(null);
    const [hasNewMessage, setHasNewMessage] = useState(false);

    // Scroll to bottom function
    const scrollToBottom = () => {
        if (hasNewMessage) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            setHasNewMessage(false);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, hasNewMessage]);

    const getAuthHeader = () => ({
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Request-With'
        },
        withCredentials: true
    });

    // Function to fetch messages
    const fetchMessages = async () => {
        if (!selectedUser?.id || !userId) return;

        try {
            const response = await axios.get(
                `${BASE_URL}/conversation/${selectedUser.id}`,
                {
                    ...getAuthHeader(),
                    withCredentials: true
                }
            );

            if (response.data.success && response.data.data) {
                const newMessages = response.data.data;
                setMessages(response.data.data);
                scrollToBottom();
                
                // Check if there are new messages
                if (messages.length < newMessages.length) {
                    setHasNewMessage(true);
                }
                
                // Sort messages by creation date in ascending order
                const sortedMessages = newMessages.sort((a: any, b: any) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                
                setMessages(sortedMessages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Set up message polling when a user is selected
    useEffect(() => {
        if (selectedUser?.id) {
            // Initial fetch
            fetchMessages();

            // Set up polling every 3 seconds
            const interval = setInterval(fetchMessages, 3000);
            setMessagePollingInterval(interval);

            // Cleanup
            return () => {
                if (messagePollingInterval) {
                    clearInterval(messagePollingInterval);
                }
            };
        }
    }, [selectedUser]);

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

            await conversationApi.sendMessage(selectedUser.id, messageParams);
            
            // Set hasNewMessage to true before fetching updated messages
            setHasNewMessage(true);
            await fetchMessages();
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

    const renderChatArea = () => (
        <ScrollArea className="flex-1 mb-4 h-[calc(100vh-300px)] border-2 rounded-md border-black">
            <div className="space-y-2 p-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`max-w-[80%] ${
                            message.from_id === userId
                                ? 'ml-0 bg-gray-300'
                                : 'ml-0 bg-white'
                        } rounded-lg p-3 border shadow-sm`}
                    >
                        <p>{message.message}</p>
                        <small className="text-xs opacity-70">
                            {formatDate(message.created_at)}
                        </small>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    );

    return (
        <div className="container mx-auto p-4">
            <Tabs defaultValue="agents" onValueChange={handleTabChange}>
                <TabsList className="grid w-[300px] grid-cols-2 mb-4 py-1 h-[40px] border-2 rounded-md border-black">
                    <TabsTrigger value="agents">Agents</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-3 gap-4 h-[calc(100vh-170px)] overflow-hidden">
                    {/* Users List */}
                    <Card className="col-span-1 h-full border-none">
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

                        <ScrollArea className="h-[calc(100vh-300px)]">
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
                                            className={`p-2 cursor-pointer rounded-lg mb-2 ${
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
                    <Card className="col-span-2 border-none">
                        <CardContent className="p-4 h-[500px] flex flex-col">
                            {selectedUser ? (
                                <>
                                    <div className="border-2 bg-gray-200 border-black rounded-md p-4 mb-4">
                                        <h3 className="font-medium">Chat with {selectedUser.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                    </div>
                                    
                                    {isLoading && messages.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            Loading conversation...
                                        </div>
                                    ) : (
                                        <>
                                            {renderChatArea()}
                                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                                <Input
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    placeholder="Type your message..."
                                                    className="flex-1 border-2 border-black py-2 h-full"
                                                    disabled={isLoading || !userId}
                                                />
                                                <Button type="submit" disabled={isLoading || !userId} className='bg-orange-500 text-white hover:bg-orange-600'>
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


// 'use client'
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scrollArea";
// import { Search, AlertTriangle } from 'lucide-react';
// import { useToast } from '@/components/ui/use-toast';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { agentConversationApi, Message } from '../api/agentConversationApi';
// import { getUsers, User } from '../api/userApi';
// import { useSelector } from 'react-redux';

// const AgentMessages = () => {
//     const [activeTab, setActiveTab] = useState('users');
//     const [users, setUsers] = useState<User[]>([]);
//     const [selectedUser, setSelectedUser] = useState<User | null>(null);
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [newMessage, setNewMessage] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [hasNewMessage, setHasNewMessage] = useState(false);
//     const [retryCount, setRetryCount] = useState(0);
//     const [apiError, setApiError] = useState<string | null>(null);
//     const { toast } = useToast();
//     const messagesEndRef = useRef<HTMLDivElement>(null);
//     const searchTimeoutRef = useRef<NodeJS.Timeout>();
//     const messagePollingRef = useRef<NodeJS.Timeout>();

//     const { userId, isLoggedIn } = useSelector((state: any) => state.agent);

//     const scrollToBottom = useCallback(() => {
//         if (hasNewMessage) {
//             messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//             setHasNewMessage(false);
//         }
//     }, [hasNewMessage]);

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages, scrollToBottom]);

//     const fetchMessages = useCallback(async () => {
//         if (!selectedUser?.id || !userId) return;

//         try {
//             const messages = await agentConversationApi.getConversation(selectedUser.id);
//             const sortedMessages = messages.sort((a, b) => 
//                 new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//             );
            
//             if (sortedMessages.length > messages.length) {
//                 setHasNewMessage(true);
//             }
            
//             setMessages(sortedMessages);
//             setApiError(null);
//         } catch (error) {
//             console.error('Error fetching messages:', error);
//             // Don't show error toast for message fetching - silent retry
//         }
//     }, [selectedUser?.id, userId]);

//     useEffect(() => {
//         if (selectedUser?.id) {
//             fetchMessages();
//             messagePollingRef.current = setInterval(fetchMessages, 3000);

//             return () => {
//                 if (messagePollingRef.current) {
//                     clearInterval(messagePollingRef.current);
//                 }
//             };
//         }
//     }, [selectedUser?.id, fetchMessages]);

//     const loadUsers = async () => {
//         try {
//             setIsLoading(true);
//             const response = await getUsers(
//                 currentPage, 
//                 searchTerm, 
//                 activeTab === 'agents' ? 'agents' : 'users'
//             );

//             const filteredUsers = response.data.filter(user => 
//                 activeTab === 'agents' 
//                     ? user.account.slug === 'agents'
//                     : user.account.slug === 'users'
//             );
            
//             setUsers(filteredUsers);
//             setTotalPages(Math.ceil(response.total / response.per_page));
//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: "Failed to load users",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (searchTimeoutRef.current) {
//             clearTimeout(searchTimeoutRef.current);
//         }
        
//         searchTimeoutRef.current = setTimeout(() => {
//             loadUsers();
//         }, 500);

//         return () => {
//             if (searchTimeoutRef.current) {
//                 clearTimeout(searchTimeoutRef.current);
//             }
//         };
//     }, [loadUsers]);

//     const handleUserSelect = (user: User) => {
//         setSelectedUser(user);
//         setMessages([]);
//         setApiError(null);
//     };

//     const handleSendMessage = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!selectedUser || !userId || !newMessage.trim()) return;

//         try {
//             setIsLoading(true);
            
//             const messageParams = {
//                 from_id: userId,
//                 to_id: selectedUser.id,
//                 message: newMessage.trim()
//             };

//             const conversations = await agentConversationApi.getAllConversations();
//             const existingConversation = conversations.find(conv => 
//                 conv.participants?.some(p => p.id === selectedUser.id)
//             );

//             if (existingConversation) {
//                 await agentConversationApi.updateConversation(existingConversation.id, messageParams);
//             } else {
//                 await agentConversationApi.createConversation(messageParams);
//             }

//             setHasNewMessage(true);
//             await fetchMessages();
//             setNewMessage('');
//             setApiError(null);
//         } catch (error) {
//             toast({
//                 title: "Error",
//                 description: "Failed to send message. Please try again.",
//                 variant: "destructive",
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     if (!isLoggedIn || !userId) {
//         return (
//             <div className="container mx-auto p-4">
//                 <Alert variant="destructive">
//                     <AlertTriangle className="h-4 w-4" />
//                     <AlertDescription>
//                         You must be logged in to use the messaging system
//                     </AlertDescription>
//                 </Alert>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto p-4">
//             <Tabs defaultValue="users" onValueChange={(value) => {
//                 setActiveTab(value);
//                 setSelectedUser(null);
//                 setMessages([]);
//                 setCurrentPage(1);
//                 setSearchTerm('');
//                 setApiError(null);
//             }}>
//                 <TabsList className="grid w-[300px] grid-cols-2 mb-4">
//                     <TabsTrigger value="users">Users</TabsTrigger>
//                     <TabsTrigger value="admins">Admins</TabsTrigger>
//                 </TabsList>

//                 {apiError && (
//                     <Alert variant="destructive" className="mb-4">
//                         <AlertTriangle className="h-4 w-4" />
//                         <AlertDescription>{apiError}</AlertDescription>
//                     </Alert>
//                 )}

//                 <div className="grid grid-cols-3 gap-4 h-[calc(100vh-170px)]">
//                     <Card className="col-span-1 h-full border-2">
//                         <div className="p-4">
//                             <div className="relative w-full mb-4">
//                                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
//                                 <Input
//                                     placeholder={`Search ${activeTab}...`}
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-8"
//                                 />
//                             </div>
//                         </div>

//                         <ScrollArea className="h-[calc(100vh-300px)]">
//                             <div className="px-4">
//                                 {isLoading && !users.length ? (
//                                     <div className="text-center py-4">Loading...</div>
//                                 ) : users.length === 0 ? (
//                                     <div className="text-center py-4">No users found</div>
//                                 ) : (
//                                     users.map((user) => (
//                                         <div
//                                             key={user.id}
//                                             onClick={() => handleUserSelect(user)}
//                                             className={`p-3 cursor-pointer rounded-lg mb-2 ${
//                                                 selectedUser?.id === user.id
//                                                     ? 'bg-primary text-primary-foreground'
//                                                     : 'hover:bg-secondary'
//                                             }`}
//                                         >
//                                             <h3 className="font-medium">{user.name}</h3>
//                                             <p className="text-sm opacity-70">{user.email}</p>
//                                             {user.phone && (
//                                                 <p className="text-sm opacity-70">{user.phone}</p>
//                                             )}
//                                         </div>
//                                     ))
//                                 )}
//                             </div>
//                         </ScrollArea>

//                         <div className="flex justify-between p-4 border-t">
//                             <Button
//                                 variant="outline"
//                                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                                 disabled={currentPage === 1 || isLoading}
//                             >
//                                 Previous
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                                 disabled={currentPage === totalPages || isLoading}
//                             >
//                                 Next
//                             </Button>
//                         </div>
//                     </Card>

//                     <Card className="col-span-2">
//                         <CardContent className="p-4 h-[calc(100vh-170px)] flex flex-col">
//                             {selectedUser ? (
//                                 <>
//                                     <div className="bg-gray-100 p-4 mb-4 rounded-lg">
//                                         <h3 className="font-medium">Chat with {selectedUser.name}</h3>
//                                         <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
//                                     </div>
                                    
//                                     {isLoading && messages.length === 0 ? (
//                                         <div className="flex-1 flex items-center justify-center">
//                                             Loading conversation...
//                                         </div>
//                                     ) : (
//                                         <>
//                                             <ScrollArea className="flex-1 mb-4">
//                                                 <div className="space-y-4 p-4">
//                                                     {messages.map((message) => (
//                                                         <div
//                                                             key={message.id}
//                                                             className={`max-w-[80%] ${
//                                                                 message.from_id === userId
//                                                                     ? 'ml-auto bg-blue-100'
//                                                                     : 'mr-auto bg-gray-100'
//                                                             } rounded-lg p-3 shadow-sm`}
//                                                         >
//                                                             <p>{message.message}</p>
//                                                             <small className="text-xs opacity-70">
//                                                                 {new Date(message.created_at).toLocaleString()}
//                                                             </small>
//                                                         </div>
//                                                     ))}
//                                                     <div ref={messagesEndRef} />
//                                                 </div>
//                                             </ScrollArea>
//                                             <form onSubmit={handleSendMessage} className="flex gap-2">
//                                                 <Input
//                                                     value={newMessage}
//                                                     onChange={(e) => setNewMessage(e.target.value)}
//                                                     placeholder="Type your message..."
//                                                     className="flex-1"
//                                                     disabled={isLoading}
//                                                 />
//                                                 <Button 
//                                                     type="submit" 
//                                                     disabled={isLoading || !newMessage.trim()}
//                                                     className="bg-primary hover:bg-primary/90"
//                                                 >
//                                                     Send
//                                                 </Button>
//                                             </form>
//                                         </>
//                                     )}
//                                 </>
//                             ) : (
//                                 <div className="h-full flex items-center justify-center text-muted-foreground">
//                                     Select a {activeTab === 'admins' ? 'admin' : 'user'} to start messaging
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </div>
//             </Tabs>
//         </div>
//     );
// };

// export default AgentMessages;