<script>
	const MAX_RECORDS = 50000;
	let { search_params, table = $bindable() } = $props();
	import { clickToCopy } from './clickToCopy.js';

	const makeSearchString = (sp) => {
		let str = new URLSearchParams();
		for (const key of Object.keys(sp)) {
			if (sp[key].length) {
				for (const v of sp[key]) {
					str.append(key, v);
				}
			}
		}
		return str.toString();
	};

	let searchstring = $derived(makeSearchString(search_params));

	const get_count = async (search) => {
		const res = await fetch(`/api/counts?${search}`);
		return res.json();
	};

	let count = $derived(get_count(searchstring));

	const get_data = async () => {
		const res = await fetch(`/api/get?${searchstring}`);
		table = await res.text();
	};

	let showing = $state(false);

	function copySuccess() {
		showing = true;
		setInterval(() => (showing = false), 500);
	}
	function copyError(event) {
		console.log(`Error! ${event.detail}`);
	}
</script>

<svelte:window on:copysuccess={copySuccess} on:copyerror={copyError} />

<div class="container">
	{#await count}
		<span>...calculating</span>
	{:then result}
		<span>{result.count.toLocaleString()} records</span>
		{#if result.count <= MAX_RECORDS}
			<button
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded"
				onclick={get_data}>Get data</button
			>
			<button
				class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-1 rounded"
				use:clickToCopy={'div#searchURL'}>Copy search query</button
			>
			<div id="searchURL" class="hidden">{searchstring}</div>
			{#if showing}
				<span>Copied!</span>
			{/if}
		{:else}
			<span>Too many records. Filter to below 50,000 to download</span>
		{/if}
	{/await}
</div>
