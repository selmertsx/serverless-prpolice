import GitHubApi from 'github';

export class GitHub {
  private readonly _github: any;

  constructor(){
    this._github = new GitHubApi()
  }

  authenticate(){
    this._github.authenticate({
      type: 'token',
      token: process.env.TOKEN
    })
  }

  async pullRequests(url){
    await this._github.pullRequests.getAll({
      owner: 'selmertsx',
      repo: 'serverless-prpolice'
    })
  }
}
