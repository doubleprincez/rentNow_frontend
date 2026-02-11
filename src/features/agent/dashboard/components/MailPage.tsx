'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, TabsTrigger, TabsContent, TabsList } from '@/components/ui/tabs';

interface Message {
  id: number;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  timestamp: string;
}

const MailPage: React.FC = () => {
  const [inboxMessages, setInboxMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for compose
  const [recipient, setRecipient] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Inbox and Sent Messages
  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [inboxResponse, sentResponse] = await Promise.all([
          axios.get('/api/messages/inbox'), // Adjust API endpoint for inbox
          axios.get('/api/messages/sent'), // Adjust API endpoint for sent
        ]);

        setInboxMessages(inboxResponse.data); // Assuming API returns an array of messages
        setSentMessages(sentResponse.data);
      } catch (err) {
        setError('Failed to fetch messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Handle Compose Submit
  const handleComposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    try {
      await axios.post('/api/messages/send', { recipient, subject, content }); // Adjust API endpoint for sending messages
      setSuccessMessage('Message sent successfully!');
      setRecipient('');
      setSubject('');
      setContent('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-orange-500 mb-6">Mail</h1>

      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
        </TabsList>

        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Inbox</h2>
          {isLoading && <p className="text-gray-500">Loading messages...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <ul className="space-y-4">
              {inboxMessages.map((message) => (
                <li key={message.id} className="border border-gray-300 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700">From: {message.sender}</p>
                  <p className="text-sm text-gray-700">Subject: {message.subject}</p>
                  <p className="text-sm text-gray-500">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(message.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Sent Tab */}
        <TabsContent value="sent">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Sent Messages</h2>
          {isLoading && <p className="text-gray-500">Loading messages...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!isLoading && !error && (
            <ul className="space-y-4">
              {sentMessages.map((message) => (
                <li key={message.id} className="border border-gray-300 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700">To: {message.recipient}</p>
                  <p className="text-sm text-gray-700">Subject: {message.subject}</p>
                  <p className="text-sm text-gray-500">{message.content}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(message.timestamp).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {/* Compose Tab */}
        <TabsContent value="compose">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Compose New Message</h2>
          <form onSubmit={handleComposeSubmit} className="space-y-6">
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            <div>
              <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-2">
                Recipient
              </label>
              <input
                type="email"
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={4}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white font-semibold py-2 rounded-lg hover:bg-orange-600"
            >
              Send Message
            </button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MailPage;
