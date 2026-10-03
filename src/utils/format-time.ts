/**
 * Formats message time: "14:05" for today, "28.09" for older dates
 * @param timestamp - Unix time in milliseconds
 * @param now - Current date (for tests)
 * @returns Formatted time
 */
export const formatTime = (timestamp: number | undefined, now: Date = new Date()): string => {
	if (!timestamp)
		return '';

	const date = new Date(timestamp);
	if (date.toDateString() === now.toDateString())
		return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

	return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};
