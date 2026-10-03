import type { MessageData, MessageDirection, NotificationBody, NotificationEvent } from '@/types';

const MESSAGE_WEBHOOKS: Record<string, MessageDirection> = {
	incomingMessageReceived: 'incoming',
	// Sent from the phone app of the same account
	outgoingMessageReceived: 'outgoing',
	// Sent through the API (including by this app)
	outgoingAPIMessageReceived: 'outgoing',
};

/**
 * Extracts text from notification messageData; only text messages are supported
 * @param messageData - Notification messageData
 * @returns Message text or null for non-text messages
 */
export const extractText = (messageData?: MessageData): string | null => {
	if (!messageData)
		return null;

	switch (messageData.typeMessage) {
		case 'textMessage':
			return messageData.textMessageData?.textMessage ?? null;
		case 'extendedTextMessage':
		case 'quotedMessage':
			return messageData.extendedTextMessageData?.text ?? null;
		default:
			return null;
	}
};

/**
 * Converts a GREEN-API notification body into an app event
 * @param body - Notification body from receiveNotification
 * @returns Message or status event, null for unsupported notifications
 */
export const parseNotification = (body: NotificationBody | null | undefined): NotificationEvent | null => {
	if (!body)
		return null;

	const direction = MESSAGE_WEBHOOKS[body.typeWebhook];
	if (direction) {
		const text = extractText(body.messageData);
		const sender = body.senderData;
		if (text === null || !sender?.chatId || !body.idMessage)
			return null;

		return {
			kind: 'message',
			chatId: sender.chatId,
			name: sender.chatName || (direction === 'incoming' ? sender.senderName : '') || '',
			message: {
				id: body.idMessage,
				text,
				direction,
				timestamp: (body.timestamp ?? 0) * 1000,
				status: direction === 'outgoing' ? 'sent' : null,
			},
		};
	}

	if (body.typeWebhook === 'outgoingMessageStatus' && body.chatId && body.idMessage)
		return { kind: 'status', chatId: body.chatId, id: body.idMessage, status: body.status ?? '' };

	return null;
};
