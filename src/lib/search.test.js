import { describe, expect, it } from 'vitest';
import { buildSearchString } from './search.js';

describe('buildSearchString', () => {
	it('emits each value as its own pair (NASS expects repeated keys)', () => {
		const qs = buildSearchString({
			commodity_desc: ['CORN', 'SOYBEANS'],
			year: ['2023']
		});
		const params = new URLSearchParams(qs);
		expect(params.getAll('commodity_desc')).toEqual(['CORN', 'SOYBEANS']);
		expect(params.getAll('year')).toEqual(['2023']);
	});

	it('skips empty arrays and missing keys', () => {
		const qs = buildSearchString({
			commodity_desc: [],
			year: ['2023'],
			state_name: undefined
		});
		expect(qs).toBe('year=2023');
	});

	it('handles null/undefined input without throwing', () => {
		expect(buildSearchString(undefined)).toBe('');
		expect(buildSearchString(null)).toBe('');
		expect(buildSearchString({})).toBe('');
	});

	it('respects `only` allow-list — used by Chooser dependency cascade', () => {
		const search = {
			year: ['2023'],
			source_desc: ['SURVEY'],
			sector_desc: ['CROPS'],
			state_name: ['IOWA']
		};
		// `commodity_desc` selector depends on year/source/sector/group — not state_name.
		const qs = buildSearchString(search, {
			only: ['year', 'source_desc', 'sector_desc', 'group_desc'],
			extra: { param: 'commodity_desc' }
		});
		const params = new URLSearchParams(qs);
		expect(params.getAll('year')).toEqual(['2023']);
		expect(params.getAll('source_desc')).toEqual(['SURVEY']);
		expect(params.getAll('sector_desc')).toEqual(['CROPS']);
		expect(params.has('state_name')).toBe(false);
		expect(params.get('param')).toBe('commodity_desc');
	});

	it('appends `extra` even when search_params is empty', () => {
		const qs = buildSearchString(
			{},
			{ extra: { param: 'year', key: 'XYZ' } }
		);
		const params = new URLSearchParams(qs);
		expect(params.get('param')).toBe('year');
		expect(params.get('key')).toBe('XYZ');
	});

	it('preserves value order within a key', () => {
		const qs = buildSearchString({ state_name: ['IOWA', 'OHIO', 'TEXAS'] });
		const params = new URLSearchParams(qs);
		expect(params.getAll('state_name')).toEqual(['IOWA', 'OHIO', 'TEXAS']);
	});
});
