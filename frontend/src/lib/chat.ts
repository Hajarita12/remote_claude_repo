const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  email: string;
  content: string;
  createdAt: string;
}

export async function fetchMessages(
  roomId: string,
  token: string,
): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return [];

    const data: unknown = await res.json();
    return Array.isArray(data) ? (data as ChatMessage[]) : [];
  } catch (err) {
    console.error('fetchMessages network error:', err);
    return [];
  }
}

export async function sendMessage(
  roomId: string,
  content: string,
  token: string,
): Promise<ChatMessage | null> {
  try {
    const res = await fetch(`${BASE_URL}/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) return null;

    const data: unknown = await res.json();

    if (
      data === null ||
      typeof data !== 'object' ||
      typeof (data as Record<string, unknown>).id !== 'string'
    ) {
      return null;
    }

    return data as ChatMessage;
  } catch (err) {
    console.error('sendMessage network error:', err);
    return null;
  }
}
