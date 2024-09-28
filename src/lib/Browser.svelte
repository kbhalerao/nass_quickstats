<script>
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import Table from './Table.svelte';
	let table = [];
	const selectors = [
		{
			key: 'source_desc',
			name: 'Program',
			depends: ['year'],
			group: 'what'
		},
		{
			key: 'sector_desc',
			name: 'Sector',
			depends: ['year', 'source_desc'],
			group: 'what'
		},
		{
			key: 'group_desc',
			name: 'Group',
			depends: ['year', 'source_desc', 'sector_desc'],
			dependency: 'hard',
			group: 'what'
		},
		{
			key: 'commodity_desc',
			name: 'Commodity',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc'],
			group: 'what'
		},
		{
			key: 'class_desc',
			name: 'Class',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc'],
			group: 'what'
		},
		{
			key: 'prodn_practice_desc',
			name: 'Production Practice',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
			group: 'what'
		},
		{
			key: 'util_practice_desc',
			name: 'Utilization',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
			group: 'what'
		},
		{
			key: 'statisticcat_desc',
			name: 'Category',
			depends: [
				'year',
				'source_desc',
				'sector_desc',
				'group_desc',
				'commodity_desc',
				'class_desc',
				'prodn_practice_desc',
				'util_practice_desc'
			],
			group: 'what'
		},
		{
			key: 'unit_desc',
			name: 'Units',
			depends: ['statisticcat_desc'],
			group: 'what'
		},
		{
			key: 'state_name',
			name: 'State',
			depends: ['year'],
			group: 'where'
		},
		{
			key: 'county_name',
			name: 'County',
			depends: ['state_name', 'year'],
			dependency: 'hard',
			group: 'where'
		},
		{
			key: 'year',
			name: 'Year',
			depends: null,
			group: 'when'
		}
	];

	let search_params = {};

	const update_search_params = (key, selection) => {
		search_params[key] = selection;
	};
</script>

<div class="container">
	<Counter {search_params} bind:table />
	{#each ['what', 'where', 'when'] as group}
		<strong>{group}</strong>
		<div class="selector-group">
			{#each selectors.filter((s) => s.group === group) as selector (selector.key)}
				<Chooser {selector} updater={update_search_params} {search_params} />
			{/each}
		</div>
	{/each}
</div>
{#if table?.length}
	<div class="container">
		<Table {search_params} {table} />
	</div>
{/if}

<style>
	.selector-group {
		display: flex;
	}
	h3 {
		text-transform: capitalize;
	}
	.selector-group {
		max-width: 100vw;
		display: flex;
		flex-wrap: wrap;
	}
</style>
