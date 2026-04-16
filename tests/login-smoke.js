import { group } from 'k6';
import { SharedArray } from 'k6/data';
import { login } from '../modules/authSteps.js';
import { validateLoginResponse } from '../modules/validators.js';
import { commonOptions } from '../config.js';

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
  ...commonOptions,
  tags: { feature: 'auth', env: 'production' },
};

export default function () {
  const userData = users[(__VU - 1) % users.length];

  group('@login @smoke', function () {
    const response = login(userData.user, userData.passwd);
    validateLoginResponse(response);
  });
}
