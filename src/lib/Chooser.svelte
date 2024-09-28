<script>
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';

	export let selector = {};
	export let choices = [];
	export let updater;
	export let search_params = {};
	let selection = [];

	$: (() => {
		updater(selector.key, selection);
	})(selection);

	$: search_string = ((search) => {
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
	})(search_params);

	$: ((s) => get_choices(s))(search_string);

	const get_choices = async (search) => {
		if (browser) {
			let res = await fetch(`/api/options?${search}`);
			res = await res.json();
			choices = res[selector.key];
			selection = [];
		}
	};

	onMount(async () => {
		await get_choices(search_string);
	});
</script>

<div class="container">
	<label for={selector.key}>{selector.name}</label><br />
	<select name={selector.key} id={selector.key} bind:value={selection} multiple>
		{#each choices as choice (choice)}
			<option value={choice}>{choice}</option>
		{/each}
	</select>
</div>

<style>
	.container {
		margin: 0.25rem;
	}
</style>
