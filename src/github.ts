import GitHubApi from "@octokit/rest";
import { resolve } from "dns";

export class GitHub {
  private readonly github: any;

  constructor() {
    this.github = new GitHubApi();
  }

  public authenticate() {
    this.github.authenticate({
      type: "token",
      token: process.env.TOKEN
    });
  }

  public pullRequests() {
    return this.github.pullRequests.getAll({
      owner: "selmertsx",
      repo: "serverless-prpolice"
    });
  }
}
