export class PullRequest {
  private readonly github: any;
  private readonly repository: string;

  constructor(github, repository){
    this.github = github;
    this.repository = repository;
  }
}
