export const selectors = [
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
		default: [],
		description:
			'Five high level, broad categories useful to narrow down choices (Crops, Animals & Products, Economics, Demographics, and Environmental).'
	},
	{
		key: 'group_desc',
		name: 'Group',
		depends: ['year', 'source_desc', 'sector_desc'],
		dependency: 'hard',
		group: 'what',
		default: [],
		description:
			'Subsets within sector (e.g., under sector = Crops, the groups are Field Crops, Fruit & Tree Nuts, Horticulture, and Vegetables).'
	},
	{
		key: 'commodity_desc',
		name: 'Commodity',
		depends: ['year', 'source_desc', 'sector_desc', 'group_desc'],
		group: 'what',
		default: [],
		description: 'The primary subject of interest (e.g., CORN, CATTLE, LABOR, TRACTORS, OPERATORS).'
	},
	{
		key: 'class_desc',
		name: 'Class',
		depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc'],
		group: 'what',
		default: [],
		description:
			'Generally a physical attribute (e.g., variety, size, color, gender) of the commodity.'
	},
	{
		key: 'prodn_practice_desc',
		name: 'Production Practice',
		depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
		group: 'what',
		default: [],
		description:
			'A method of production or action taken on the commodity (e.g., IRRIGATED, ORGANIC, ON FEED).'
	},
	{
		key: 'util_practice_desc',
		name: 'Utilization',
		depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc', 'class_desc'],
		group: 'what',
		default: [],
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
		default: [],
		description:
			'The aspect of a commodity being measured (e.g., AREA HARVESTED, PRICE RECEIVED, INVENTORY, SALES).'
	},
	{
		key: 'unit_desc',
		name: 'Units',
		depends: ['statisticcat_desc'],
		group: 'what',
		default: [],
		description:
			'The unit associated with the statistic category (e.g., ACRES, $ / LB, HEAD, $, OPERATIONS).'
	},
	{
		key: 'domain_desc',
		name: 'Domain',
		depends: ['year', 'source_desc', 'sector_desc', 'group_desc', 'commodity_desc'],
		group: 'slice',
		default: [],
		description:
			'An additional dimension along which the metric is sliced — e.g. ECONOMIC CLASS, AGE, NAICS CLASSIFICATION, FARM SALES. Pick TOTAL (the default in the data) for an unsliced view.'
	},
	{
		key: 'domaincat_desc',
		name: 'Domain Category',
		depends: [
			'year',
			'source_desc',
			'sector_desc',
			'group_desc',
			'commodity_desc',
			'domain_desc'
		],
		group: 'slice',
		default: [],
		description:
			'The specific bucket within the chosen domain (e.g. for domain ECONOMIC CLASS, the category is the income bracket).'
	},
	{
		key: 'agg_level_desc',
		name: 'Geographic Level',
		depends: ['year'],
		group: 'where',
		default: ['COUNTY'],
		description:
			'Aggregation level or geographic granularity of the data (e.g., State, Ag District, County, Region, Zip Code).'
	},
	{
		key: 'state_name',
		name: 'State',
		depends: ['year', 'agg_level_desc'],
		applicable_agg_levels: [
			'STATE',
			'COUNTY',
			'AGRICULTURAL DISTRICT',
			'ZIP CODE',
			'AMERICAN INDIAN RESERVATION',
			'REGION : SUB-STATE'
		],
		group: 'where',
		default: [],
		description: 'State full name.'
	},
	{
		key: 'region_desc',
		name: 'Region',
		depends: ['year', 'agg_level_desc'],
		applicable_agg_levels: ['REGION : MULTI-STATE', 'REGION : SUB-STATE'],
		group: 'where',
		default: [],
		description:
			'NASS defined geographic entities not readily defined by other standard geographic levels. A region can be a less than a state (Sub-State) or a group of states (Multi-State), and may be specific to a commodity.'
	},
	{
		key: 'county_name',
		name: 'County',
		depends: ['agg_level_desc', 'state_name', 'year'],
		applicable_agg_levels: ['COUNTY'],
		dependency: 'hard',
		group: 'where',
		default: [],
		description: 'County Name.'
	},
	{
		key: 'asd_desc',
		name: 'Ag District',
		depends: ['agg_level_desc', 'state_name'],
		applicable_agg_levels: ['AGRICULTURAL DISTRICT'],
		group: 'where',
		default: [],
		description: 'Ag statistics district name.'
	},
	{
		key: 'zip_5',
		name: 'Zip code',
		depends: ['state_name'],
		applicable_agg_levels: ['ZIP CODE'],
		group: 'where',
		default: [],
		description: 'US Postal Service 5-digit zip code.'
	},
	{
		key: 'watershed_desc',
		name: 'Watershed',
		depends: ['agg_level_desc'],
		applicable_agg_levels: ['WATERSHED'],
		group: 'where',
		default: [],
		description:
			'Name assigned to the US Geological Survey (USGS) 8-digit Hydrologic Unit Code (HUC) watershed.'
	},
	{
		key: 'year',
		name: 'Year',
		depends: null,
		default: [],
		group: 'when',
		description: 'Years'
	},
	{
		key: 'freq_desc',
		name: 'Frequency',
		depends: [
			'year',
			'source_desc',
			'sector_desc',
			'group_desc',
			'commodity_desc',
			'statisticcat_desc'
		],
		group: 'when',
		default: [],
		description:
			'How often NASS publishes this metric (ANNUAL, MONTHLY, WEEKLY, POINT IN TIME). Most metrics are ANNUAL — set this only if you need sub-annual data.'
	},
	{
		key: 'reference_period_desc',
		name: 'Reference Period',
		depends: [
			'year',
			'source_desc',
			'sector_desc',
			'group_desc',
			'commodity_desc',
			'statisticcat_desc',
			'freq_desc'
		],
		group: 'when',
		default: [],
		description:
			'The within-year window the metric covers (YEAR, MARKETING YEAR, individual months, or named forecasts like "AUG FORECAST"). Use with Frequency.'
	}
];

export const groups = {
	what: 'Filter down to the key statistics you want to extract from NASS',
	slice: 'Optionally slice the metric by a demographic or business dimension',
	where: 'Narrow down the geographical extent of your search',
	when: 'Limit your search to a window of time'
};

/**
 * Decide whether a selector should be rendered for the current search state.
 *
 * Today the only conditional rule is `applicable_agg_levels`: a geo selector
 * declares which Geographic Levels it's relevant for, and is hidden until the
 * user picks a matching one. (E.g., a County picker is meaningless until
 * agg_level_desc=COUNTY is selected.)
 *
 * @param {{ key: string, applicable_agg_levels?: string[] }} selector
 * @param {Record<string, string[]>} search_params
 * @returns {boolean}
 */
export function isSelectorApplicable(selector, search_params) {
	if (selector.applicable_agg_levels) {
		const chosen = search_params['agg_level_desc'] ?? [];
		if (chosen.length === 0) return false;
		return selector.applicable_agg_levels.some((l) => chosen.includes(l));
	}
	return true;
}
