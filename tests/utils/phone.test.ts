import { describe, test, expect } from 'vitest';
import { formatPhone, isValidPhone, normalizePhone } from '@/utils/phone';

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
