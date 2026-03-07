const test = require('node:test');
const assert = require('node:assert/strict');
const { parseArgs } = require('../src/cli');

test('parseArgs supports --key=value format', () => {
  const { positional, options } = parseArgs([
    '.',
    '--ai-provider=openai',
    '--ai-token=abc123',
    '--ai-model=gpt-4o-mini',
  ]);

  assert.deepEqual(positional, ['.']);
  assert.equal(options.aiProvider, 'openai');
  assert.equal(options.aiToken, 'abc123');
  assert.equal(options.aiModel, 'gpt-4o-mini');
});

test('parseArgs supports short aliases used in CLI', () => {
  const { options } = parseArgs([
    '--provider', 'openai',
    '--api-key', 'abc123',
    '--model', 'gpt-4o-mini',
    '--base-url', 'https://api.openai.com/v1/chat/completions',
  ]);

  assert.equal(options.aiProvider, 'openai');
  assert.equal(options.aiToken, 'abc123');
  assert.equal(options.aiModel, 'gpt-4o-mini');
  assert.equal(options.aiBaseUrl, 'https://api.openai.com/v1/chat/completions');
});

test('parseArgs fails fast for unknown options', () => {
  assert.throws(() => parseArgs(['--foo', 'bar']), /Unknown option/);
});
