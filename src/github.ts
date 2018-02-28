import GitHubApi from "@octokit/rest";
import { PullRequest } from "./pull_request";

export class GitHub {
  private readonly github: any;
  private readonly owner: string;
  private readonly repo: string;

  constructor(owner: string, repo: string) {
    this.github = new GitHubApi();
    this.owner = owner;
    this.repo = repo;
  }

  public authenticate(): void {
    return this.github.authenticate({
      type: "token",
      token: process.env.Token
    });
  }

  public async pullRequests(): Promise<PullRequest[]> {
    const requests = await this.github.pullRequests.getAll({
      owner: this.owner,
      repo: this.repo,
      state: "open"
    });
    return requests.data.map(pr => new PullRequest(pr));
  }
}
