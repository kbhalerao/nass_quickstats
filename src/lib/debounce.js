/**
 * Coalesce rapid calls into a trailing-edge invocation. Returns a function with
 * the same arguments as `fn` and a `.cancel()` to drop a pending call.
 *
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @param {number} ms
 * @returns {F & { cancel: () => void }}
 */
export function debounce(fn, ms) {
	/** @type {ReturnType<typeof setTimeout> | null} */
	let timer = null;
	const wrapped = /** @type {F & { cancel: () => void }} */ (
		(...args) => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				timer = null;
				fn(...args);
			}, ms);
		}
	);
	wrapped.cancel = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};
	return wrapped;
}
