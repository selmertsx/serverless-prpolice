import { User } from "./user";

export class SlackMessage {
  private readonly reviewers: any;
  private readonly title: string;
  private readonly url: string;

  constructor(pullRequest: any) {
    this.reviewers = pullRequest.reviewers;
    this.title = pullRequest.title;
    this.url = pullRequest.url;
  }

  public async buildText(): Promise<string> {
    const slackIds: string[] = [];
    for (const reviewer of this.reviewers) {
      const user = await User.findByGitHubAccount(reviewer);
      const slackId = user === null ? reviewer : user.slackId;
      slackIds.push(`<@${slackId}>`);
    }

    return [
      `title: ${this.title}`,
      `url: ${this.url}`,
      `reviewers: ${slackIds.join(",")}`
    ].join("\n");
  }
}
