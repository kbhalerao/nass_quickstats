<script>
	export let table;
	export let search_params;

	$: lines = table.split('\n');
	$: header = lines[0].split(',');
	$: body = lines.slice(1, 10);

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
	<button on:click={download}>Download CSV</button>
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
	.container {
		width: 100%;
		overflow-y: scroll;
	}
	td {
		text-transform: capitalize;
	}
	table,
	th,
	td {
		width: inherit;
		border: 1px solid black;
		border-collapse: collapse;
	}
</style>
