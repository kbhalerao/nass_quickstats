/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

// Bump this when you need to invalidate caches across an existing user base
// even when `version` (per-build hash) hasn't changed.
const SW_REVISION = 2;
const CACHE = `cache-${version}-${SW_REVISION}`;

const ASSETS = [
	...build, // the app itself
	...files // everything in `static`
];

self.addEventListener('install', (event) => {
	self.skipWaiting();

	async function addFilesToCache() {
		const cache = await caches.open(CACHE);
		await cache.addAll(ASSETS);
	}

	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
	async function takeOver() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
		// Claim open clients so the new SW serves them immediately rather than
		// waiting for the next reload — important when previous revisions cached
		// /api/* responses we want to stop serving.
		await self.clients.claim();
	}

	event.waitUntil(takeOver());
});

self.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	if (!event.request.url.startsWith('http')) return;

	const url = new URL(event.request.url);

	// API requests must NEVER be served from cache: NASS responses change as
	// data is published, and our /api/options dedup is already handled in
	// options_client.js with in-memory promise sharing. Caching at this layer
	// caused stale empty results to persist across sessions.
	if (url.pathname.startsWith('/api/')) return;

	async function respond() {
		const cache = await caches.open(CACHE);

		// Static build assets are content-hashed by Vite — cache-first is safe.
		if (ASSETS.includes(url.pathname)) {
			const cached = await cache.match(url.pathname);
			if (cached) return cached;
		}

		// Network-first for everything else, with cache as offline fallback.
		try {
			const response = await fetch(event.request);
			if (!(response instanceof Response)) throw new Error('invalid response from fetch');
			if (response.status === 200) cache.put(event.request, response.clone());
			return response;
		} catch (err) {
			const cached = await cache.match(event.request);
			if (cached) return cached;
			throw err;
		}
	}

	event.respondWith(respond());
});
