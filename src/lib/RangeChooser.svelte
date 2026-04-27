<script>
	let { selector, search_params = $bindable() } = $props();

	// `selector` is a stable per-mount config object; its range_keys are static.
	// svelte-ignore state_referenced_locally
	const [geKey, leKey] = selector.range_keys;

	// One-time hydration from search_params (URL hash etc).
	let from = $state(search_params[geKey]?.[0] ?? '');
	let to = $state(search_params[leKey]?.[0] ?? '');

	function commit() {
		search_params[geKey] = from ? [String(from)] : [];
		search_params[leKey] = to ? [String(to)] : [];
	}

	function clear() {
		from = '';
		to = '';
		commit();
	}

	let summary = $derived.by(() => {
		if (!from && !to) return '—';
		if (from && to) return from === to ? `${from}` : `${from} to ${to}`;
		if (from) return `from ${from}`;
		return `up to ${to}`;
	});

	const thisYear = new Date().getFullYear();
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col">
	<div class="flex items-baseline gap-2 mb-1">
		<span class="font-semibold text-gray-900">{selector.name}</span>
		<span class="text-xs text-gray-500">{summary}</span>
		<button
			type="button"
			class="ml-auto text-xs text-gray-500 hover:text-gray-900 disabled:opacity-30"
			disabled={!from && !to}
			onclick={clear}>clear</button
		>
	</div>
	<p class="text-xs text-gray-600 mb-3 leading-snug">{selector.description ?? ''}</p>

	<div class="flex items-center gap-2">
		<label class="flex flex-col text-xs text-gray-500 flex-1">
			From
			<input
				type="number"
				min="1850"
				max={thisYear + 1}
				placeholder="1850"
				class="border border-gray-300 rounded px-2 py-1 text-sm font-mono mt-0.5"
				bind:value={from}
				onchange={commit}
			/>
		</label>
		<span class="text-gray-400 mt-4">–</span>
		<label class="flex flex-col text-xs text-gray-500 flex-1">
			To
			<input
				type="number"
				min="1850"
				max={thisYear + 1}
				placeholder={String(thisYear)}
				class="border border-gray-300 rounded px-2 py-1 text-sm font-mono mt-0.5"
				bind:value={to}
				onchange={commit}
			/>
		</label>
	</div>

	<div class="flex flex-wrap gap-1 mt-3">
		{#each [{ label: 'Last 5y', y: 5 }, { label: 'Last 10y', y: 10 }, { label: 'Last 25y', y: 25 }] as preset (preset.label)}
			<button
				type="button"
				class="text-xs border border-gray-300 hover:border-gray-500 rounded px-2 py-0.5"
				onclick={() => {
					from = thisYear - preset.y + 1;
					to = thisYear;
					commit();
				}}>{preset.label}</button
			>
		{/each}
	</div>
</div>
