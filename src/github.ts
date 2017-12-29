import GitHubApi from 'github';

export class GitHub {
  private readonly _github: any;

  constructor(){
    this._github = new GitHubApi()
  }

  // TODO: use user token
  authenticate(){
    this._github.authenticate({
      type: 'token',
      token: process.env.TOKEN
    })
  }

  pullRequests(url){
    return this._github.pullRequests.getAll({
      owner: 'selmertsx',
      repo: url
    });
  }
}
