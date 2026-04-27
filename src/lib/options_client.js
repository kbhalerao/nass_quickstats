/**
 * Module-level cache + in-flight dedupe for /api/options requests.
 *
 * Why: every Chooser independently triggers a fetch when its `search_string`
 * changes, but many Choosers share overlapping dependency subsets. Without
 * dedupe a single user click on Sector can fan out to 17 simultaneous identical
 * requests against NASS. The service worker eventually caches responses, but
 * not in-flight ones — so the first click of a session pays the full N× cost.
 *
 * Implementation: a single `Map<url, Promise<json>>`. Promises stay in the map
 * after settling so subsequent reads hit the cache without re-fetching.
 *
 * @type {Map<string, Promise<unknown>>}
 */
const cache = new Map();

/**
 * @param {string} qs - already-built query string (no leading `?`)
 * @returns {Promise<Record<string, string[]>>}
 */
export function fetchOptions(qs) {
	const url = `/api/options?${qs}`;
	const hit = cache.get(url);
	if (hit) return /** @type {Promise<Record<string, string[]>>} */ (hit);
	const p = fetch(url)
		.then((r) => r.json())
		.catch((err) => {
			cache.delete(url);
			throw err;
		});
	cache.set(url, p);
	return p;
}

/** Test hook. */
export function _resetOptionsCache() {
	cache.clear();
}
