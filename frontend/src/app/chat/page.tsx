'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import { fetchMessages, sendMessage, type ChatMessage } from '@/lib/chat';

const DEFAULT_ROOM = 'general';
const POLL_INTERVAL_MS = 3000;

export default function ChatPage() {
  const [token, setToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read token from localStorage on mount (client-only)
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem('auth_token');
    } catch {}
    setToken(stored);
  }, []);

  const refreshMessages = useCallback(async (tk: string) => {
    const msgs = await fetchMessages(DEFAULT_ROOM, tk);
    setMessages(msgs);
    setLoading(false);
  }, []);

  // Start polling once we have a valid token
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    void refreshMessages(token);

    const id = setInterval(() => {
      void refreshMessages(token);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(id);
  }, [token, refreshMessages]);

  const handleSend = async (content: string) => {
    if (!token) return;
    setError(null);

    const result = await sendMessage(DEFAULT_ROOM, content, token);
    if (!result) {
      setError('Failed to send message. Please try again.');
      return;
    }

    await refreshMessages(token);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-700">Please log in to use the chat.</p>
        <Link
          href="/login"
          className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <h1 className="text-lg font-semibold text-indigo-700">
          Chat — #{DEFAULT_ROOM}
        </h1>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2">
          {error}
        </div>
      )}

      <ChatWindow messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
