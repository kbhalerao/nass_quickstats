<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { buildSearchString } from './search.js';

	let { selector, updater, search_params = $bindable() } = $props();
	let choices = $state(['Wait']);
	// svelte-ignore state_referenced_locally
	let selection = $state(selector.default ? [...selector.default] : []);
	let tooltip = $derived(`${selector.description}. Depends on ${selector.depends?.join(', ')}`);

	let search_string = $derived(
		buildSearchString(search_params, {
			only: selector.depends ?? [],
			extra: { param: selector.key }
		})
	);

	$effect(() => {
		get_choices(search_string);
	});

	const get_choices = async (search) => {
		if (browser) {
			let res = await fetch(`/api/options?${search}`);
			res = await res.json();
			choices = res[selector.key];
			selection = selection.filter((s) => choices.indexOf(s) > -1);
		}
	};

	onMount(async () => {
		await get_choices(search_string);
	});
</script>

<div class="w-80 m-1 p-4">
	<label for={selector.key}
		><span class="font-semibold">{selector.name}</span> ({choices.length}): {selection.join('; ')}
		<span class="float-right" title={tooltip}>?</span>
	</label>
	<br />
	<select
		name={selector.key}
		id={selector.key}
		disabled={choices.length < 1}
		bind:value={selection}
		onchange={() => updater(selector.key, selection)}
		multiple
	>
		{#if choices.length > 0}
			{#each choices as choice (choice)}
				<option value={choice}>{choice}</option>
			{/each}
		{:else}
			<option value={null}>No options</option>
		{/if}
	</select>
</div>

<style>
	select {
		width: 100%;
		overflow: auto;
	}
</style>
