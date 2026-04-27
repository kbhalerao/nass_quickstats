import { describe, expect, it } from 'vitest';
import { groups, isSelectorApplicable, selectors } from './selector_tree.js';

describe('selector_tree', () => {
	it('every selector belongs to a known group', () => {
		const known = new Set(Object.keys(groups));
		for (const s of selectors) {
			expect(known.has(s.group), `selector ${s.key} has unknown group ${s.group}`).toBe(true);
		}
	});

	it('every key is unique', () => {
		const keys = selectors.map((s) => s.key);
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('every `depends` entry refers to a real selector key (or is null)', () => {
		const known = new Set(selectors.map((s) => s.key));
		for (const s of selectors) {
			if (s.depends == null) continue;
			for (const d of s.depends) {
				// `state` is a typo of `state_name` — flag if it shows up
				expect(known.has(d), `${s.key} depends on unknown key "${d}"`).toBe(true);
			}
		}
	});
});

describe('isSelectorApplicable', () => {
	const get = (key) => selectors.find((s) => s.key === key);

	it('returns true for selectors without applicable_agg_levels', () => {
		expect(isSelectorApplicable(get('commodity_desc'), {})).toBe(true);
		expect(isSelectorApplicable(get('agg_level_desc'), {})).toBe(true);
	});

	it('hides geo selectors when agg level is unset', () => {
		expect(isSelectorApplicable(get('county_name'), {})).toBe(false);
		expect(isSelectorApplicable(get('zip_5'), {})).toBe(false);
	});

	it('shows the right geo selector for the chosen agg level', () => {
		const sp = { agg_level_desc: ['COUNTY'] };
		expect(isSelectorApplicable(get('state_name'), sp)).toBe(true);
		expect(isSelectorApplicable(get('county_name'), sp)).toBe(true);
		expect(isSelectorApplicable(get('asd_desc'), sp)).toBe(false);
		expect(isSelectorApplicable(get('zip_5'), sp)).toBe(false);
		expect(isSelectorApplicable(get('region_desc'), sp)).toBe(false);
		expect(isSelectorApplicable(get('watershed_desc'), sp)).toBe(false);
	});

	it('shows watershed only at WATERSHED level', () => {
		expect(isSelectorApplicable(get('watershed_desc'), { agg_level_desc: ['WATERSHED'] })).toBe(true);
		expect(isSelectorApplicable(get('state_name'), { agg_level_desc: ['WATERSHED'] })).toBe(false);
	});

	it('hides all geo selectors at NATIONAL', () => {
		const sp = { agg_level_desc: ['NATIONAL'] };
		for (const key of ['state_name', 'county_name', 'asd_desc', 'zip_5', 'region_desc', 'watershed_desc']) {
			expect(isSelectorApplicable(get(key), sp), key).toBe(false);
		}
	});
});
