<script>
	import { browser } from '$app/environment';
	import { fetchOptions } from './options_client.js';
	import { buildSearchString } from './search.js';

	let { selector, updater, search_params = $bindable() } = $props();

	/** @type {string[]} */
	let choices = $state([]);
	let loading = $state(true);
	let filter = $state('');
	// One-time hydration: prefer the value already in search_params (e.g. from
	// a URL hash), fall back to the selector's default.
	// svelte-ignore state_referenced_locally
	let selection = $state(
		search_params[selector.key]?.length
			? [...search_params[selector.key]]
			: selector.default
				? [...selector.default]
				: []
	);

	let search_string = $derived(
		buildSearchString(search_params, {
			only: selector.depends ?? [],
			extra: { param: selector.key }
		})
	);

	let filtered = $derived(
		filter ? choices.filter((c) => c.toLowerCase().includes(filter.toLowerCase())) : choices
	);

	$effect(() => {
		if (!browser) return;
		const qs = search_string;
		let cancelled = false;
		loading = true;
		fetchOptions(qs)
			.then((res) => {
				if (cancelled) return;
				choices = [...new Set(res[selector.key] ?? [])];
				const valid = new Set(choices);
				const trimmed = selection.filter((s) => valid.has(s));
				if (trimmed.length !== selection.length) {
					selection = trimmed;
					updater(selector.key, selection);
				}
				loading = false;
			})
			.catch(() => {
				if (cancelled) return;
				choices = [];
				loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	function onSelectChange() {
		updater(selector.key, selection);
	}
	function clearSelection() {
		selection = [];
		filter = '';
		updater(selector.key, selection);
	}
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
	<div class="flex items-baseline gap-2 mb-1">
		<span class="font-semibold text-gray-900">{selector.name}</span>
		<span class="text-xs text-gray-500">
			{loading ? '…' : `${choices.length}`}
			{#if selection.length > 0}
				· <span class="text-blue-700 font-medium">{selection.length} selected</span>
			{/if}
		</span>
		<button
			type="button"
			class="ml-auto text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30"
			disabled={selection.length === 0}
			onclick={clearSelection}>clear</button
		>
	</div>
	<p class="text-xs text-gray-600 mb-2 leading-snug">{selector.description ?? ''}</p>

	<input
		type="search"
		placeholder="Filter options…"
		class="border border-gray-300 rounded px-2 py-1 text-sm mb-2 disabled:bg-gray-100"
		bind:value={filter}
		disabled={choices.length === 0}
	/>

	<select
		name={selector.key}
		id={selector.key}
		disabled={choices.length < 1}
		bind:value={selection}
		onchange={onSelectChange}
		size="10"
		multiple
		class="flex-1 border border-gray-300 rounded text-sm font-mono disabled:bg-gray-100"
	>
		{#if filtered.length > 0}
			{#each filtered as choice (choice)}
				<option value={choice}>{choice}</option>
			{/each}
		{:else if choices.length === 0}
			<option disabled>{loading ? 'Loading…' : 'No options'}</option>
		{:else}
			<option disabled>No matches for "{filter}"</option>
		{/if}
	</select>

	{#if selector.depends?.length}
		<p class="text-[11px] text-gray-400 mt-2 leading-tight">
			Narrows by: {selector.depends.join(', ')}
		</p>
	{/if}
</div>
