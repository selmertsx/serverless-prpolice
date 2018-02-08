export class PullRequest {
  public readonly url: string;
  public readonly title: string;
  public readonly reviewers: string[];

  constructor(pullRequest) {
    this.url = pullRequest.url;
    this.title = pullRequest.title;
    this.reviewers = pullRequest.requested_reviewers.map(reviewer => {
      return reviewer.login;
    });
  }
}
