<script>
	import { browser } from '$app/environment';
	import { replaceState } from '$app/navigation';
	import { groups, isSelectorApplicable, selectors } from './selector_tree.js';
	import { fetchOptions } from './options_client.js';
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import HR from './HR.svelte';
	import MetricSearch from './MetricSearch.svelte';
	import RangeChooser from './RangeChooser.svelte';
	import StatisticUnitChooser from './StatisticUnitChooser.svelte';
	import Table from './Table.svelte';
	import { decodeHash, encodeHash } from './url_state.js';

	// Dimensions a chosen short_desc fully determines. When the user picks a
	// metric, we backfill these in one shot so the Choosers stay coherent
	// with the metric.
	const METRIC_DIMS = [
		'source_desc',
		'sector_desc',
		'group_desc',
		'commodity_desc',
		'class_desc',
		'prodn_practice_desc',
		'util_practice_desc',
		'statisticcat_desc',
		'unit_desc'
	];

	let table = $state([]);

	// Hydrate initial filter state from the URL hash so links are shareable.
	// Read this synchronously before child components mount, so Chooser
	// instances see their values during their own state initialization.
	let search_params = $state(browser ? decodeHash(window.location.hash) : {});

	// Setup lock: while true, the categories overlay shows a spinner and the
	// underlying Choosers are inert. Set during a metric pick so each Chooser
	// doesn't fire its own fetch on a half-populated state — instead we batch
	// every parent dimension into a single search_params replacement.
	let setup_locked = $state(false);

	// Mirror search_params to the URL hash on every change. Skip when the hash
	// already matches to avoid no-op history thrash.
	$effect(() => {
		if (!browser) return;
		const next = encodeHash(search_params);
		if (next === window.location.hash) return;
		const path = window.location.pathname + window.location.search + next;
		replaceState(path, {});
	});

	const update_search_params = (key, selection) => {
		search_params[key] = selection;
	};

	async function setupFromMetric(short_desc) {
		setup_locked = true;
		try {
			const entries = await Promise.all(
				METRIC_DIMS.map(async (dim) => {
					const qs = new URLSearchParams({ param: dim, short_desc }).toString();
					const r = await fetchOptions(qs);
					return [dim, r[dim] ?? []];
				})
			);
			const next = { ...search_params, short_desc: [short_desc] };
			for (const [dim, vals] of entries) {
				next[dim] = vals;
			}
			search_params = next;
		} finally {
			setup_locked = false;
		}
	}

	// When agg_level_desc changes, drop values for geo selectors that are no
	// longer applicable. Otherwise the old county_name="STORY" keeps getting
	// sent to NASS even after the user switches to agg_level=STATE, where the
	// County selector isn't even visible.
	$effect(() => {
		const chosen = search_params['agg_level_desc'] ?? [];
		for (const s of selectors) {
			if (!s.applicable_agg_levels) continue;
			const applicable = s.applicable_agg_levels.some((l) => chosen.includes(l));
			if (!applicable && search_params[s.key]?.length) {
				search_params[s.key] = [];
			}
		}
	});
</script>

<div class="max-w-screen-2xl mx-auto">
	<Counter {search_params} bind:table />

	<MetricSearch bind:search_params {setupFromMetric} busy={setup_locked} />

	<div class="relative">
		{#each ['what', 'slice', 'where', 'when'] as group (group)}
			<HR text={groups[group]} />
			<div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
				{#each selectors.filter((s) => s.group === group && isSelectorApplicable(s, search_params)) as selector (selector.key)}
					{#if selector.type === 'range'}
						<RangeChooser {selector} bind:search_params />
					{:else if selector.type === 'composite' && selector.key === 'statisticcat_desc'}
						<StatisticUnitChooser {selector} bind:search_params />
					{:else}
						<Chooser {selector} updater={update_search_params} bind:search_params />
					{/if}
				{/each}
			</div>
		{/each}

		{#if setup_locked}
			<div
				class="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-start justify-center pt-16 z-30 rounded"
				role="status"
				aria-live="polite"
			>
				<div
					class="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-md"
				>
					<span
						class="inline-block h-5 w-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"
						aria-hidden="true"
					></span>
					<span class="text-sm text-gray-700">Setting up filters for this metric…</span>
				</div>
			</div>
		{/if}
	</div>
</div>

{#if table?.length}
	<HR text="Retrieve data" />
	<div class="max-w-screen-2xl mx-auto">
		<Table {table} />
	</div>
{:else}
	<HR text="Data will appear below" />
{/if}
