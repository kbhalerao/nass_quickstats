import { describe, expect, it } from 'vitest';
import { groups, selectors } from './selector_tree.js';

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
