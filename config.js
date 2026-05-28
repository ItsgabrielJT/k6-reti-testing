export const API_BASE_URL = __ENV.API_BASE_URL || 'https://fakestoreapi.com';

export const smokeOptions = {
  scenarios: {
    smoke: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 5,
      maxDuration: '10s',
    },
  },
  summaryTrendStats: ['min', 'avg', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.01'],
    iteration_duration: ['p(95)<1500', 'p(99)<3000'],
  },
};

export const loadOptions = {
  scenarios: {
    load: {
      executor: 'constant-arrival-rate',
      rate: 21,
      timeUnit: '1s',
      duration: '50s',
      preAllocatedVUs: 20,
      maxVUs: 60,
    },
  },
  summaryTrendStats: ['min', 'avg', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    http_req_failed: ['rate<0.03'],
    http_reqs: ['rate>20'],
    iteration_duration: ['p(95)<1500', 'p(99)<3000'],
  },
};

export const DEFAULTS = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-api-testing/1.0',
  },
  timeout: 30000,
};
