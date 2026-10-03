// ---------- App ----------

export type Credentials = {
	idInstance: string;
	apiTokenInstance: string;
	// Empty string = default host derived from idInstance
	apiUrl: string;
};

export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type Message = {
	id: string;
	text: string;
	direction: MessageDirection;
	// Unix time in milliseconds
	timestamp: number;
	// null for incoming messages
	status: MessageStatus | null;
};

export type Chat = {
	chatId: string;
	name: string;
	phone: string;
	messages: Message[];
};

export type NotificationEvent =
	| { kind: 'message'; chatId: string; name: string; message: Message }
	| { kind: 'status'; chatId: string; id: string; status: string };

// ---------- GREEN-API responses (only the fields the app uses) ----------

export type StateInstanceResponse = {
	stateInstance: string;
};

export type CheckAccountResponse = {
	exist: boolean;
	chatId?: string;
};

export type SendMessageResponse = {
	idMessage: string;
};

export type DeleteNotificationResponse = {
	result: boolean;
};

export type MessageData = {
	typeMessage: string;
	textMessageData?: { textMessage: string };
	extendedTextMessageData?: { text: string };
};

export type NotificationBody = {
	typeWebhook: string;
	instanceData?: {
		idInstance: number;
		wid: string;
		typeInstance: string;
	};
	// Unix time in seconds
	timestamp?: number;
	idMessage?: string;
	// Present in outgoingMessageStatus
	chatId?: string;
	status?: string;
	senderData?: {
		chatId: string;
		sender?: string;
		chatName?: string;
		senderName?: string;
	};
	messageData?: MessageData;
};

export type ReceiveNotificationResponse = {
	receiptId: number;
	body: NotificationBody;
} | null;
