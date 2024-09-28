<script>
	export let table;

	$: lines = table.split('\n');
	$: header = lines[0].split(',');
	$: body = lines.slice(1);
</script>

<table>
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

<style>
	td {
		text-transform: capitalize;
	}
	table,
	th,
	td {
		border: 1px solid black;
		border-collapse: collapse;
	}
</style>
