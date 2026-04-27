/**
 * Run an async fn over `items` with at most `limit` concurrent invocations.
 * Returns results in input order.
 *
 * Used by StatisticUnitChooser to fetch units-per-statistic without firing all
 * N requests at once. Cached requests resolve immediately, so the bound only
 * matters on cold caches.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} limit
 * @param {(item: T, index: number) => Promise<R>} fn
 * @returns {Promise<R[]>}
 */
export async function pmap(items, limit, fn) {
	/** @type {R[]} */
	const out = new Array(items.length);
	let next = 0;
	async function worker() {
		while (true) {
			const i = next++;
			if (i >= items.length) return;
			out[i] = await fn(items[i], i);
		}
	}
	const workers = Array.from({ length: Math.min(limit, items.length) }, worker);
	await Promise.all(workers);
	return out;
}
