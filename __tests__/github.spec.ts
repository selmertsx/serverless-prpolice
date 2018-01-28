import { GitHub } from '../src/github'

describe('pullRequests', () => {
  it('get', () => {
    const url = "https://github.com/selmertsx/serverless-prpolice";
    const github = new GitHub();
    github.authenticate();
  });
});
