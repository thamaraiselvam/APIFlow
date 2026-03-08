const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { parseArgs, main, findRepositoryRoot } = require('../src/cli');

test('parseArgs supports --key=value format', () => {
  const { positional, options } = parseArgs(['.']);

  assert.deepEqual(positional, ['.']);
  assert.deepEqual(options, {});
});

test('parseArgs rejects legacy AI provider flags', () => {
  assert.throws(() => parseArgs(['--provider', 'openai']), /Unknown option/);
  assert.throws(() => parseArgs(['--ai-provider', 'openai']), /Unknown option/);
});

test('parseArgs fails fast for unknown options', () => {
  assert.throws(() => parseArgs(['--foo', 'bar']), /Unknown option/);
});

test('main rejects extra positional args with npm forwarding hint', async () => {
  const previousArgv = process.argv;
  try {
    process.argv = ['node', 'cli.js', 'scan', '.', 'openai'];

    await assert.rejects(
      () => main(),
      /Too many positional arguments: openai[\s\S]*npm run scan -- \./,
    );
  } finally {
    process.argv = previousArgv;
  }
});

test('findRepositoryRoot resolves nearest git root for nested paths', () => {
  const nestedPath = path.join(process.cwd(), 'src', 'engine');
  const resolved = findRepositoryRoot(nestedPath);
  assert.equal(resolved, process.cwd());
});
