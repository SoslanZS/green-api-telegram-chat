import type {
	CheckAccountResponse,
	Credentials,
	DeleteNotificationResponse,
	ReceiveNotificationResponse,
	SendMessageResponse,
	StateInstanceResponse,
} from '@/types';

// Maximum long polling wait (seconds) allowed by receiveNotification
const RECEIVE_TIMEOUT = 20;

type RequestOptions = {
	method?: 'GET' | 'POST' | 'DELETE';
	body?: unknown;
	signal?: AbortSignal;
};

export class GreenApiError extends Error {
	status: number;

	constructor(status: number, message?: string) {
		super(message || `HTTP ${status}`);
		this.name = 'GreenApiError';
		this.status = status;
	}
}

/**
 * Default host of an instance: GREEN-API puts instances on hosts named by the first
 * 4 digits of idInstance (4100123456 -> https://4100.api.green-api.com)
 * @param idInstance - Instance id
 * @returns Default apiUrl
 */
export const getDefaultApiUrl = (idInstance: string): string => {
	const prefix = String(idInstance ?? '').trim().slice(0, 4);
	return /^\d{4}$/.test(prefix) ? `https://${prefix}.api.green-api.com` : 'https://api.green-api.com';
};

/**
 * Builds GREEN-API method URL: {apiUrl}/waInstance{idInstance}/{method}/{apiTokenInstance}
 * @param credentials - Instance credentials; empty apiUrl = default host
 * @param method - API method name
 * @returns Full method URL
 */
const buildUrl = ({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string): string => {
	const base = (apiUrl || getDefaultApiUrl(idInstance)).replace(/\/+$/, '');
	return `${base}/waInstance${idInstance}/${method}/${apiTokenInstance}`;
};

/**
 * Performs fetch and parses JSON; throws GreenApiError on non-2xx
 * @param url - Request URL
 * @param options - Method, JSON body and abort signal
 * @returns Parsed JSON (null for an empty body)
 */
const request = async <T>(url: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> => {
	const init: RequestInit = { method, signal };
	// Content-Type only when a body is sent: a plain GET stays a "simple" CORS request
	if (body !== undefined) {
		init.headers = { 'Content-Type': 'application/json' };
		init.body = JSON.stringify(body);
	}

	const response = await fetch(url, init);
	const text = await response.text();
	if (!response.ok)
		throw new GreenApiError(response.status, text);

	return (text ? JSON.parse(text) : null) as T;
};

export const greenApi = {
	/**
	 * Get instance authorization state
	 * @param credentials - Instance credentials
	 * @returns e.g. { stateInstance: 'authorized' }
	 */
	async getStateInstance(credentials: Credentials)
	{
		return await request<StateInstanceResponse>(buildUrl(credentials, 'getStateInstance'));
	},

	/**
	 * Check that a phone number has a Telegram account and get its chatId
	 * @param credentials - Instance credentials
	 * @param phone - Phone number, digits only (79991234567)
	 * @returns Account existence and Telegram chatId
	 */
	async checkAccount(credentials: Credentials, phone: string)
	{
		return await request<CheckAccountResponse>(buildUrl(credentials, 'checkAccount'), {
			method: 'POST',
			body: { phoneNumber: Number(phone) },
		});
	},

	/**
	 * Send a text message
	 * @param credentials - Instance credentials
	 * @param chatId - Recipient chatId
	 * @param message - Message text
	 * @returns Sent message id
	 */
	async sendMessage(credentials: Credentials, chatId: string, message: string)
	{
		return await request<SendMessageResponse>(buildUrl(credentials, 'sendMessage'), {
			method: 'POST',
			body: { chatId, message },
		});
	},

	/**
	 * Receive one notification from the incoming queue (long polling)
	 * @param credentials - Instance credentials
	 * @param signal - Abort signal to cancel the pending request
	 * @returns Notification or null when the queue is empty
	 */
	async receiveNotification(credentials: Credentials, signal?: AbortSignal)
	{
		const url = `${buildUrl(credentials, 'receiveNotification')}?receiveTimeout=${RECEIVE_TIMEOUT}`;
		return await request<ReceiveNotificationResponse>(url, { signal });
	},

	/**
	 * Delete a processed notification from the incoming queue
	 * @param credentials - Instance credentials
	 * @param receiptId - Notification receipt id
	 * @param signal - Abort signal
	 * @returns Deletion result
	 */
	async deleteNotification(credentials: Credentials, receiptId: number, signal?: AbortSignal)
	{
		return await request<DeleteNotificationResponse>(`${buildUrl(credentials, 'deleteNotification')}/${receiptId}`, {
			method: 'DELETE',
			signal,
		});
	},
};
