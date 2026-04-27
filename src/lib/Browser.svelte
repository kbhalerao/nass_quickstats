<script>
	import { browser } from '$app/environment';
	import { selectors, groups } from './selector_tree.js';
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import HR from './HR.svelte';
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
</script>

<div class="max-w-screen-2xl mx-auto">
	<Counter {search_params} bind:table />

	{#each ['what', 'slice', 'where', 'when'] as group (group)}
		<HR text={groups[group]} />
		<div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
			{#each selectors.filter((s) => s.group === group) as selector (selector.key)}
				<Chooser {selector} updater={update_search_params} bind:search_params />
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
