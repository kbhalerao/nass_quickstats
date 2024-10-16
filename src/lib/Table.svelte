<script>
	let { table, search_params } = $props();

	let lines = $derived(table.split('\n'));
	let header = $derived(lines[0].split(','));
	let body = $derived(lines.slice(1, 10));

	const make_caption = (s) => {
		let str = [];
		for (const key of Object.keys(s)) {
			str.push(`${key}=${s[key].length ? s[key] : '*'}`);
		}
		return str.join(', ');
	};

	const make_filename = () => {
		const dt = new Date();
		return `nass_${dt.getTime()}.csv`;
	};
	function download() {
		const a = document.createElement('a');
		const blob = new Blob([table], { type: 'csv' });
		const url = URL.createObjectURL(blob);
		a.setAttribute('href', url);
		a.setAttribute('download', make_filename());
		a.click();
	}
</script>

<div class="container">
	<button
		class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-1 rounded"
		onclick={download}>Download CSV (all {lines.length - 2} rows)</button
	>
	<table>
		<caption>Params {make_caption(search_params)}, showing up to 10 rows</caption>
		<thead>
			<tr>
				{#each header as th}
					<th>{th.replaceAll('"', '')}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each body as tr}
				<tr>
					{#each tr.split('","') as td}
						<td>{td.replaceAll('"', '')}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	td {
		text-transform: capitalize;
	}
	table,
	th,
	td {
		width: inherit;
		border: 1px solid black;
		border-collapse: collapse;
		font-size: small;
	}
</style>
