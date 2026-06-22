'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/chat';

interface ChatWindowProps {
  messages: ChatMessage[];
}

export default function ChatWindow({ messages }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No messages yet.</p>
      )}
      {messages.map((msg) => {
        const date = new Date(msg.createdAt);
        const timeStr = isNaN(date.getTime()) ? '—' : date.toLocaleTimeString();
        return (
          <div key={msg.id} className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-indigo-600">
                {msg.email}
              </span>
              <span className="text-xs text-gray-400">
                {timeStr}
              </span>
            </div>
            <p className="bg-white rounded-lg px-3 py-2 shadow-sm text-gray-800 max-w-prose">
              {msg.content}
            </p>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
