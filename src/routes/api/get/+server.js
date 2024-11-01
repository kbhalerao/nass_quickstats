import { PRIVATE_QUICKSTATS_API_KEY } from '$env/static/private';
const BASE = 'https://quickstats.nass.usda.gov/api/api_GET/';
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	let par = url.searchParams;
	par.append('key', PRIVATE_QUICKSTATS_API_KEY);
	par.append('format', 'CSV');
	const res = await fetch(BASE + url.search);
	return res;
}
