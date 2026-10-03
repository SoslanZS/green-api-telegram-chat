/**
 * Keeps digits only and converts Russian "8XXXXXXXXXX" to "7XXXXXXXXXX"
 * @param value - Raw phone input (e.g. "+7 (999) 123-45-67")
 * @returns Digits only (e.g. "79991234567")
 */
export const normalizePhone = (value: string | null | undefined): string => {
	let digits = String(value ?? '').replace(/\D/g, '');
	if (digits.length === 11 && digits.startsWith('8'))
		digits = `7${digits.slice(1)}`;

	return digits;
};

/**
 * Checks international phone length (E.164: up to 15 digits)
 * @param digits - Normalized phone
 * @returns True when the phone looks valid
 */
export const isValidPhone = (digits: string): boolean => /^\d{10,15}$/.test(digits);

/**
 * Formats phone for display
 * @param digits - Normalized phone
 * @returns "+7 999 123-45-67" for Russian numbers, "+digits" otherwise
 */
export const formatPhone = (digits: string): string => {
	if (!digits)
		return '';

	const match = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(digits);
	return match ? `+7 ${match[1]} ${match[2]}-${match[3]}-${match[4]}` : `+${digits}`;
};
