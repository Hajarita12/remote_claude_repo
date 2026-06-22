export interface ChatRoom {
  id: string;
  name: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  email: string;
  content: string;
  createdAt: string;
}

export interface SendMessageBody {
  content: string;
}
