import GitHubApi from "@octokit/rest";
import { resolve } from "dns";

export class GitHub {
  private readonly github: GitHubApi;
  private readonly owner: string;
  private readonly repo: string;

  constructor(owner: string, repo: string) {
    this.github = new GitHubApi();
    this.owner = owner;
    this.repo = repo;
  }

  public authenticate() {
    this.github.authenticate({
      type: "token",
      token: process.env.TOKEN
    });
  }

  public pullRequests() {
    return this.github.pullRequests.getAll({
      owner: this.owner,
      repo: this.repo
    });
  }
}
