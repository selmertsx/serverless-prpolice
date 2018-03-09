export class PullRequest {
  public readonly url: string;
  public readonly title: string;
  public readonly reviewers: string[];

  constructor(pullRequest) {
    this.url = this.toHtmlUrl(pullRequest.url);
    this.title = pullRequest.title;
    this.reviewers = pullRequest.requested_reviewers.map(reviewer => {
      return reviewer.login;
    });
  }
  // NOTE:
  // I think that using `html_safe` params better.
  // But if getting `html_safe` params, it calls html request many times.
  // https://octokit.github.io/rest.js/#api-PullRequests-get
  private toHtmlUrl(apiUrl: string): string {
    return apiUrl
      .replace(/api\./, "")
      .replace(/\/pulls\//, "/pull/")
      .replace(/repos\//, "");
  }
}
