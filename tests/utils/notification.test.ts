import { describe, test, expect } from 'vitest';
import type { NotificationBody, NotificationEvent } from '@/types';
import { parseNotification } from '@/utils/notification';

// Narrows a parse result to a message event (fails the test otherwise)
const asMessage = (event: NotificationEvent | null) => {
	if (event?.kind !== 'message')
		throw new Error('Expected a message event');

	return event.message;
};

// Shapes taken from the GREEN-API Telegram Postman collection
const incomingText: NotificationBody = {
	typeWebhook: 'incomingMessageReceived',
	instanceData: { idInstance: 4100000000, wid: '79991234567@c.us', typeInstance: 'telegram' },
	timestamp: 1588091580,
	idMessage: '2755232962562',
	senderData: {
		chatId: '10000000',
		sender: '10000000',
		chatName: 'Иван',
		senderName: 'Иван',
	},
	messageData: {
		typeMessage: 'textMessage',
		textMessageData: { textMessage: 'Привет' },
	},
};

describe('parseNotification', () => {
	test('parses an incoming text message', () => {
		expect(parseNotification(incomingText)).toEqual({
			kind: 'message',
			chatId: '10000000',
			name: 'Иван',
			message: {
				id: '2755232962562',
				text: 'Привет',
				direction: 'incoming',
				timestamp: 1588091580000,
				status: null,
			},
		});
	});

	test('parses extended text (message with a link)', () => {
		const body = {
			...incomingText,
			messageData: {
				typeMessage: 'extendedTextMessage',
				extendedTextMessageData: { text: 'https://green-api.com' },
			},
		};
		expect(asMessage(parseNotification(body)).text).toBe('https://green-api.com');
	});

	test('treats messages sent from the phone as outgoing', () => {
		const result = asMessage(parseNotification({ ...incomingText, typeWebhook: 'outgoingMessageReceived' }));
		expect(result.direction).toBe('outgoing');
		expect(result.status).toBe('sent');
	});

	test('ignores non-text messages', () => {
		const body = {
			...incomingText,
			messageData: { typeMessage: 'imageMessage', fileMessageData: {} },
		};
		expect(parseNotification(body)).toBeNull();
	});

	test('parses outgoing message status', () => {
		expect(parseNotification({
			typeWebhook: 'outgoingMessageStatus',
			chatId: '10000000',
			idMessage: '115054445839974415',
			status: 'delivered',
		})).toEqual({
			kind: 'status',
			chatId: '10000000',
			id: '115054445839974415',
			status: 'delivered',
		});
	});

	test('ignores other notification types', () => {
		expect(parseNotification({ typeWebhook: 'stateInstanceChanged' })).toBeNull();
	});

	test('handles empty body', () => {
		expect(parseNotification(null)).toBeNull();
	});
});
