<script>
	import { browser } from '$app/environment';
	import { fetchOptions } from './options_client.js';
	import { buildSearchString } from './search.js';

	const MAX_RESULTS = 50;
	const DEBOUNCE_MS = 250;

	// Filters that *define what the metric is* — they get cleared from the
	// search because the user is using metric search to redefine them. Filters
	// that contextualise the metric (when, where, source, sector) still narrow.
	const METRIC_DEFINING_KEYS = new Set([
		'commodity_desc',
		'class_desc',
		'prodn_practice_desc',
		'util_practice_desc',
		'statisticcat_desc',
		'unit_desc',
		'short_desc'
	]);

	let { search_params = $bindable() } = $props();

	let query = $state('');
	/** @type {string[]} */
	let results = $state([]);
	let loading = $state(false);
	let open = $state(false);

	// One-time hydration from URL hash (already in search_params if present).
	let selected = $state(search_params['short_desc']?.[0] ?? '');

	function termsToLikePattern(q) {
		const terms = q.trim().split(/\s+/).filter(Boolean);
		if (terms.length === 0) return '';
		// SQL LIKE: % is the wildcard. Wrapping with %term1%term2%... matches
		// any short_desc that contains all terms in order. The NASS LIKE filter
		// is case-insensitive against uppercase short_desc values.
		// Naive stem: drop a trailing 's' so "yields" matches "YIELD",
		// "operations" matches "OPERATION", etc.
		const stem = (t) => (t.length >= 4 && t.endsWith('s') ? t.slice(0, -1) : t);
		return '%' + terms.map((t) => stem(t.toUpperCase())).join('%') + '%';
	}

	// Debounce typing into `active_query`.
	let active_query = $state('');
	$effect(() => {
		const next = query;
		if (next === active_query) return;
		const t = setTimeout(() => {
			active_query = next;
		}, DEBOUNCE_MS);
		return () => clearTimeout(t);
	});

	// Compute the request URL as a $derived so re-fetching only happens when the
	// *string* actually changes. Without this, the fetch effect re-runs on every
	// search_params mutation (including the trim-invalid-selections churn from
	// every Chooser as the cascade loads), cancelling each fetch before it
	// resolves — so the user never sees results.
	const search_qs = $derived.by(() => {
		const q = active_query.trim();
		if (q.length < 2) return null;
		const pattern = termsToLikePattern(q);

		// Strip metric-defining filters: the user is using this search to
		// redefine the metric, so commodity / stat / unit / class / practice
		// values from prior selections must not constrain it. Year, source,
		// sector, group, and geo filters DO still narrow.
		const contextual = {};
		for (const k of Object.keys(search_params)) {
			const base = k.replace(/__(GE|GT|LE|LT|NE|LIKE|NOT_LIKE)$/, '');
			if (METRIC_DEFINING_KEYS.has(base)) continue;
			contextual[k] = search_params[k];
		}

		return buildSearchString(
			{ ...contextual, short_desc__LIKE: [pattern] },
			{
				only: Object.keys(contextual)
					.map((k) => k.replace(/__(GE|GT|LE|LT|NE|LIKE|NOT_LIKE)$/, ''))
					.concat(['short_desc']),
				extra: { param: 'short_desc' }
			}
		);
	});

	$effect(() => {
		if (!browser) return;
		const qs = search_qs;
		if (qs === null) {
			results = [];
			loading = false;
			return;
		}
		let cancelled = false;
		loading = true;
		fetchOptions(qs)
			.then((res) => {
				if (cancelled) return;
				results = (res['short_desc'] ?? []).slice(0, MAX_RESULTS);
				loading = false;
			})
			.catch(() => {
				if (cancelled) return;
				results = [];
				loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	function pick(short_desc) {
		selected = short_desc;
		search_params['short_desc'] = [short_desc];
		query = '';
		results = [];
		open = false;
	}

	function clear() {
		selected = '';
		search_params['short_desc'] = [];
	}
</script>

<div class="mb-4">
	{#if selected}
		<div
			class="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2 flex-wrap"
		>
			<span class="text-xs font-semibold text-blue-800 uppercase tracking-wide">Metric:</span>
			<span class="font-mono text-sm text-blue-900">{selected}</span>
			<button
				type="button"
				class="ml-auto text-xs text-blue-700 hover:text-blue-900 underline"
				onclick={clear}>change</button
			>
		</div>
	{:else}
		<div class="relative">
			<label class="block">
				<span class="text-xs font-semibold text-gray-500 uppercase tracking-wide"
					>Find a metric</span
				>
				<input
					type="search"
					placeholder="e.g. corn yield bushels per acre"
					class="w-full border border-gray-300 rounded px-3 py-2 mt-1 text-sm"
					bind:value={query}
					onfocus={() => (open = true)}
					onblur={() => setTimeout(() => (open = false), 200)}
				/>
			</label>
			{#if open && query.trim().length >= 2}
				<div
					class="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-80 overflow-y-auto"
				>
					{#if loading}
						<div class="p-2 text-sm text-gray-500">Searching…</div>
					{:else if results.length === 0}
						<div class="p-2 text-sm text-gray-500">No matches. Try fewer / different terms.</div>
					{:else}
						{#each results as sd (sd)}
							<button
								type="button"
								class="block w-full text-left px-3 py-1.5 text-sm font-mono hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
								onmousedown={(e) => {
									e.preventDefault();
									pick(sd);
								}}
							>
								{sd}
							</button>
						{/each}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
