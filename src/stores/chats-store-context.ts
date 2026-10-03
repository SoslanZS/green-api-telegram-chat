import { createContext } from 'react';
import type { ChatsStore } from '@/stores/chats-store';

export const ChatsStoreContext = createContext<ChatsStore | null>(null);
