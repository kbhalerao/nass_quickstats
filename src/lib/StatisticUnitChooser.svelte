<script>
	import { browser } from '$app/environment';
	import { pmap } from './concurrency.js';
	import { fetchOptions } from './options_client.js';
	import { buildSearchString } from './search.js';

	const MAX_FETCH_PAIRS = 80;
	const FETCH_CONCURRENCY = 6;

	let { selector, search_params = $bindable() } = $props();

	/** @type {{stat: string, unit: string}[]} */
	let pairs = $state([]);
	let loading = $state(true);
	let too_many = $state(false);
	let filter = $state('');

	// Hydrate selection from search_params: zip statisticcat_desc + unit_desc.
	// The two arrays are written together by commit() so the index pairing holds.
	let selection = $state(
		(() => {
			const stats = search_params['statisticcat_desc'] ?? [];
			const units = search_params['unit_desc'] ?? [];
			return stats.map((s, i) => ({ stat: s, unit: units[i] ?? '' }));
		})()
	);

	let stat_qs = $derived(
		buildSearchString(search_params, {
			only: selector.depends ?? [],
			extra: { param: 'statisticcat_desc' }
		})
	);

	$effect(() => {
		if (!browser) return;
		const qs = stat_qs;
		let cancelled = false;
		loading = true;
		too_many = false;

		(async () => {
			try {
				const stats_res = await fetchOptions(qs);
				if (cancelled) return;
				const stats = stats_res['statisticcat_desc'] ?? [];

				if (stats.length > MAX_FETCH_PAIRS) {
					// Too many to enumerate units for. Show stats only; user must
					// narrow upstream filters before pairs become available.
					pairs = stats.map((s) => ({ stat: s, unit: '' }));
					too_many = true;
					loading = false;
					return;
				}

				const unit_lists = await pmap(stats, FETCH_CONCURRENCY, async (stat) => {
					const u_qs = buildSearchString(search_params, {
						only: selector.depends ?? [],
						extra: { param: 'unit_desc', statisticcat_desc: stat }
					});
					const r = await fetchOptions(u_qs);
					return r['unit_desc'] ?? [];
				});
				if (cancelled) return;

				/** @type {{stat: string, unit: string}[]} */
				const flat = [];
				for (let i = 0; i < stats.length; i++) {
					const stat = stats[i];
					const units = unit_lists[i];
					if (units.length === 0) flat.push({ stat, unit: '' });
					else for (const unit of units) flat.push({ stat, unit });
				}
				pairs = flat;

				// Trim selection to currently-valid pairs and re-emit.
				const valid = new Set(flat.map((p) => `${p.stat}|${p.unit}`));
				const trimmed = selection.filter((s) => valid.has(`${s.stat}|${s.unit}`));
				if (trimmed.length !== selection.length) {
					selection = trimmed;
					commit();
				}
				loading = false;
			} catch {
				if (!cancelled) {
					pairs = [];
					loading = false;
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	function commit() {
		search_params['statisticcat_desc'] = selection.map((s) => s.stat);
		search_params['unit_desc'] = selection.filter((s) => s.unit).map((s) => s.unit);
	}

	function togglePair(p) {
		const key = `${p.stat}|${p.unit}`;
		const idx = selection.findIndex((s) => `${s.stat}|${s.unit}` === key);
		if (idx >= 0) selection = selection.filter((_, i) => i !== idx);
		else selection = [...selection, p];
		commit();
	}

	function isSelected(p) {
		return selection.some((s) => s.stat === p.stat && s.unit === p.unit);
	}

	function clearAll() {
		selection = [];
		commit();
	}

	let filtered = $derived.by(() => {
		if (!filter) return pairs;
		const q = filter.toLowerCase();
		return pairs.filter(
			(p) => p.stat.toLowerCase().includes(q) || p.unit.toLowerCase().includes(q)
		);
	});

	function formatPair(p) {
		return p.unit ? `${p.stat} (${p.unit})` : p.stat;
	}
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
	<div class="flex items-baseline gap-2 mb-1">
		<span class="font-semibold text-gray-900">{selector.name}</span>
		<span class="text-xs text-gray-500">
			{loading ? '…' : pairs.length}
			{#if selection.length > 0}
				· <span class="text-blue-700 font-medium">{selection.length} selected</span>
			{/if}
		</span>
		<button
			type="button"
			class="ml-auto text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30"
			disabled={selection.length === 0}
			onclick={clearAll}>clear</button
		>
	</div>
	<p class="text-xs text-gray-600 mb-2 leading-snug">{selector.description ?? ''}</p>

	{#if too_many}
		<p class="text-xs text-amber-700 mb-2">
			Too many statistics ({pairs.length}) to enumerate units. Narrow Commodity/Group first to see
			unit pairings.
		</p>
	{/if}

	<input
		type="search"
		placeholder="Filter…"
		class="border border-gray-300 rounded px-2 py-1 text-sm mb-2 disabled:bg-gray-100"
		bind:value={filter}
		disabled={pairs.length === 0}
	/>

	<!--
		Sized to roughly match a native <select size="10"> with text-sm so the
		tile matches the other Choosers visually. leading-tight + minimal
		padding aligns row height with browser-native <option> rendering.
	-->
	<div
		class="h-[15rem] border border-gray-300 rounded text-sm font-mono overflow-y-auto bg-white"
	>
		{#if loading}
			<div class="px-1 py-0.5 text-gray-400">Loading…</div>
		{:else if filtered.length === 0}
			<div class="px-1 py-0.5 text-gray-400">
				{pairs.length === 0 ? 'No options' : `No matches for "${filter}"`}
			</div>
		{:else}
			{#each filtered as p (`${p.stat}|${p.unit}`)}
				<button
					type="button"
					class="block w-full text-left px-1 leading-tight hover:bg-blue-50"
					class:bg-blue-100={isSelected(p)}
					onclick={() => togglePair(p)}
				>
					{formatPair(p)}
				</button>
			{/each}
		{/if}
	</div>

	<p class="text-[11px] text-gray-400 mt-2 leading-tight">
		Narrows by: {selector.depends?.join(', ') ?? '—'}
	</p>
</div>
