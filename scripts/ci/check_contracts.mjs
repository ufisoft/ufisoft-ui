#!/usr/bin/env node
// Contract checker. Reads the YAML frontmatter of docs/contracts/*.md, runs the
// `css-regex` and `structure` detectors, and reports `eslint` detectors as delegated
// (verifying only that their selector is wired into eslint.config.js).
// Exits 1 when any `error` finding exists. No dependencies: Node >= 22.
import { globSync, readFileSync } from 'node:fs';
import { matchesGlob, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const toPosix = (file) => file.replaceAll('\\', '/');

// ---------------------------------------------------------------------------
// Minimal YAML subset: block maps, block sequences, flow [..] / {..},
// quoted and plain scalars. Anything else throws instead of being misread.
// ---------------------------------------------------------------------------
function parseYaml(text, source) {
  const lines = text
    .split('\n')
    .map((raw, i) => ({ raw: raw.replace(/\r$/, ''), no: i + 1 }))
    .filter(({ raw }) => raw.trim() !== '' && !raw.trim().startsWith('#'))
    .map(({ raw, no }) => ({ indent: raw.length - raw.trimStart().length, text: raw.trim(), no }));
  const fail = (line, msg) => {
    throw new Error(`${source}:${line?.no ?? '?'} unsupported YAML — ${msg}`);
  };

  let i = 0;
  // Bracket depth outside quotes, to join flow collections that Prettier wraps over lines.
  function depth(text) {
    let d = 0;
    let quote = null;
    for (const ch of text) {
      if (quote) quote = ch === quote ? null : quote;
      else if (ch === "'" || ch === '"') quote = ch;
      else if (ch === '[' || ch === '{') d++;
      else if (ch === ']' || ch === '}') d--;
    }
    return d;
  }
  // Consumes lines after the current one until the flow collection in `text` is closed.
  function joinFlow(text, line) {
    while (depth(text) > 0) {
      if (i >= lines.length) fail(line, 'unterminated flow collection');
      text += ` ${lines[i++].text}`;
    }
    return text;
  }
  function parseBlock(indent) {
    const first = lines[i];
    if (!first || first.indent < indent) return null;
    if (/^[[{]/.test(first.text)) {
      i++;
      return parseScalar(joinFlow(first.text, first), first);
    }
    return first.text.startsWith('- ') ? parseSeq(first.indent) : parseMap(first.indent);
  }
  function parseSeq(indent) {
    const out = [];
    while (i < lines.length && lines[i].indent === indent && lines[i].text.startsWith('- ')) {
      const line = lines[i];
      const rest = line.text.slice(2);
      if (/^[\w-]+:(\s|$)/.test(rest)) {
        // "- key: value" starts a map whose other keys sit at indent + 2.
        lines[i] = { ...line, indent: indent + 2, text: rest };
        out.push(parseMap(indent + 2));
      } else {
        i++;
        out.push(parseScalar(joinFlow(rest, line), line));
      }
    }
    return out;
  }
  function parseMap(indent) {
    const out = {};
    while (i < lines.length && lines[i].indent === indent) {
      const line = lines[i];
      const m = /^([\w-]+):(?:\s+(.*))?$/.exec(line.text);
      if (!m) fail(line, `expected "key: value", got "${line.text}"`);
      i++;
      out[m[1]] =
        m[2] === undefined ? parseBlock(indent + 1) : parseScalar(joinFlow(m[2], line), line);
    }
    if (i < lines.length && lines[i].indent > indent) fail(lines[i], 'unexpected indentation');
    return out;
  }
  function parseScalar(str, line) {
    const p = { s: str.trim(), pos: 0 };
    const value = parseFlow(p, line, false);
    if (p.s.slice(p.pos).trim() !== '') fail(line, `trailing content "${p.s.slice(p.pos)}"`);
    return value;
  }
  function parseFlow(p, line, inFlow) {
    skipWs(p);
    const c = p.s[p.pos];
    if (c === '[') {
      p.pos++;
      const arr = [];
      skipWs(p);
      if (p.s[p.pos] === ']') return (p.pos++, arr);
      for (;;) {
        arr.push(parseFlow(p, line, true));
        if (closeAfterItem(p, ']', line)) return arr;
      }
    }
    if (c === '{') {
      p.pos++;
      const obj = {};
      skipWs(p);
      if (p.s[p.pos] === '}') return (p.pos++, obj);
      for (;;) {
        skipWs(p);
        const key = /^[\w-]+/.exec(p.s.slice(p.pos))?.[0];
        if (!key) fail(line, 'expected key in { }');
        p.pos += key.length;
        skipWs(p);
        if (p.s[p.pos] !== ':') fail(line, `expected ":" after "${key}"`);
        p.pos++;
        obj[key] = parseFlow(p, line, true);
        if (closeAfterItem(p, '}', line)) return obj;
      }
    }
    if (c === "'") {
      let out = '';
      for (p.pos++; p.pos < p.s.length; p.pos++) {
        if (p.s[p.pos] === "'") {
          if (p.s[p.pos + 1] !== "'") return (p.pos++, out);
          out += "'"; // '' is an escaped quote
          p.pos++;
        } else out += p.s[p.pos];
      }
      fail(line, 'unterminated single-quoted string');
    }
    if (c === '"') {
      let out = '';
      for (p.pos++; p.pos < p.s.length; p.pos++) {
        const ch = p.s[p.pos];
        if (ch === '\\') out += p.s[++p.pos];
        else if (ch === '"') return (p.pos++, out);
        else out += ch;
      }
      fail(line, 'unterminated double-quoted string');
    }
    const stop = inFlow ? /[,\]}]/ : /$^/;
    let end = p.pos;
    while (end < p.s.length && !stop.test(p.s[end])) end++;
    const plain = p.s.slice(p.pos, end).trim();
    p.pos = end;
    if (/^[&*!|>]/.test(plain))
      fail(line, `anchors, tags and block scalars are not supported: "${plain}"`);
    if (plain === 'true' || plain === 'false') return plain === 'true';
    if (plain === 'null' || plain === '~' || plain === '') return null;
    if (/^-?\d+(\.\d+)?$/.test(plain)) return Number(plain);
    return plain;
  }
  // After a flow item: consume "," (a trailing one before the closer is allowed).
  // Returns true when the collection is closed.
  function closeAfterItem(p, closer, line) {
    skipWs(p);
    if (p.s[p.pos] === ',') {
      p.pos++;
      skipWs(p);
    } else if (p.s[p.pos] !== closer) fail(line, `unterminated ${closer === ']' ? '[ ]' : '{ }'}`);
    if (p.s[p.pos] !== closer) return false;
    p.pos++;
    return true;
  }
  function skipWs(p) {
    while (p.s[p.pos] === ' ') p.pos++;
  }

  const result = parseBlock(0);
  if (i < lines.length) fail(lines[i], 'could not parse the rest of the document');
  return result;
}

// ---------------------------------------------------------------------------
// Contracts
// ---------------------------------------------------------------------------
function loadContracts() {
  const files = globSync('docs/contracts/*.md', { cwd: root })
    .map(toPosix)
    .filter((f) => !f.endsWith('/README.md'))
    .sort();
  return files.map((file) => {
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(read(file));
    if (!m) throw new Error(`${file}: missing YAML frontmatter`);
    const meta = parseYaml(m[1], file);
    for (const key of ['id', 'scope', 'read_trigger', 'status', 'source', 'rules']) {
      if (meta[key] == null) throw new Error(`${file}: frontmatter is missing "${key}"`);
    }
    return { file, ...meta };
  });
}

function filesFor(appliesTo) {
  const include = appliesTo?.include_globs ?? [];
  const exclude = appliesTo?.exclude_globs ?? [];
  const found = new Set(include.flatMap((g) => globSync(g, { cwd: root }).map(toPosix)));
  return [...found].filter((f) => !exclude.some((g) => matchesGlob(f, g))).sort();
}

// Blank out /* comments */ but keep newlines so line numbers stay correct.
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));

function runCssRegex(rule, params, files) {
  if (!params?.pattern) throw new Error(`[${rule.id}] css-regex needs params.pattern`);
  const flags = [...new Set(`${params.flags ?? ''}g`)].join('');
  const pattern = new RegExp(params.pattern, flags);
  const allowedTokens = params.allowed_from
    ? new Set([...read(params.allowed_from).matchAll(/(--ufi-[\w-]+)\s*:/g)].map((m) => m[1]))
    : null;
  // Allowed exceptions: "text" (any file) or { file, match } (that file only).
  // A line containing the text is skipped.
  const allow = (params.allow ?? []).map((a) => (typeof a === 'string' ? { match: a } : a));
  const findings = [];
  for (const file of files) {
    const allowHere = allow.filter((a) => !a.file || a.file === file).map((a) => a.match);
    stripCssComments(read(file))
      .split('\n')
      .forEach((line, idx) => {
        if (allowHere.some((a) => line.includes(a))) return;
        for (const m of line.matchAll(pattern)) {
          if (allowedTokens && allowedTokens.has(m[1])) continue;
          findings.push({ file, line: idx + 1, detail: m[0] });
        }
      });
  }
  return findings;
}

// Names a module exports: declarations, local `export { }` and re-exports.
function exportedNames(source) {
  const names = new Map();
  source.split('\n').forEach((line, idx) => {
    const decl =
      /^export\s+(?:declare\s+)?(?:async\s+)?(?:function|const|let|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/.exec(
        line,
      );
    if (decl) names.set(decl[1], idx + 1);
  });
  for (const m of source.matchAll(/^export\s*\{([^}]*)\}/gm)) {
    const lineNo = source.slice(0, m.index).split('\n').length;
    for (const part of m[1].split(',')) {
      const name = part
        .trim()
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.set(name, lineNo);
    }
  }
  return names;
}

function runStructure(rule, params, files) {
  if (params?.check !== 'public-exports') {
    throw new Error(`[${rule.id}] unknown structure check "${params?.check}"`);
  }
  const publicNames = exportedNames(read(params.entry));
  const findings = [];
  for (const file of files) {
    for (const [name, line] of exportedNames(read(file))) {
      if (!publicNames.has(name)) {
        findings.push({ file, line, detail: `"${name}" is not exported from ${params.entry}` });
      }
    }
  }
  return findings;
}

function checkEslintWiring(rule, params) {
  const config = read('eslint.config.js');
  if (params?.selector && config.includes(params.selector)) return [];
  return [
    {
      file: 'eslint.config.js',
      line: 1,
      detail: `selector for [${rule.id}] is not wired into eslint.config.js`,
    },
  ];
}

// ---------------------------------------------------------------------------
const contracts = loadContracts();
const seen = new Set();
const counts = { rules: 0, gating: 0, cssRegex: 0, structure: 0, eslint: 0 };
const findings = [];

for (const contract of contracts) {
  if (contract.status !== 'active') continue;
  for (const rule of contract.rules) {
    if (seen.has(rule.id)) throw new Error(`${contract.file}: duplicate rule id "${rule.id}"`);
    seen.add(rule.id);
    counts.rules++;
    if (rule.severity === 'error') counts.gating++;
    const files = filesFor(rule.applies_to);
    for (const detector of rule.detectors ?? []) {
      let found;
      if (detector.kind === 'css-regex') {
        counts.cssRegex++;
        found = runCssRegex(rule, detector.params, files);
      } else if (detector.kind === 'structure') {
        counts.structure++;
        found = runStructure(rule, detector.params, files);
      } else if (detector.kind === 'eslint') {
        counts.eslint++;
        found = checkEslintWiring(rule, detector.params);
      } else {
        throw new Error(`${contract.file}: unknown detector kind "${detector.kind}"`);
      }
      findings.push(...found.map((f) => ({ ...f, rule, contract })));
    }
  }
}

for (const f of findings) {
  const level = f.rule.severity === 'error' ? '' : ` (${f.rule.severity})`;
  console.log(`${f.file}:${f.line}  [${f.rule.id}]${level}  ${f.rule.text}  — ${f.detail}`);
}

const errors = findings.filter((f) => f.rule.severity === 'error').length;
console.log(
  `\n${contracts.length} contract(s), ${counts.rules} rule(s) compiled, ${counts.gating} gating (severity error). ` +
    `${counts.cssRegex} css-regex, ${counts.structure} structure, ${counts.eslint} delegated to ESLint. ` +
    `${findings.length} finding(s), ${errors} error(s).`,
);
process.exit(errors > 0 ? 1 : 0);
