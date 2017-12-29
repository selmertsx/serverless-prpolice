import * as GitHubApi from 'github';

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

  getFollowingForUser(username){
    this._github.users.getFollowingForUser({
      username: username
    }, function(err, res){
      if(err) throw err;
      return res;
    });
  }
}
