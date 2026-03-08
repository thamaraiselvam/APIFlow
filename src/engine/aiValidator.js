function validateApiSummary(summary) {
  if (!summary || typeof summary !== 'object' || !Array.isArray(summary.apis)) {
    throw new Error('Invalid AI output: missing apis array');
  }

  for (const api of summary.apis) {
    const required = ['method', 'path', 'summary', 'flow', 'tables', 'services', 'caches', 'queues'];
    for (const field of required) {
      if (!(field in api)) {
        throw new Error(`Invalid AI output: missing field ${field}`);
      }
    }

    const arrayFields = ['flow', 'tables', 'services', 'caches', 'queues'];
    for (const field of arrayFields) {
      if (!Array.isArray(api[field])) {
        throw new Error(`Invalid AI output: field ${field} must be array`);
      }
    }

    if ('tableAccess' in api) {
      if (!Array.isArray(api.tableAccess)) {
        throw new Error('Invalid AI output: field tableAccess must be array');
      }

      for (const entry of api.tableAccess) {
        if (!entry || typeof entry !== 'object' || !entry.table) {
          throw new Error('Invalid AI output: each tableAccess entry must include table');
        }

        if ('columns' in entry && !Array.isArray(entry.columns)) {
          throw new Error('Invalid AI output: tableAccess.columns must be array');
        }

        if ('operations' in entry && !Array.isArray(entry.operations)) {
          throw new Error('Invalid AI output: tableAccess.operations must be array');
        }
      }
    }
  }

  return true;
}

module.exports = { validateApiSummary };
