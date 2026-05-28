import { group } from 'k6';
import { SharedArray } from 'k6/data';
import { login } from '../modules/authSteps.js';
import { validateLoginResponse } from '../modules/validators.js';
import { loadOptions } from '../config.js';
import { generateSummary } from '../modules/summaryHelper.js';

const users = new SharedArray('users', function () {
  return open('../data/users.csv')
    .trim()
    .split('\n')
    .slice(1)
    .map((line) => {
      const [user, passwd] = line.split(',');
      return { user: user.trim(), passwd: passwd.trim() };
    });
});

export const options = {
  ...loadOptions,
  tags: { feature: 'auth', env: 'load' },
};

export default function () {
  const userData = users[(__VU - 1) % users.length] || users[0];

  group('@login @load', function () {
    const response = login(userData.user, userData.passwd);
    validateLoginResponse(response);
  });
}

export function handleSummary(data) {
  return { stdout: generateSummary(data) };
}
