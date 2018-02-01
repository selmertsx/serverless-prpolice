import GitHubApi from 'github';
import { resolve } from 'dns';

export class GitHub {
  _github: any;

  constructor(){
    this._github = new GitHubApi()
  }

  authenticate(){
    this._github.authenticate({
      type: 'token',
      token: process.env.TOKEN
    })
  }

  pullRequests(){
    return this._github.pullRequests.getAll({
      owner: 'selmertsx',
      repo: 'serverless-prpolice'
    })
  }
}
