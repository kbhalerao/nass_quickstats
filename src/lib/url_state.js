/**
 * Encode/decode `search_params` (a `{ key: string[] }` map) as a URL hash so
 * that the current filter set can be linked, bookmarked, or copied. We use the
 * hash (not the query string) so SvelteKit's loader doesn't see it as a route
 * parameter and to keep the server route URLs untouched.
 */

/**
 * @param {Record<string, string[]>} search_params
 * @returns {string} hash starting with `#` (empty string if no filters)
 */
export function encodeHash(search_params) {
	const pars = new URLSearchParams();
	for (const key of Object.keys(search_params ?? {})) {
		const values = search_params[key];
		if (!values?.length) continue;
		for (const v of values) pars.append(key, v);
	}
	const s = pars.toString();
	return s ? `#${s}` : '';
}

/**
 * Parse a `location.hash` into a `{ key: string[] }` map.
 * @param {string} hash
 * @returns {Record<string, string[]>}
 */
export function decodeHash(hash) {
	if (!hash || hash === '#') return {};
	const stripped = hash.startsWith('#') ? hash.slice(1) : hash;
	const pars = new URLSearchParams(stripped);
	/** @type {Record<string, string[]>} */
	const out = {};
	for (const key of pars.keys()) {
		out[key] = pars.getAll(key);
	}
	return out;
}
