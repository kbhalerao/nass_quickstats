/**
 * NASS supports modifier suffixes on numeric/text params: `year__GE=2020` ("year
 * greater-or-equal 2020"), `year__LE=2024`, plus `__GT`, `__LT`, `__NE`,
 * `__LIKE`, `__NOT_LIKE`. We use them for range filters (Year). When the
 * `only` allow-list says "include year," it should also include `year__GE` etc.
 */
const MODIFIER_RE = /__(GE|GT|LE|LT|NE|LIKE|NOT_LIKE)$/;

/**
 * Filter keys that always flow through to every NASS request, regardless of a
 * selector's `depends` list. `short_desc` is the canonical example: when the
 * Find-a-metric search picks a specific short_desc, every cascade fetch should
 * narrow accordingly even though no other selector declares it as a dep.
 */
const GLOBAL_KEYS = new Set(['short_desc']);

/**
 * @param {string} key
 * @returns {string} the bare param name with any NASS modifier suffix stripped.
 */
export function baseParam(key) {
	return key.replace(MODIFIER_RE, '');
}

/**
 * Build a NASS API query string from a `search_params` map of
 * `{ paramKey: [value, ...] }`.
 *
 * @param {Record<string, string[]>} search_params
 * @param {object} [options]
 * @param {string[]} [options.only] - if provided, only keys whose base param
 *     is in this list are emitted. `year__GE` flows through when 'year' is
 *     allowed. Used by Chooser to send the subset of params its `depends`
 *     list cares about.
 * @param {Record<string, string>} [options.extra] - extra single-value pairs to append.
 * @returns {string} URLSearchParams-style query string (no leading `?`).
 */
export function buildSearchString(search_params, options = {}) {
	const { only, extra } = options;
	const pars = new URLSearchParams();
	for (const key of Object.keys(search_params ?? {})) {
		const base = baseParam(key);
		if (only && !only.includes(base) && !GLOBAL_KEYS.has(base)) continue;
		const values = search_params[key];
		if (!values?.length) continue;
		for (const v of values) {
			pars.append(key, v);
		}
	}
	if (extra) {
		for (const [k, v] of Object.entries(extra)) {
			pars.append(k, v);
		}
	}
	return pars.toString();
}
