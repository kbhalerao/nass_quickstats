/**
 * Display config for NASS result columns.
 *
 * `LABELS` provides human-readable names for known columns. Anything not in
 * this map falls back to a derived label (strip `_desc`, replace `_`, title-case).
 *
 * `ALWAYS_HIDDEN` is the always-on hide list — code columns that duplicate name
 * columns (state_ansi/state_fips_code/state_alpha all vs state_name), purely
 * technical metadata (load_time), and fields whose information is already
 * carried elsewhere (short_desc concatenates commodity + statistic + unit).
 *
 * The Table component layers a *second* hide pass on top of this: any column
 * whose value is constant across every row in the result is part of the
 * filter context, not row-level data, and is shown in a summary header
 * instead of repeated per row.
 */

/** @type {Record<string, string>} */
export const LABELS = {
	source_desc: 'Program',
	sector_desc: 'Sector',
	group_desc: 'Group',
	commodity_desc: 'Commodity',
	class_desc: 'Class',
	prodn_practice_desc: 'Production',
	util_practice_desc: 'Utilization',
	statisticcat_desc: 'Statistic',
	unit_desc: 'Unit',
	short_desc: 'Description',
	domain_desc: 'Domain',
	domaincat_desc: 'Domain Category',
	agg_level_desc: 'Geo Level',
	state_name: 'State',
	asd_desc: 'Ag District',
	county_name: 'County',
	region_desc: 'Region',
	zip_5: 'Zip',
	watershed_desc: 'Watershed',
	country_name: 'Country',
	location_desc: 'Location',
	year: 'Year',
	freq_desc: 'Frequency',
	reference_period_desc: 'Period',
	Value: 'Value',
	'CV (%)': 'CV %'
};

export const ALWAYS_HIDDEN = new Set([
	// Duplicate codes for state/county/etc — name columns convey the same info.
	'state_ansi',
	'state_fips_code',
	'state_alpha',
	'asd_code',
	'county_ansi',
	'county_code',
	'congr_district_code',
	'country_code',
	'watershed_code',
	// Technical metadata users almost never need.
	'begin_code',
	'end_code',
	'week_ending',
	'load_time',
	// Concatenated derivative of commodity_desc + statisticcat_desc + unit_desc.
	'short_desc'
]);

/**
 * @param {string} key
 * @returns {string}
 */
export function prettyHeader(key) {
	if (key in LABELS) return LABELS[key];
	return key
		.replace(/_desc$/, '')
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

const NUMERIC_RE = /^-?[\d,]+(\.\d+)?\s*%?$/;
/**
 * Whether every non-empty value in `values` looks like a number (commas allowed).
 * Used to right-align columns.
 * @param {string[]} values
 */
export function isNumericColumn(values) {
	let seen = 0;
	for (const v of values) {
		const t = (v ?? '').trim();
		if (!t) continue;
		seen++;
		if (!NUMERIC_RE.test(t)) return false;
	}
	return seen > 0;
}
