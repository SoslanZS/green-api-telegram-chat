import { useEffect, useRef } from 'react';
import { greenApi } from '@/api/green-api';
import type { Credentials, NotificationBody } from '@/types';

const RETRY_DELAY = 3000;

const wait = (ms: number, signal: AbortSignal) => new Promise<void>((resolve) => {
	const timer = setTimeout(resolve, ms);
	signal.addEventListener('abort', () => {
		clearTimeout(timer);
		resolve();
	}, { once: true });
});

/**
 * Receives GREEN-API notifications via HTTP API while the component is mounted:
 * receiveNotification (long polling) -> handle -> deleteNotification -> repeat
 * @param credentials - Instance credentials
 * @param onNotification - Called with every notification body
 */
export const useNotifications = (credentials: Credentials, onNotification: (body: NotificationBody) => void) => {
	// Ref keeps the latest handler without restarting the polling loop on every render
	const handlerRef = useRef(onNotification);
	useEffect(() => {
		handlerRef.current = onNotification;
	});

	useEffect(() => {
		const controller = new AbortController();
		const { signal } = controller;

		const poll = async () => {
			while (!signal.aborted) {
				try {
					const notification = await greenApi.receiveNotification(credentials, signal);
					// null = queue is empty, the server already waited receiveTimeout seconds
					if (!notification)
						continue;

					try {
						handlerRef.current(notification.body);
					}
					catch (e) {
						console.error('Notification handler failed', e);
					}

					// Delete even unsupported notifications, otherwise the queue gets stuck on them
					await greenApi.deleteNotification(credentials, notification.receiptId, signal);
				}
				catch (e) {
					if (signal.aborted)
						return;

					console.error('Receive notification failed', e);
					await wait(RETRY_DELAY, signal);
				}
			}
		};

		poll();
		return () => controller.abort();
	}, [credentials]);
};
