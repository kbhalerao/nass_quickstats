<script>
	const MAX_RECORDS = 5000;
	export let search_params;
	export let table;
	$: searchstring = ((sp) => {
		let str = new URLSearchParams();
		for (const key of Object.keys(sp)) {
			if (sp[key].length) {
				for (const v of sp[key]) {
					str.append(key, v);
				}
			}
		}
		return str.toString();
	})(search_params);

	const get_count = async (search) => {
		const res = await fetch(`/api/counts?${search}`);
		return res.json();
	};

	$: count = get_count(searchstring);

	const get_data = async () => {
		const res = await fetch(`/api/get?${searchstring}`);
		table = await res.text();
	};
</script>

<div class="container">
	{#await count}
		<span>...calculating</span>
	{:then result}
		<span>{result.count.toLocaleString()} records</span>
		{#if result.count <= MAX_RECORDS}
			<button on:click={get_data}>Get data</button>
		{/if}
	{/await}
</div>
