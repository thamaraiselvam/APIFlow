function formatTableImpact(tableEntry) {
  const operations = Array.isArray(tableEntry.operations) && tableEntry.operations.length
    ? tableEntry.operations.join('/')
    : 'UNKNOWN';
  const columns = Array.isArray(tableEntry.columns) && tableEntry.columns.length
    ? ` columns: ${tableEntry.columns.join(', ')}`
    : '';
  return `${operations} ${tableEntry.table}${columns}`;
}

function buildFallbackSummary(routeData) {
  const flow = [];
  const services = Array.isArray(routeData.services) ? routeData.services : [];
  const caches = Array.isArray(routeData.caches) ? routeData.caches : [];
  const queues = Array.isArray(routeData.queues) ? routeData.queues : [];
  const tableAccess = Array.isArray(routeData.tableAccess) && routeData.tableAccess.length
    ? routeData.tableAccess
    : (routeData.tables || []).map((table) => ({ table, columns: ['*'], operations: ['UNKNOWN'] }));

  for (const tableEntry of tableAccess) {
    flow.push(formatTableImpact(tableEntry));
  }
  for (const service of services) {
    flow.push(`Calls ${service}`);
  }
  for (const cache of caches) {
    flow.push(`Uses cache ${cache}`);
  }
  for (const queue of queues) {
    flow.push(`Publishes/Consumes queue ${queue}`);
  }
  if (!flow.length) {
    flow.push('Processes request and returns response');
  }

  const tables = Array.isArray(routeData.tables) && routeData.tables.length
    ? routeData.tables
    : tableAccess.map((entry) => entry.table);

  return {
    apis: [
      {
        method: routeData.method,
        path: routeData.path,
        summary: `${routeData.method} ${routeData.path} endpoint`,
        flow,
        tables,
        services,
        caches,
        queues,
        tableAccess,
      },
    ],
  };
}

async function summarizeApi(routeData) {
  return buildFallbackSummary(routeData);
}

module.exports = { summarizeApi, buildFallbackSummary };
