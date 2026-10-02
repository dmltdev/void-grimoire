import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const relations = ['depends-on', 'chains-to', 'suggests'];
const tracked = new Set(['name', ...relations]);

function discoverCatalog() {
  const directories = path => readdirSync(path, { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  const catalog = [];
  for (const domain of directories(join(root, 'skills'))) {
    for (const directory of directories(join(root, 'skills', domain))) {
      const file = `skills/${domain}/${directory}/SKILL.md`;
      if (!readdirSync(join(root, 'skills', domain, directory), { withFileTypes: true })
        .some(entry => entry.name === 'SKILL.md' && entry.isFile())) continue;
      catalog.push({ file, directory, content: readFileSync(join(root, file), 'utf8') });
    }
  }
  return catalog;
}

// This deliberately supports only the repository's plain keys and simple flow values.
// New graph syntax must fail visibly, not disappear from reference validation.
function parseValue(field, value) {
  const skillName = token => {
    if (!/^(?:[a-z0-9]+(?:-[a-z0-9]+)*|"[a-z0-9]+(?:-[a-z0-9]+)*"|'[a-z0-9]+(?:-[a-z0-9]+)*')$/.test(token)) {
      throw new Error(`unsupported or malformed skill name: ${token}`);
    }
    return token.replace(/^['"]|['"]$/g, '');
  };
  value = value.replace(/\s+#.*$/, '').trim();
  if (field === 'name') return [skillName(value)];
  if (value === '' || value === 'null' || value === '~') return [];
  if (value.startsWith('[') && value.endsWith(']')) {
    const contents = value.slice(1, -1).trim();
    return contents === '' ? [] : contents.split(',').map(token => skillName(token.trim()));
  }
  if (field === 'chains-to') return [skillName(value)];
  throw new Error(`unsupported or malformed graph value: ${value}`);
}

function extractFrontmatter({ file, content }, errors) {
  const lines = content.split(/\r?\n/);
  const end = lines.indexOf('---', 1);
  const fields = new Map();
  if (lines[0] !== '---' || end < 0) {
    errors.push(`${file}: missing opening or closing frontmatter delimiter`);
    return fields;
  }
  const seen = new Set();
  let activeField;
  for (const line of lines.slice(1, end)) {
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue;
    if (/^\s/.test(line)) {
      if (tracked.has(activeField)) errors.push(`${file}: ${activeField}: unsupported block or multiline value`);
      continue;
    }
    const key = /^([A-Za-z][\w-]*):(?:[ \t]+(.*))?$/.exec(line);
    if (!key) {
      errors.push(`${file}: unsupported frontmatter key syntax: ${line}`);
      activeField = undefined;
      continue;
    }
    activeField = key[1];
    if (!tracked.has(activeField)) continue;
    if (seen.has(activeField)) {
      errors.push(`${file}: ${activeField}: duplicate tracked key`);
      continue;
    }
    seen.add(activeField);
    try {
      fields.set(activeField, parseValue(activeField, key[2] ?? ''));
    } catch (error) {
      errors.push(`${file}: ${activeField}: ${error.message}`);
    }
  }
  return fields;
}

function validateCatalog(catalog) {
  const errors = [];
  if (catalog.length === 0) errors.push('Canonical skill catalog is empty');
  const parsed = catalog.map(source => ({ ...source, fields: extractFrontmatter(source, errors) }));
  const names = new Map();
  for (const { file, directory, fields } of parsed) {
    const name = fields.get('name')?.[0];
    if (!name) {
      errors.push(`${file}: name: missing valid canonical name`);
      continue;
    }
    if (name !== directory) errors.push(`${file}: name: ${name} does not match directory ${directory}`);
    if (names.has(name)) errors.push(`${file}: name: duplicate canonical name ${name} (also ${names.get(name)})`);
    names.set(name, file);
  }
  // Build all names first so file ordering cannot break valid forward references.
  for (const { file, fields } of parsed) {
    for (const field of relations) {
      for (const target of fields.get(field) ?? []) {
        if (!names.has(target)) errors.push(`${file}: ${field}: missing canonical target ${target}`);
      }
    }
  }
  return errors;
}

const fixture = (directory, metadata = '', body = '') => ({
  file: `skills/fixtures/${directory}/SKILL.md`,
  directory,
  content: `---\nname: ${directory}\n${metadata}\n---\n${body}`,
});

test('every canonical composition target resolves to a shipped skill', () => {
  const errors = validateCatalog(discoverCatalog());
  assert.deepEqual(errors, [], errors.join('\n'));
});

test('forward references and supported graph values resolve without reading unrelated fields or bodies', () => {
  assert.deepEqual(validateCatalog([
    fixture('first', 'depends-on: ["second", third]\nchains-to: second\nsuggests: [\'third\']\ndescription: |\n  suggests: [not-a-skill]\nargs:\n  - name: input'),
    fixture('second', 'depends-on: null\nchains-to: []\nsuggests:'),
    fixture('third', 'depends-on: []\nchains-to: ~\nsuggests: null', '```yaml\nsuggests: [body-only]\n```'),
  ]), []);
});

for (const [field, target] of [
  ['depends-on', 'test-driven-development'],
  ['chains-to', 'missing-successor'],
  ['suggests', 'visual-recap'],
]) {
  test(`${field} reports its source and unresolved target`, () => {
    assert.deepEqual(validateCatalog([fixture('source', `${field}: ["${target}"]`)]), [
      `skills/fixtures/source/SKILL.md: ${field}: missing canonical target ${target}`,
    ]);
  });
}

test('all unresolved edges are reported in one run', () => {
  assert.deepEqual(validateCatalog([
    fixture('source', 'depends-on: [missing-prerequisite]\nchains-to: missing-successor\nsuggests: [missing-helper]'),
  ]), [
    'skills/fixtures/source/SKILL.md: depends-on: missing canonical target missing-prerequisite',
    'skills/fixtures/source/SKILL.md: chains-to: missing canonical target missing-successor',
    'skills/fixtures/source/SKILL.md: suggests: missing canonical target missing-helper',
  ]);
});

for (const [label, metadata, expected] of [
  ['block list', 'suggests:\n  - absent', /suggests: unsupported block/],
  ['unterminated flow list', 'depends-on: [absent', /depends-on: unsupported or malformed/],
  ['empty flow entry', 'suggests: [known,,absent]', /suggests: unsupported or malformed/],
  ['mapping value', 'chains-to: {next: absent}', /chains-to: unsupported or malformed/],
  ['anchor', 'suggests: &helpers [absent]', /suggests: unsupported or malformed/],
  ['alias', 'suggests: *helpers', /suggests: unsupported or malformed/],
  ['merge indirection', 'defaults: &helpers\n  suggests: [absent]\n<<: *helpers', /unsupported frontmatter key syntax: <</],
  ['quoted tracked key', '"suggests": [absent]', /unsupported frontmatter key syntax: "suggests"/],
  ['duplicate key', 'suggests: [absent]\nsuggests: []', /suggests: duplicate tracked key/],
]) {
  test(`${label} cannot silently bypass graph validation`, () => {
    const errors = validateCatalog([fixture('source', metadata), fixture('known')]);
    assert.match(errors.join('\n'), expected);
    if (label === 'duplicate key') {
      assert.ok(errors.includes('skills/fixtures/source/SKILL.md: suggests: missing canonical target absent'));
    }
  });
}

for (const [label, catalog, expected] of [
  ['empty catalog', [], /catalog is empty/],
  ['duplicate canonical names', [fixture('source'), { ...fixture('other'), content: '---\nname: source\n---' }], /duplicate canonical name source/],
  ['name mismatch', [{ ...fixture('source'), content: '---\nname: other\n---' }], /other does not match directory source/],
  ['missing frontmatter', [{ ...fixture('source'), content: '# Skill\nsuggests: [absent]' }], /frontmatter delimiter/],
]) {
  test(`${label} rejects an invalid canonical catalog`, () => {
    assert.match(validateCatalog(catalog).join('\n'), expected);
  });
}
