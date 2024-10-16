<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	let { selector, updater, search_params = $bindable() } = $props();
	let choices = $state(['Wait']);
	let selection = $state([]);

	const makeSearchString = (search) => {
		const pars = new URLSearchParams();
		for (const key of Object.keys(search)) {
			if (search[key].length && selector.depends?.indexOf(key) > -1) {
				for (const v of search[key]) {
					pars.append(key, v);
				}
			}
		}
		pars.append('param', selector.key);
		return pars.toString();
	};

	let search_string = $derived(makeSearchString(search_params));

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

<div class="w-80 m-1">
	<label for={selector.key}>{selector.name} {selection.join('; ')}</label><br />
	<select
		name={selector.key}
		id={selector.key}
		bind:value={selection}
		onchange={() => updater(selector.key, selection)}
		multiple
	>
		{#each choices as choice (choice)}
			<option value={choice}>{choice}</option>
		{/each}
	</select>
</div>

<style>
	select {
		width: 100%;
		overflow: auto;
	}
</style>
