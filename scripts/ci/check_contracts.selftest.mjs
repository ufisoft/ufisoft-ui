#!/usr/bin/env node
// Self-test for the contract detectors: proves every active rule still fires.
// Copies scripts/ci/contract-fixtures/ into a temporary component folder, runs the
// checker and ESLint on it, and fails if any rule produced no finding — e.g. a broken
// regex, a YAML parsing change or an ESLint selector that no longer matches.
// The temporary folder is always removed. No dependencies: Node >= 22.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const fixtures = resolve(import.meta.dirname, 'contract-fixtures');
const name = 'zz-contract-fixture';
const tempDir = resolve(root, 'src/components', name);
const tempRel = `src/components/${name}/`;

const run = (command) =>
  spawnSync(command, { cwd: root, encoding: 'utf8', shell: true, maxBuffer: 16 * 1024 * 1024 });

if (existsSync(tempDir)) {
  console.error(
    `${tempRel} already exists — remove it first (left over from an interrupted run?).`,
  );
  process.exit(2);
}

const rules = run('node scripts/ci/check_contracts.mjs --list')
  .stdout.trim()
  .split('\n')
  .filter(Boolean)
  .map((line) => {
    const [id, kinds] = line.split(' ');
    return { id, kinds: kinds.split(',') };
  });

const fired = new Map(rules.map((r) => [r.id, 0]));
const cleanup = () => rmSync(tempDir, { recursive: true, force: true });
process.on('SIGINT', () => {
  cleanup();
  process.exit(130);
});

try {
  mkdirSync(tempDir);
  copyFileSync(resolve(fixtures, 'violations.tsx'), resolve(tempDir, 'index.tsx'));
  copyFileSync(resolve(fixtures, 'violations.module.css'), resolve(tempDir, `${name}.module.css`));

  // css-regex and structure rules: findings are printed as "<file>:<line>  [<rule-id>]".
  for (const line of run('node scripts/ci/check_contracts.mjs').stdout.split('\n')) {
    const m = /^(\S+):\d+\s+\[([\w-]+)\]/.exec(line);
    if (m && m[1].startsWith(tempRel) && fired.has(m[2])) fired.set(m[2], fired.get(m[2]) + 1);
  }

  // eslint rules: their messages link to the contract anchor "#<rule-id>".
  const eslint = run(`pnpm exec eslint --format json ${tempRel}`);
  const results = JSON.parse(eslint.stdout || '[]');
  for (const message of results.flatMap((r) => r.messages)) {
    for (const rule of rules) {
      if (message.message.includes(`#${rule.id}`)) fired.set(rule.id, fired.get(rule.id) + 1);
    }
  }
} finally {
  cleanup();
}

let missing = 0;
for (const rule of rules) {
  const count = fired.get(rule.id);
  if (count === 0) missing++;
  console.log(
    `  ${count > 0 ? 'FIRED ' : 'SILENT'}  ${rule.id.padEnd(30)} ${rule.kinds.join(',')}  (${count})`,
  );
}
console.log(
  missing === 0
    ? `\nAll ${rules.length} contract rules fire on the fixtures.`
    : `\n${missing} of ${rules.length} rule(s) never fired — fix the detector, or add a violation for it to scripts/ci/contract-fixtures/.`,
);
process.exit(rules.length > 0 && missing === 0 ? 0 : 1);
