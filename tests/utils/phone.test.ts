import { describe, test, expect } from 'vitest';
import { formatPhone, isValidPhone, maskPhoneInput, normalizePhone } from '@/utils/phone';

describe('normalizePhone', () => {
	test('keeps digits only', () => {
		expect(normalizePhone('+7 (999) 123-45-67')).toBe('79991234567');
	});

	test('converts leading 8 to 7 for 11-digit numbers', () => {
		expect(normalizePhone('8 999 123 45 67')).toBe('79991234567');
	});

	test('does not touch a leading 8 in other lengths', () => {
		expect(normalizePhone('+86 138 0013 8000')).toBe('8613800138000');
	});

	test('adds 7 to a Russian number without country code', () => {
		expect(normalizePhone('9188390826')).toBe('79188390826');
	});

	test('handles empty values', () => {
		expect(normalizePhone(undefined)).toBe('');
	});
});

describe('isValidPhone', () => {
	test('accepts 10-15 digits', () => {
		expect(isValidPhone('79991234567')).toBe(true);
	});

	test('rejects short numbers', () => {
		expect(isValidPhone('12345')).toBe(false);
	});
});

describe('formatPhone', () => {
	test('formats Russian numbers', () => {
		expect(formatPhone('79991234567')).toBe('+7 999 123-45-67');
	});

	test('prefixes other numbers with +', () => {
		expect(formatPhone('8613800138000')).toBe('+8613800138000');
	});
});

describe('maskPhoneInput', () => {
	test('adds +7 when a number starts with 9', () => {
		expect(maskPhoneInput('9188390826')).toBe('+7 (918) 839-08-26');
	});

	test('replaces a leading 8 with +7', () => {
		expect(maskPhoneInput('89188390826')).toBe('+7 (918) 839-08-26');
	});

	test('formats partial input', () => {
		expect(maskPhoneInput('7918')).toBe('+7 (918');
		expect(maskPhoneInput('791883')).toBe('+7 (918) 83');
	});

	test('cuts extra digits of a Russian number', () => {
		expect(maskPhoneInput('+7 (918) 839-08-26 99')).toBe('+7 (918) 839-08-26');
	});

	test('keeps other countries as +digits', () => {
		expect(maskPhoneInput('380501234567')).toBe('+380501234567');
	});

	test('returns empty string for no digits', () => {
		expect(maskPhoneInput('+')).toBe('');
	});
});
