#!/usr/bin/env node
// Runs every pre-push gate, does not stop at the first failure, prints a summary
// and exits 1 if any gate failed. Run from anywhere: `node team-skills/ship-pilot/scripts/gates.mjs`.
// Written as .mjs (not .sh) because the team works on Windows.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '../../..');

const gates = [
  { name: 'lint', command: 'pnpm lint' },
  { name: 'typecheck', command: 'pnpm typecheck' },
  { name: 'test', command: 'pnpm test' },
  { name: 'build', command: 'pnpm build' },
  { name: 'format:check', command: 'pnpm format:check' },
  { name: 'contracts', command: 'pnpm check:contracts' },
  { name: 'detectors', command: 'pnpm check:contracts:selftest' },
  { name: 'changeset', command: 'pnpm exec changeset status --since=main' },
];

const results = [];

for (const gate of gates) {
  console.log(`\n▶ ${gate.name}: ${gate.command}`);
  const started = Date.now();
  // shell: true so `pnpm` resolves to pnpm.cmd on Windows.
  const { status } = spawnSync(gate.command, { cwd: repoRoot, stdio: 'inherit', shell: true });
  results.push({ ...gate, ok: status === 0, seconds: ((Date.now() - started) / 1000).toFixed(1) });
}

console.log('\nGate summary');
for (const r of results) {
  console.log(
    `  ${r.ok ? 'PASS' : 'FAIL'}  ${r.name.padEnd(12)} ${r.seconds.padStart(6)}s  ${r.command}`,
  );
}

const failed = results.filter((r) => !r.ok);
console.log(failed.length === 0 ? '\nAll gates passed.' : `\n${failed.length} gate(s) failed.`);
process.exit(failed.length === 0 ? 0 : 1);
