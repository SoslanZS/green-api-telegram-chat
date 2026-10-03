import { describe, test, expect } from 'vitest';
import { getDefaultApiUrl } from '@/api/green-api';

describe('getDefaultApiUrl', () => {
	test('uses the first 4 digits of idInstance as host', () => {
		expect(getDefaultApiUrl('4100123456')).toBe('https://4100.api.green-api.com');
	});

	test('trims spaces', () => {
		expect(getDefaultApiUrl(' 7105123456 ')).toBe('https://7105.api.green-api.com');
	});

	test('falls back to the common host for incomplete input', () => {
		expect(getDefaultApiUrl('41')).toBe('https://api.green-api.com');
	});
});
