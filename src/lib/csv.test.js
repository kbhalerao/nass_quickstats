import { describe, expect, it } from 'vitest';
import { parseCsv } from './csv.js';

describe('parseCsv', () => {
	it('parses a simple unquoted row', () => {
		expect(parseCsv('a,b,c\n1,2,3')).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});

	it('handles quoted fields containing commas', () => {
		const rows = parseCsv('"x","a, b","y"\n"1","2,3","4"');
		expect(rows).toEqual([
			['x', 'a, b', 'y'],
			['1', '2,3', '4']
		]);
	});

	it('handles escaped double-quotes inside fields', () => {
		expect(parseCsv('"he said ""hi"""')).toEqual([['he said "hi"']]);
	});

	it('drops a trailing blank row from a final newline', () => {
		expect(parseCsv('a,b\n1,2\n')).toEqual([
			['a', 'b'],
			['1', '2']
		]);
	});

	it('handles CRLF line endings', () => {
		expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
			['a', 'b'],
			['1', '2']
		]);
	});

	it('handles a NASS-style row with quoted commas in the unit', () => {
		const csv =
			'"commodity_desc","unit_desc","Value"\n' +
			'"AG LAND","$ / ACRE","5,830"\n' +
			'"AG LAND","$ / ACRE","5,570"';
		expect(parseCsv(csv)).toEqual([
			['commodity_desc', 'unit_desc', 'Value'],
			['AG LAND', '$ / ACRE', '5,830'],
			['AG LAND', '$ / ACRE', '5,570']
		]);
	});

	it('returns [] on empty input', () => {
		expect(parseCsv('')).toEqual([]);
	});
});
