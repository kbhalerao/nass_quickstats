import { describe, expect, it } from 'vitest';
import { decodeHash, encodeHash } from './url_state.js';

describe('encodeHash / decodeHash', () => {
	it('round-trips a multi-key, multi-value filter set', () => {
		const sp = {
			year: ['2023'],
			commodity_desc: ['CORN', 'SOYBEANS'],
			state_name: ['IOWA']
		};
		const decoded = decodeHash(encodeHash(sp));
		expect(decoded).toEqual(sp);
	});

	it('encodes empty params as empty string (no leading #)', () => {
		expect(encodeHash({})).toBe('');
		expect(encodeHash({ year: [] })).toBe('');
	});

	it('decodes an empty hash to {}', () => {
		expect(decodeHash('')).toEqual({});
		expect(decodeHash('#')).toEqual({});
	});

	it('decodes a hash with or without the leading #', () => {
		expect(decodeHash('#year=2023')).toEqual({ year: ['2023'] });
		expect(decodeHash('year=2023')).toEqual({ year: ['2023'] });
	});

	it('survives URL-encoded special characters in values', () => {
		const sp = { commodity_desc: ['CORN, GRAIN', 'SOYBEANS & OIL'] };
		const decoded = decodeHash(encodeHash(sp));
		expect(decoded).toEqual(sp);
	});
});
