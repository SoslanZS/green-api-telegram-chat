/**
 * Reads JSON from localStorage
 * @param key - Storage key
 * @param fallback - Returned when the key is missing or storage is unavailable
 * @returns Parsed value or fallback
 */
export const loadFromStorage = <T>(key: string, fallback: T): T => {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	}
	catch {
		return fallback;
	}
};

/**
 * Writes JSON to localStorage; silently ignores quota/private mode errors
 * @param key - Storage key
 * @param value - Serializable value
 */
export const saveToStorage = (key: string, value: unknown): void => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	}
	catch {
		// storage is a convenience, the app keeps working without it
	}
};

/**
 * Removes a key from localStorage
 * @param key - Storage key
 */
export const removeFromStorage = (key: string): void => {
	try {
		localStorage.removeItem(key);
	}
	catch {
		// ignore
	}
};
