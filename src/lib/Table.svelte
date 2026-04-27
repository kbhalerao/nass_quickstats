<script>
	import { parseCsv } from './csv.js';
	import { ALWAYS_HIDDEN, isNumericColumn, prettyHeader } from './table_columns.js';

	const PREVIEW_ROWS = 25;

	let { table } = $props();

	let parsed = $derived(parseCsv(typeof table === 'string' ? table : ''));
	let headers = $derived(parsed[0] ?? []);
	let rows = $derived(parsed.slice(1));

	// A column is "constant" when every row has the same (non-empty) value.
	// Those values are filter context, not row-level data — surface them above
	// the table and drop the column from the body.
	let constants = $derived.by(() => {
		/** @type {Record<string, string>} */
		const out = {};
		for (let c = 0; c < headers.length; c++) {
			if (rows.length === 0) break;
			const h = headers[c];
			if (ALWAYS_HIDDEN.has(h)) continue;
			const v = rows[0][c] ?? '';
			if (!v) continue;
			let allSame = true;
			for (let r = 1; r < rows.length; r++) {
				if ((rows[r][c] ?? '') !== v) {
					allSame = false;
					break;
				}
			}
			if (allSame) out[h] = v;
		}
		return out;
	});

	// Visible column indices = not always-hidden, not constant, not entirely empty.
	let visibleCols = $derived.by(() => {
		/** @type {number[]} */
		const out = [];
		for (let c = 0; c < headers.length; c++) {
			const h = headers[c];
			if (ALWAYS_HIDDEN.has(h)) continue;
			if (h in constants) continue;
			const allEmpty = rows.every((r) => !(r[c] ?? '').trim());
			if (allEmpty) continue;
			out.push(c);
		}
		return out;
	});

	let numericCols = $derived(
		new Set(visibleCols.filter((c) => isNumericColumn(rows.map((r) => r[c] ?? ''))))
	);

	let preview = $derived(rows.slice(0, PREVIEW_ROWS));
	let totalRows = $derived(rows.length);

	let filename = `nass_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.csv`;
	function download() {
		const a = document.createElement('a');
		const blob = new Blob([table], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="space-y-3">
	<div class="flex items-center gap-3 flex-wrap">
		<button
			class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-3 rounded text-sm"
			onclick={download}>Download all {totalRows.toLocaleString()} rows (CSV)</button
		>
		<span class="text-sm text-gray-600">
			Showing {Math.min(PREVIEW_ROWS, totalRows)} of {totalRows.toLocaleString()} rows
		</span>
	</div>

	{#if Object.keys(constants).length > 0}
		<div class="bg-gray-50 border border-gray-200 rounded p-3">
			<div class="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
				Filter context (same on every row)
			</div>
			<div class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
				{#each Object.entries(constants) as [k, v] (k)}
					<div>
						<span class="text-gray-500">{prettyHeader(k)}:</span>
						<span class="font-medium text-gray-900">{v}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto border border-gray-200 rounded">
		<table class="min-w-full text-sm">
			<thead class="bg-gray-50">
				<tr>
					{#each visibleCols as c (c)}
						<th
							class="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200"
							class:text-right={numericCols.has(c)}
						>
							{prettyHeader(headers[c])}
						</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each preview as row, rIdx (rIdx)}
					<tr class="even:bg-gray-50">
						{#each visibleCols as c (c)}
							<td
								class="px-3 py-1.5 border-b border-gray-100 align-top"
								class:text-right={numericCols.has(c)}
								class:tabular-nums={numericCols.has(c)}
							>
								{row[c] ?? ''}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
