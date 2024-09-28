import { PRIVATE_QUICKSTATS_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';
const BASE = 'https://quickstats.nass.usda.gov/api/get_counts/';
/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	let par = url.searchParams;
	par.append('key', PRIVATE_QUICKSTATS_API_KEY);
	const res = await fetch(BASE + url.search);
	return res;
}
