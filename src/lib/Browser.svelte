<script>
	import { browser } from '$app/environment';
	import { groups, isSelectorApplicable, selectors } from './selector_tree.js';
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import HR from './HR.svelte';
	import RangeChooser from './RangeChooser.svelte';
	import StatisticUnitChooser from './StatisticUnitChooser.svelte';
	import Table from './Table.svelte';
	import { decodeHash, encodeHash } from './url_state.js';

	let table = $state([]);

	// Hydrate initial filter state from the URL hash so links are shareable.
	// Read this synchronously before child components mount, so Chooser
	// instances see their values during their own state initialization.
	let search_params = $state(browser ? decodeHash(window.location.hash) : {});

	// Mirror search_params to the URL hash on every change. Skip when the hash
	// already matches to avoid no-op history thrash.
	$effect(() => {
		if (!browser) return;
		const next = encodeHash(search_params);
		if (next === window.location.hash) return;
		// replaceState (not assign) so back/forward isn't littered with every click.
		const path = window.location.pathname + window.location.search + next;
		window.history.replaceState(window.history.state, '', path);
	});

	const update_search_params = (key, selection) => {
		search_params[key] = selection;
	};

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
</div>

{#if table?.length}
	<HR text="Retrieve data" />
	<div class="max-w-screen-2xl mx-auto">
		<Table {table} />
	</div>
{:else}
	<HR text="Data will appear below" />
{/if}
