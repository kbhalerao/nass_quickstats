<script>
	import { selectors, groups } from './selector_tree.js';
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import HR from './HR.svelte';
	import Table from './Table.svelte';
	let table = $state([]);

	let search_params = $state({});

	const update_search_params = (key, selection) => {
		console.log({ key, selection });
		search_params[key] = selection;
	};
</script>

<div class="container">
	<Counter {search_params} bind:table />
	{#each ['what', 'where', 'when'] as group}
		<HR text={groups[group]} />
		<div class="flex flex-wrap">
			{#each selectors.filter((s) => s.group === group) as selector (selector.key)}
				<Chooser {selector} updater={update_search_params} {search_params} />
			{/each}
		</div>
	{/each}
</div>
{#if table?.length}
	<HR text={'Retrieve data'} />
	<div class="container">
		<Table {search_params} {table} />
	</div>
{:else}
	<HR text={'Data will appear below'} />
{/if}
