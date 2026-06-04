// Global TypeScript types for RentIt platform

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  imageUrl: string;
  tags: string[];
  isAvailable: boolean;
  rentPerDay: number;
  availableFrom: Date | null;
  availableUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
}

export type RentalStatus = "pending" | "approved" | "declined" | "returned";

export interface RentalRequest {
  id: string;
  itemId: string;
  requesterId: string;
  startDate: Date;
  endDate: Date;
  status: RentalStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  item?: Item;
  requester?: User;
}

export interface Conversation {
  id: string;
  itemId: string;
  ownerId: string;
  renterId: string;
  createdAt: Date;
  item?: Item;
  owner?: User;
  renter?: User;
  messages?: Message[];
  lastMessage?: Message;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
  sender?: User;
}

// AI Support chat message type
export interface AIChatMessage {
  role: "user" | "model";
  parts: string;
}

// API response shapes
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Sort options for item browsing
export type SortOption = "newest" | "price_asc" | "price_desc";

// Session user (from NextAuth JWT)
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
