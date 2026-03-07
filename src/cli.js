#!/usr/bin/env node
const path = require('path');
const { ensureCacheDir } = require('./engine/cache');
const { scanRepository } = require('./engine/workflow');
const { createServer } = require('./server');

const OPTION_ALIASES = {
  'ai-provider': 'aiProvider',
  provider: 'aiProvider',
  'api-provider': 'aiProvider',
  'ai-token': 'aiToken',
  token: 'aiToken',
  'api-key': 'aiToken',
  'ai-model': 'aiModel',
  model: 'aiModel',
  'ai-base-url': 'aiBaseUrl',
  'base-url': 'aiBaseUrl',
};

function printUsage() {
  console.log(`Usage: apimap <init|scan|serve> [path] [options]

Options (scan):
  --ai-provider <mock|openai>   AI provider (default: mock)
  --ai-token <token>            API token (for openai)
  --ai-model <model>            Model name (default: gpt-4o-mini)
  --ai-base-url <url>           Override chat completions endpoint

Also accepts aliases: --provider, --api-provider, --token, --api-key, --model, --base-url.

Environment fallbacks:
  APIMAP_AI_PROVIDER, APIMAP_AI_TOKEN, APIMAP_AI_MODEL, OPENAI_API_KEY, OPENAI_BASE_URL, AI_PROVIDER, AI_API_KEY, AI_MODEL, AI_BASE_URL
`);
}

function parseArgs(argv) {
  const options = {};
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const [rawKey, inlineValue] = arg.slice(2).split(/=(.*)/s, 2);
    const optionKey = OPTION_ALIASES[rawKey];
    if (!optionKey) {
      throw new Error(`Unknown option: --${rawKey}`);
    }

    let value = inlineValue;
    if (value === undefined) {
      const next = argv[i + 1];
      if (!next || next.startsWith('--')) {
        throw new Error(`Missing value for --${rawKey}`);
      }
      value = next;
      i += 1;
    }

    options[optionKey] = value;
  }

  return { positional, options };
}

async function main() {
  const [, , command, ...rest] = process.argv;

  if (!command) {
    printUsage();
    process.exit(1);
  }

  const { positional, options } = parseArgs(rest);
  const argPath = positional[0];
  const targetPath = path.resolve(argPath || '.');

  if (command === 'init') {
    ensureCacheDir(targetPath);
    console.log(`Initialized .apimap cache at ${targetPath}`);
    return;
  }

  if (command === 'scan') {
    const result = await scanRepository(targetPath, options);
    console.log('Scan completed successfully.');
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === 'serve') {
    const app = createServer(targetPath);
    const port = process.env.PORT || 3789;
    app.listen(port, () => {
      console.log(`APIMap server listening at http://localhost:${port}`);
    });
    return;
  }

  printUsage();
  process.exit(1);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`apimap failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { parseArgs, main, OPTION_ALIASES };
