import { User } from "./user";

export class PullRequestMessage {
  private readonly reviewers: any;
  private readonly title: string;
  private readonly url: string;

  constructor(pullRequest: any) {
    this.reviewers = pullRequest.reviewers;
    this.title = pullRequest.title;
    this.url = pullRequest.url;
  }

  public async attachments(): Promise<object> {
    const reviewers = await this.fetchReviewerSlackId();
    return {
      title: this.title,
      title_link: this.url,
      text: reviewers
    };
  }

  public async fetchReviewerSlackId(): Promise<string> {
    const slackIds: string[] = [];
    for (const reviewer of this.reviewers) {
      const user = await User.findByGitHubAccount(reviewer);
      const slackId = user === null ? reviewer : user.slackId;
      slackIds.push(`<@${slackId}>`);
    }
    return `reviewers: ${slackIds.join(",")}`;
  }
}
