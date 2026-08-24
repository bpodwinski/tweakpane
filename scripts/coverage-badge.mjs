/* eslint-disable no-console */
/* eslint-env node */

import Fs from 'fs';

const SUMMARY_PATHS = [
	'packages/core/.c8-badge/coverage-summary.json',
	'packages/tweakpane/.c8-badge/coverage-summary.json',
];

function readTotals(path) {
	const json = JSON.parse(Fs.readFileSync(path, 'utf-8'));
	return json.total.statements;
}

function pickColor(pct) {
	if (pct >= 90) return 'brightgreen';
	if (pct >= 80) return 'green';
	if (pct >= 70) return 'yellowgreen';
	if (pct >= 60) return 'yellow';
	if (pct >= 50) return 'orange';
	return 'red';
}

const totals = SUMMARY_PATHS.map(readTotals);
const covered = totals.reduce((sum, t) => sum + t.covered, 0);
const total = totals.reduce((sum, t) => sum + t.total, 0);
const pct = Math.round((covered / total) * 1000) / 10;

const message = `${pct}%`;
const color = pickColor(pct);

console.log(`Combined statement coverage: ${message} (${color})`);

const outputPath = process.env.GITHUB_OUTPUT;
if (outputPath) {
	Fs.appendFileSync(outputPath, `coverage=${message}\ncolor=${color}\n`);
}
