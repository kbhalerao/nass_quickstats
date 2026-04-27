/**
 * Build a NASS API query string from a `search_params` map of
 * `{ paramKey: [value, ...] }`.
 *
 * @param {Record<string, string[]>} search_params
 * @param {object} [options]
 * @param {string[]} [options.only] - if provided, only these keys are emitted.
 *     Used by Chooser to send the subset of params its `depends` list cares about.
 * @param {Record<string, string>} [options.extra] - extra single-value pairs to append.
 * @returns {string} URLSearchParams-style query string (no leading `?`).
 */
export function buildSearchString(search_params, options = {}) {
	const { only, extra } = options;
	const pars = new URLSearchParams();
	for (const key of Object.keys(search_params ?? {})) {
		if (only && !only.includes(key)) continue;
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
