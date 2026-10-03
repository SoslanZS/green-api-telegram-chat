import type { Chat } from '@/types';
import { formatPhone } from '@/utils/phone';

/**
 * Chat display name: contact name, then phone, then Telegram id
 * @param chat - Chat
 * @returns Title for the chat list and header
 */
export const getChatTitle = (chat: Pick<Chat, 'chatId' | 'name' | 'phone'>): string =>
	chat.name || formatPhone(chat.phone) || `ID ${chat.chatId}`;
