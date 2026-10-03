import { makeAutoObservable, reaction, toJS } from 'mobx';
import { greenApi } from '@/api/green-api';
import type {
	Chat,
	Credentials,
	Message,
	MessageStatus,
	NotificationBody,
} from '@/types';
import { parseNotification } from '@/utils/notification';
import { isValidPhone, normalizePhone } from '@/utils/phone';
import { loadFromStorage, saveToStorage } from '@/utils/storage';

type SavedState = {
	chats: Record<string, Chat>;
	order: string[];
	activeChatId: string | null;
};

// Outgoing message statuses in delivery order; anything else from the API is a failure
const STATUS_RANK: Record<string, number> = {
	pending: 0,
	sent: 1,
	delivered: 2,
	read: 3,
};

const normalizeStatus = (status: string): MessageStatus =>
	(status in STATUS_RANK ? status : 'failed') as MessageStatus;

// Status notifications may arrive out of order: never downgrade "read" back to "delivered"
const canChangeStatus = (current: MessageStatus | null, next: MessageStatus): boolean => {
	if (next === 'failed')
		return current !== 'delivered' && current !== 'read';

	return STATUS_RANK[next] > (current ? STATUS_RANK[current] ?? -1 : -1);
};

let localIdCounter = 0;
const createLocalId = () => `local-${Date.now()}-${++localIdCounter}`;

/**
 * Prepares state loaded from storage: messages left "pending" by a closed tab
 * will never be confirmed, so they are marked as failed
 * @param saved - State from storage
 * @returns Safe initial state
 */
export const restoreChatsState = (saved: Partial<SavedState> | null | undefined): SavedState => {
	if (!saved?.chats || !Array.isArray(saved.order))
		return { chats: {}, order: [], activeChatId: null };

	const chats: Record<string, Chat> = {};
	for (const [chatId, chat] of Object.entries(saved.chats)) {
		chats[chatId] = {
			...chat,
			messages: chat.messages.map((item) => (item.status === 'pending' ? { ...item, status: 'failed' } : item)),
		};
	}

	return {
		chats,
		order: saved.order,
		activeChatId: saved.activeChatId ?? null,
	};
};

export class ChatsStore
{
	chats: Record<string, Chat> = {};
	order: string[] = [];
	activeChatId: string | null = null;
	// Statuses that arrived before the sendMessage response gave us the message id
	earlyStatuses: Record<string, MessageStatus> = {};

	private readonly credentials: Credentials;
	// History is stored per instance, so another account never sees these chats
	private readonly storageKey: string;

	constructor(credentials: Credentials)
	{
		this.credentials = credentials;
		this.storageKey = `green-api-chats-${credentials.idInstance}`;
		Object.assign(this, restoreChatsState(loadFromStorage<SavedState | null>(this.storageKey, null)));

		makeAutoObservable<this, 'credentials' | 'storageKey'>(
			this,
			{ credentials: false, storageKey: false },
			{ autoBind: true },
		);
	}

	get chatList(): Chat[]
	{
		return this.order.map((chatId) => this.chats[chatId]);
	}

	get activeChat(): Chat | null
	{
		return this.activeChatId ? this.chats[this.activeChatId] ?? null : null;
	}

	/**
	 * Saves chats to localStorage on every change
	 * @returns Disposer that stops saving
	 */
	persist()
	{
		return reaction(
			() => toJS({ chats: this.chats, order: this.order, activeChatId: this.activeChatId }),
			(state) => saveToStorage(this.storageKey, state),
		);
	}

	openChat(chatId: string, data: { name?: string; phone?: string } = {})
	{
		const chat = this.getOrCreateChat(chatId);
		chat.name ||= data.name ?? '';
		chat.phone ||= data.phone ?? '';
		this.activeChatId = chatId;
	}

	selectChat(chatId: string | null)
	{
		this.activeChatId = chatId;
	}

	// Removes the chat and its history only locally; a new incoming message recreates it
	deleteChat(chatId: string)
	{
		if (!this.chats[chatId])
			return;

		delete this.chats[chatId];
		this.order = this.order.filter((id) => id !== chatId);
		if (this.activeChatId === chatId)
			this.activeChatId = null;
	}

	addMessage(chatId: string, message: Message, name?: string)
	{
		const chat = this.getOrCreateChat(chatId);
		// The same notification can be received twice (e.g. after an aborted request)
		if (chat.messages.some((item) => item.id === message.id))
			return;

		chat.name ||= name ?? '';
		chat.messages.push(message);
		this.order = [chatId, ...this.order.filter((id) => id !== chatId)];
	}

	updateMessage(chatId: string, id: string, patch: Partial<Message>)
	{
		const chat = this.chats[chatId];
		const message = chat?.messages.find((item) => item.id === id);
		if (!chat || !message)
			return;

		// sendMessage response may come after the outgoingAPIMessageReceived notification
		// with the same idMessage: then the local copy is dropped instead of duplicated
		if (patch.id && patch.id !== id && chat.messages.some((item) => item.id === patch.id)) {
			chat.messages = chat.messages.filter((item) => item.id !== id);
			return;
		}

		Object.assign(message, patch);

		const earlyStatus = patch.id ? this.earlyStatuses[patch.id] : undefined;
		if (patch.id && earlyStatus) {
			if (canChangeStatus(message.status, earlyStatus))
				message.status = earlyStatus;
			delete this.earlyStatuses[patch.id];
		}
	}

	setStatus(chatId: string, id: string, rawStatus: string)
	{
		const status = normalizeStatus(rawStatus);
		const chat = this.chats[chatId];
		const message = chat?.messages.find((item) => item.id === id);

		// Unknown id while a message is still sending: most likely its status came first, keep it
		if (!message && chat?.messages.some((item) => item.status === 'pending')) {
			this.earlyStatuses[id] = status;
			return;
		}

		if (message && canChangeStatus(message.status, status))
			message.status = status;
	}

	async openChatByPhone(rawPhone: string)
	{
		const phone = normalizePhone(rawPhone);
		if (!isValidPhone(phone))
			throw new Error('Введите номер в международном формате, например +7 999 123-45-67');

		// In Telegram chatId is a user id, not a phone number: resolve it first
		const { exist, chatId } = await greenApi.checkAccount(this.credentials, phone);
		if (!exist || !chatId)
			throw new Error('Номер не найден в Telegram (или скрыт настройками приватности)');

		this.openChat(String(chatId), { phone });
	}

	async sendMessage(chatId: string, text: string)
	{
		const localId = createLocalId();
		// Optimistic update: show the message immediately, confirm or fail it later
		this.addMessage(chatId, {
			id: localId,
			text,
			direction: 'outgoing',
			timestamp: Date.now(),
			status: 'pending',
		});

		try {
			const { idMessage } = await greenApi.sendMessage(this.credentials, chatId, text);
			this.updateMessage(chatId, localId, { id: idMessage, status: 'sent' });
		}
		catch (e) {
			console.error('Send message failed', e);
			this.updateMessage(chatId, localId, { status: 'failed' });
		}
	}

	handleNotification(body: NotificationBody)
	{
		const event = parseNotification(body);
		if (!event)
			return;

		if (event.kind === 'message')
			this.addMessage(event.chatId, event.message, event.name);
		else
			this.setStatus(event.chatId, event.id, event.status);
	}

	private getOrCreateChat(chatId: string): Chat
	{
		if (!this.chats[chatId]) {
			this.chats[chatId] = {
				chatId,
				name: '',
				phone: '',
				messages: [],
			};
			this.order.unshift(chatId);
		}

		// Read back: the stored object is the observable copy
		return this.chats[chatId];
	}
}
