import { describe, expect, it } from 'vitest';
import { ALWAYS_HIDDEN, isNumericColumn, prettyHeader } from './table_columns.js';

describe('prettyHeader', () => {
	it('uses the explicit label when known', () => {
		expect(prettyHeader('commodity_desc')).toBe('Commodity');
		expect(prettyHeader('Value')).toBe('Value');
		expect(prettyHeader('CV (%)')).toBe('CV %');
	});

	it('falls back to a derived label for unknown keys', () => {
		expect(prettyHeader('something_new_desc')).toBe('Something New');
		expect(prettyHeader('plain_key')).toBe('Plain Key');
	});
});

describe('ALWAYS_HIDDEN', () => {
	it('hides redundant code columns when name columns exist', () => {
		expect(ALWAYS_HIDDEN.has('state_ansi')).toBe(true);
		expect(ALWAYS_HIDDEN.has('state_fips_code')).toBe(true);
		expect(ALWAYS_HIDDEN.has('state_alpha')).toBe(true);
		expect(ALWAYS_HIDDEN.has('county_code')).toBe(true);
		// keeps the name column
		expect(ALWAYS_HIDDEN.has('state_name')).toBe(false);
		expect(ALWAYS_HIDDEN.has('county_name')).toBe(false);
	});
});

describe('isNumericColumn', () => {
	it('detects integers and decimals (with commas)', () => {
		expect(isNumericColumn(['1,234', '5,678', '9,012'])).toBe(true);
		expect(isNumericColumn(['12.5', '0.6'])).toBe(true);
	});

	it('treats empty strings as skipped, not disqualifying', () => {
		expect(isNumericColumn(['1,234', '', '5,678'])).toBe(true);
	});

	it('rejects mixed text', () => {
		expect(isNumericColumn(['IOWA', 'OHIO'])).toBe(false);
		expect(isNumericColumn(['1,234', 'NA'])).toBe(false);
	});

	it('returns false when every value is empty', () => {
		expect(isNumericColumn(['', '', ''])).toBe(false);
	});

	it('handles percentage values (CV column)', () => {
		expect(isNumericColumn(['0.6', '1.2', '0.3'])).toBe(true);
	});
});
