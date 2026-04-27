/**
 * Minimal RFC-4180-ish CSV parser. Handles quoted fields, embedded commas,
 * embedded newlines, and `""` -> `"` escapes. Good enough for NASS responses,
 * which are quoted consistently. Returns rows as `string[][]`. Trailing empty
 * row (from a final newline) is dropped.
 *
 * @param {string} text
 * @returns {string[][]}
 */
export function parseCsv(text) {
	/** @type {string[][]} */
	const rows = [];
	/** @type {string[]} */
	let row = [];
	let cell = '';
	let inQuotes = false;

	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					cell += '"';
					i++;
				} else {
					inQuotes = false;
				}
			} else {
				cell += c;
			}
			continue;
		}
		if (c === '"') {
			inQuotes = true;
		} else if (c === ',') {
			row.push(cell);
			cell = '';
		} else if (c === '\n') {
			row.push(cell);
			rows.push(row);
			row = [];
			cell = '';
		} else if (c === '\r') {
			// swallow; \n handles row break
		} else {
			cell += c;
		}
	}
	if (cell.length || row.length) {
		row.push(cell);
		rows.push(row);
	}
	while (rows.length && rows[rows.length - 1].every((v) => v === '')) rows.pop();
	return rows;
}
