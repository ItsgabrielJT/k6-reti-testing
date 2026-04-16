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
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.01'], 
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
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.03'],
    http_reqs: ['rate>20'],
  },
};

export const DEFAULTS = {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'k6-api-testing/1.0',
  },
  timeout: 30000,
};
