const test = require('node:test');
const assert = require('node:assert/strict');
const { validateApiSummary } = require('../src/engine/aiValidator');
const { buildGraph } = require('../src/engine/graphBuilder');
const { inferNextRoutePath } = require('../src/engine/metadataExtractor');
const { summarizeApi } = require('../src/engine/aiClient');
const { generateOpenCodeScanPrompt } = require('../src/engine/workflow');

test('validateApiSummary accepts schema-conform data', () => {
  const payload = {
    apis: [{
      method: 'GET',
      path: '/users',
      summary: 'Get users',
      flow: ['Read users'],
      tables: ['users'],
      services: ['axios'],
      caches: ['redis'],
      queues: ['kafka'],
    }],
  };

  assert.equal(validateApiSummary(payload), true);
});

test('buildGraph creates nodes and edges for dependencies', () => {
  const graph = buildGraph([{
    apis: [{
      method: 'GET',
      path: '/users',
      summary: 'Get users',
      flow: ['Read users'],
      tables: ['users'],
      services: ['axios'],
      caches: ['redis'],
      queues: ['kafka'],
    }],
  }]);

  assert.ok(graph.nodes.find((n) => n.type === 'api'));
  assert.ok(graph.nodes.find((n) => n.type === 'database'));
  assert.ok(graph.nodes.find((n) => n.type === 'service'));
  assert.ok(graph.nodes.find((n) => n.type === 'cache'));
  assert.ok(graph.nodes.find((n) => n.type === 'queue'));
  assert.equal(graph.edges.length, 4);
});

test('inferNextRoutePath converts app router route file to API path', () => {
  const routePath = inferNextRoutePath('/repo/src/app/api/users/[id]/route.ts');
  assert.equal(routePath, '/users/:id');
});

test('summarizeApi returns deterministic local summary', async () => {
  const summary = await summarizeApi({
    method: 'POST',
    path: '/payments',
    tables: ['payments'],
    services: ['fetch'],
    caches: [],
    queues: ['kafka'],
  });

  assert.equal(summary.apis[0].method, 'POST');
  assert.ok(summary.apis[0].flow.length > 0);
});

test('generateOpenCodeScanPrompt includes repository scan instructions', () => {
  const output = generateOpenCodeScanPrompt(process.cwd());
  assert.ok(output.fileCount > 0);
  assert.ok(output.routeCount >= 0);
  assert.match(output.prompt, /REPOSITORY_ROOT:/);
  assert.match(output.prompt, /Scan the entire repository rooted at REPOSITORY_ROOT/);
  assert.match(output.prompt, /HINT_ROUTE_METADATA_JSON:/);
});
