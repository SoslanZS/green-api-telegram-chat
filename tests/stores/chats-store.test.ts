import { describe, test, expect, beforeEach } from 'vitest';
import { ChatsStore, restoreChatsState } from '@/stores/chats-store';
import type { Message } from '@/types';

const credentials = {
	idInstance: '4100000000',
	apiTokenInstance: 'token',
	apiUrl: '',
};

const message = (id: string, extra: Partial<Message> = {}): Message => ({
	id,
	text: `text ${id}`,
	direction: 'outgoing',
	timestamp: 1,
	status: 'sent',
	...extra,
});

const ids = (store: ChatsStore, chatId = '100') => store.chats[chatId].messages.map((item) => item.id);

describe('ChatsStore', () => {
	let store: ChatsStore;

	beforeEach(() => {
		store = new ChatsStore(credentials);
		store.openChat('100', { phone: '79991234567' });
	});

	test('openChat creates a chat and makes it active', () => {
		expect(store.order).toEqual(['100']);
		expect(store.activeChat?.phone).toBe('79991234567');
	});

	test('openChat does not reorder an existing chat', () => {
		store.openChat('200');
		store.openChat('100');
		expect(store.order).toEqual(['200', '100']);
		expect(store.activeChatId).toBe('100');
	});

	test('addMessage creates a chat for an unknown sender', () => {
		store.addMessage('200', message('a', { direction: 'incoming' }), 'Иван');
		expect(store.chats['200'].name).toBe('Иван');
		expect(store.activeChatId).toBe('100');
	});

	test('addMessage ignores duplicates by id', () => {
		store.addMessage('100', message('a'));
		store.addMessage('100', message('a'));
		expect(ids(store)).toEqual(['a']);
	});

	test('addMessage moves the chat to the top', () => {
		store.openChat('200');
		store.addMessage('100', message('a'));
		expect(store.chatList.map((chat) => chat.chatId)).toEqual(['100', '200']);
	});

	test('updateMessage replaces local id with server id', () => {
		store.addMessage('100', message('local-1', { status: 'pending' }));
		store.updateMessage('100', 'local-1', { id: 'srv-1', status: 'sent' });
		expect(store.chats['100'].messages[0]).toMatchObject({ id: 'srv-1', status: 'sent' });
	});

	test('updateMessage drops local copy when notification came first', () => {
		store.addMessage('100', message('local-1', { status: 'pending' }));
		store.addMessage('100', message('srv-1'));
		store.updateMessage('100', 'local-1', { id: 'srv-1', status: 'sent' });
		expect(ids(store)).toEqual(['srv-1']);
	});

	test('setStatus upgrades status', () => {
		store.addMessage('100', message('a'));
		store.setStatus('100', 'a', 'read');
		expect(store.chats['100'].messages[0].status).toBe('read');
	});

	test('setStatus never downgrades status', () => {
		store.addMessage('100', message('a', { status: 'read' }));
		store.setStatus('100', 'a', 'delivered');
		expect(store.chats['100'].messages[0].status).toBe('read');
	});

	test('setStatus maps unknown API statuses to failed', () => {
		store.addMessage('100', message('a'));
		store.setStatus('100', 'a', 'noAccount');
		expect(store.chats['100'].messages[0].status).toBe('failed');
	});

	test('status received before sendMessage response is applied after it', () => {
		store.addMessage('100', message('local-1', { status: 'pending' }));
		store.setStatus('100', 'srv-1', 'read');
		expect(store.earlyStatuses).toEqual({ 'srv-1': 'read' });

		store.updateMessage('100', 'local-1', { id: 'srv-1', status: 'sent' });
		expect(store.chats['100'].messages[0].status).toBe('read');
		expect(store.earlyStatuses).toEqual({});
	});

	test('unknown status without pending messages is ignored', () => {
		store.addMessage('100', message('a'));
		store.setStatus('100', 'other', 'read');
		expect(store.earlyStatuses).toEqual({});
	});

	test('handleNotification adds an incoming message', () => {
		store.handleNotification({
			typeWebhook: 'incomingMessageReceived',
			timestamp: 1588091580,
			idMessage: 'in-1',
			senderData: { chatId: '100', chatName: 'Иван' },
			messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
		});
		expect(store.chats['100'].messages[0]).toMatchObject({ id: 'in-1', text: 'Привет', direction: 'incoming' });
	});
});

describe('restoreChatsState', () => {
	test('marks pending messages as failed', () => {
		const restored = restoreChatsState({
			chats: { 100: { chatId: '100', name: '', phone: '', messages: [message('a', { status: 'pending' })] } },
			order: ['100'],
		});
		expect(restored.chats['100'].messages[0].status).toBe('failed');
	});

	test('falls back to empty state for broken data', () => {
		expect(restoreChatsState(null)).toEqual({ chats: {}, order: [], activeChatId: null });
	});
});
