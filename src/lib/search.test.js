import { describe, expect, it } from 'vitest';
import { baseParam, buildSearchString } from './search.js';

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

	it('always passes short_desc through, regardless of `only`', () => {
		const search = {
			short_desc: ['CORN, GRAIN - YIELD, MEASURED IN BU / ACRE'],
			year: ['2023'],
			state_name: ['IOWA']
		};
		// state_name selector wouldn't normally include short_desc in its deps,
		// but the metric search should still narrow the cascade.
		const qs = buildSearchString(search, {
			only: ['year', 'agg_level_desc'],
			extra: { param: 'state_name' }
		});
		const p = new URLSearchParams(qs);
		expect(p.get('short_desc')).toBe('CORN, GRAIN - YIELD, MEASURED IN BU / ACRE');
		expect(p.get('year')).toBe('2023');
		expect(p.has('state_name')).toBe(false); // not in `only`
	});

	it('passes year__GE / year__LE through when `only` allows year', () => {
		const search = {
			year__GE: ['2020'],
			year__LE: ['2024'],
			source_desc: ['SURVEY'],
			state_name: ['IOWA']
		};
		const qs = buildSearchString(search, {
			only: ['year', 'source_desc'],
			extra: { param: 'commodity_desc' }
		});
		const p = new URLSearchParams(qs);
		expect(p.get('year__GE')).toBe('2020');
		expect(p.get('year__LE')).toBe('2024');
		expect(p.get('source_desc')).toBe('SURVEY');
		expect(p.has('state_name')).toBe(false);
	});
});

describe('baseParam', () => {
	it('strips all NASS modifier suffixes', () => {
		expect(baseParam('year__GE')).toBe('year');
		expect(baseParam('year__LE')).toBe('year');
		expect(baseParam('year__LT')).toBe('year');
		expect(baseParam('year__GT')).toBe('year');
		expect(baseParam('year__NE')).toBe('year');
		expect(baseParam('commodity_desc__LIKE')).toBe('commodity_desc');
		expect(baseParam('commodity_desc__NOT_LIKE')).toBe('commodity_desc');
	});

	it('leaves params without modifiers alone', () => {
		expect(baseParam('year')).toBe('year');
		expect(baseParam('commodity_desc')).toBe('commodity_desc');
	});

	it('does not strip non-modifier double-underscores', () => {
		// `__FOO` isn't a recognised NASS modifier — leave it.
		expect(baseParam('something__FOO')).toBe('something__FOO');
	});
});
