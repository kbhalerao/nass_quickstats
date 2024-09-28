import { PRIVATE_QUICKSTATS_API_KEY } from '$env/static/private';
const BASE = 'https://quickstats.nass.usda.gov/api/get_param_values/';
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	let par = url.searchParams;
	par.append('key', PRIVATE_QUICKSTATS_API_KEY);
	const res = await fetch(BASE + url.search);
	return res;
}
