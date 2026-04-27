<script>
	import { clickToCopy } from './clickToCopy.js';
	import { buildSearchString } from './search.js';

	const MAX_RECORDS = 50000;
	let { search_params, table = $bindable() } = $props();

	let target_qs = $derived(buildSearchString(search_params));

	// Debounce changes to target_qs into active_qs so rapid filter clicks
	// coalesce into a single /api/counts hit.
	// svelte-ignore state_referenced_locally
	let active_qs = $state(buildSearchString(search_params));
	$effect(() => {
		const next = target_qs;
		if (next === active_qs) return;
		const t = setTimeout(() => {
			active_qs = next;
		}, 250);
		return () => clearTimeout(t);
	});

	const get_count = async (qs) => {
		const res = await fetch(`/api/counts?${qs}`);
		return res.json();
	};
	let count = $derived(get_count(active_qs));

	let downloading = $state(false);
	const get_data = async () => {
		downloading = true;
		try {
			const res = await fetch(`/api/get?${active_qs}`);
			table = await res.text();
		} finally {
			downloading = false;
		}
	};

	let showing = $state(false);
	function copySuccess() {
		showing = true;
		setTimeout(() => (showing = false), 1200);
	}
	function copyError(event) {
		console.log(`Error! ${event.detail}`);
	}

	function reset() {
		for (const k of Object.keys(search_params)) {
			search_params[k] = [];
		}
		table = [];
	}
</script>

<svelte:window oncopysuccess={copySuccess} oncopyerror={copyError} />

<div
	class="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 py-3 mb-4 flex items-center gap-3 flex-wrap"
>
	{#await count}
		<span class="text-gray-500 text-sm">…calculating</span>
	{:then result}
		<span class="text-2xl font-bold tabular-nums">{result.count.toLocaleString()}</span>
		<span class="text-sm text-gray-600">records</span>
		{#if result.count <= MAX_RECORDS && result.count > 0}
			<button
				class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-1.5 px-3 rounded text-sm"
				disabled={downloading}
				onclick={get_data}>{downloading ? 'Downloading…' : 'Get data'}</button
			>
			<button
				class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-1.5 px-3 rounded text-sm"
				use:clickToCopy={'div#searchURL'}>Copy URL</button
			>
			{#if showing}
				<span class="text-sm text-emerald-700">Copied!</span>
			{/if}
		{:else if result.count > MAX_RECORDS}
			<span class="text-sm text-amber-700">Filter below {MAX_RECORDS.toLocaleString()} to download</span>
		{:else}
			<span class="text-sm text-gray-500">No records match this filter</span>
		{/if}
		<button
			class="ml-auto text-sm text-gray-500 hover:text-gray-900 underline"
			onclick={reset}>Reset all</button
		>
	{:catch}
		<span class="text-sm text-red-600">NASS API error — check filters or API key</span>
	{/await}
	<div id="searchURL" class="hidden">{active_qs}</div>
</div>
