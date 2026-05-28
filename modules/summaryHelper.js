const MS_THRESHOLD = 1000;

function formatDuration(ms) {
  if (ms === undefined || ms === null) return 'N/A';
  return ms >= MS_THRESHOLD
    ? `${(ms / MS_THRESHOLD).toFixed(3)}s`
    : `${ms.toFixed(2)}ms`;
}

function formatRate(rate) {
  if (rate === undefined || rate === null) return 'N/A';
  return `${(rate * 100).toFixed(2)}%`;
}

function formatCount(value) {
  return value !== undefined && value !== null ? String(value) : 'N/A';
}

function trendSection(label, values) {
  return [
    `── ${label}`,
    `   Mínimo   : ${formatDuration(values.min)}`,
    `   Promedio : ${formatDuration(values.avg)}`,
    `   Mediana  : ${formatDuration(values.med)}`,
    `   p(90)    : ${formatDuration(values['p(90)'])}`,
    `   p(95)    : ${formatDuration(values['p(95)'])}`,
    `   p(99)    : ${formatDuration(values['p(99)'])}`,
    `   Máximo   : ${formatDuration(values.max)}`,
  ].join('\n');
}

export function generateSummary(data) {
  const httpDuration = data.metrics['http_req_duration']?.values ?? {};
  const iterDuration = data.metrics['iteration_duration']?.values ?? {};
  const httpReqs     = data.metrics['http_reqs']?.values ?? {};
  const httpFailed   = data.metrics['http_req_failed']?.values ?? {};
  const checks       = data.metrics['checks']?.values ?? {};

  const checkRate    = checks.rate ?? 0;
  const checkPasses  = formatCount(checks.passes);
  const checkFails   = formatCount(checks.fails);
  const errorRate    = httpFailed.rate ?? 0;
  const tps          = (httpReqs.rate ?? 0).toFixed(4);
  const totalReqs    = formatCount(httpReqs.count);

  const separator = '═══════════════════════════════════════════════════════';

  const lines = [
    separator,
    '  RESUMEN DE EJECUCIÓN — AUTENTICACIÓN LOGIN',
    separator,
    '',
    trendSection('Latencia de petición HTTP  (http_req_duration)', httpDuration),
    '',
    trendSection('Latencia de iteración      (iteration_duration)', iterDuration),
    '',
    '── Throughput y errores',
    `   TPS (peticiones/s)  : ${tps}/s  (umbral: >20 TPS)`,
    `   Total peticiones    : ${totalReqs}`,
    `   Tasa de error HTTP  : ${formatRate(errorRate)}  (umbral: <3.00%)`,
    '',
    '── Validaciones (checks)',
    `   Exitosas : ${checkPasses}  (${formatRate(checkRate)})`,
    `   Fallidas : ${checkFails}`,
    '',
    separator,
  ];

  return lines.join('\n');
}
