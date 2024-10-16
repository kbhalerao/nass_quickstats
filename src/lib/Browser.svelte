<script lang="ts">
	import Chooser from './Chooser.svelte';
	import Counter from './Counter.svelte';
	import Table from './Table.svelte';
	let table = [];
	const selectors = [
		{
			key: 'source_desc',
			name: 'Program',
			depends: ['year'],
			group: 'what',
			description:
				'Source of data (CENSUS or SURVEY). Census program includes the Census of Ag as well as follow up projects. Survey program includes national, state, and county surveys.'
		},
		{
			key: 'sector_desc',
			name: 'Sector',
			depends: ['year', 'source_desc'],
			group: 'what',
			default: null,
			description:
				'Five high level, broad categories useful to narrow down choices (Crops, Animals & Products, Economics, Demographics, and Environmental).'
		},
		{
			key: 'group_desc',
			name: 'Group',
			depends: ['year', 'source_desc', 'sector_desc'],
			dependency: 'hard',
			group: 'what',
			default: null,
			description:
				'Subsets within sector (e.g., under sector = Crops, the groups are Field Crops, Fruit & Tree Nuts, Horticulture, and Vegetables).'
		},
		{
			key: 'commodity_desc',
			name: 'Commodity',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc'],
			group: 'what',
			default: null,
			description:
				'The primary subject of interest (e.g., CORN, CATTLE, LABOR, TRACTORS, OPERATORS).'
		},
		{
			key: 'class_desc',
			name: 'Class',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc'],
			group: 'what',
			default: null,
			description:
				'Generally a physical attribute (e.g., variety, size, color, gender) of the commodity.'
		},
		{
			key: 'prodn_practice_desc',
			name: 'Production Practice',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
			group: 'what',
			default: null,
			description:
				'A method of production or action taken on the commodity (e.g., IRRIGATED, ORGANIC, ON FEED).'
		},
		{
			key: 'util_practice_desc',
			name: 'Utilization',
			depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
			group: 'what',
			default: null,
			descriptions:
				'Utilizations (e.g., GRAIN, FROZEN, SLAUGHTER) or marketing channels (e.g., FRESH MARKET, PROCESSING, RETAIL).'
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
			group: 'what',
			default: null,
			description:
				'The aspect of a commodity being measured (e.g., AREA HARVESTED, PRICE RECEIVED, INVENTORY, SALES).'
		},
		{
			key: 'unit_desc',
			name: 'Units',
			depends: ['statisticcat_desc'],
			group: 'what',
			description:
				'The unit associated with the statistic category (e.g., ACRES, $ / LB, HEAD, $, OPERATIONS).'
		},
		{
			key: 'agg_level_desc',
			name: 'Geographic Level',
			depends: ['year'],
			group: 'where',
			description:
				'Aggregation level or geographic granularity of the data (e.g., State, Ag District, County, Region, Zip Code).'
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

	const groups = {
		what: 'Filter down to the key statistics you want extract from NASS',
		where: 'Narrow down the geographical extent of your search',
		when: 'Limit your search to a window of time'
	};

	let search_params = {};

	const update_search_params = (key, selection) => {
		search_params[key] = selection;
	};
</script>

<div class="container">
	<Counter {search_params} bind:table />
	{#each ['what', 'where', 'when'] as group}
		<strong>{groups[group]}</strong>
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
	.selector-group {
		max-width: 100vw;
		display: flex;
		flex-wrap: wrap;
	}
</style>
