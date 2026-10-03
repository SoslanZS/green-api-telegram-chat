/**
 * Keeps digits only and brings Russian numbers to "7XXXXXXXXXX":
 * "8XXXXXXXXXX" -> "7XXXXXXXXXX", "9XXXXXXXXX" (without country code) -> "79XXXXXXXXX"
 * @param value - Raw phone input (e.g. "+7 (999) 123-45-67")
 * @returns Digits only (e.g. "79991234567")
 */
export const normalizePhone = (value: string | null | undefined): string => {
	let digits = String(value ?? '').replace(/\D/g, '');
	if (digits.length === 11 && digits.startsWith('8'))
		digits = `7${digits.slice(1)}`;
	else if (digits.length === 10 && digits.startsWith('9'))
		digits = `7${digits}`;

	return digits;
};

/**
 * Input mask: Russian numbers become "+7 (999) 123-45-67" while typing
 * (a leading 8 is replaced and a leading 9 gets +7), other numbers stay "+digits"
 * @param value - Current input value
 * @returns Masked value
 */
export const maskPhoneInput = (value: string): string => {
	let digits = value.replace(/\D/g, '');
	if (!digits)
		return '';

	if (digits[0] === '8')
		digits = `7${digits.slice(1)}`;
	else if (digits[0] === '9')
		digits = `7${digits}`;

	if (digits[0] !== '7')
		return `+${digits.slice(0, 15)}`;

	const [, code = '', first = '', second = '', third = ''] = /^7(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/.exec(digits) ?? [];
	let result = '+7';
	if (code)
		result += ` (${code}`;
	if (first)
		result += `) ${first}`;
	if (second)
		result += `-${second}`;
	if (third)
		result += `-${third}`;

	return result;
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
