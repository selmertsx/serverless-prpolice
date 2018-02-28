import { WebClient } from "@slack/client";
import { GitHub } from "./github";
import { User } from "./user";

export class Reporter {
  private readonly github: GitHub;
  private readonly token = process.env.SlackToken;
  private readonly channelID;

  constructor(github: GitHub, channelId: string) {
    this.github = github;
    this.channelID = channelId;
  }

  public async report(): Promise<void> {
    const pullRequests = await this.github.pullRequests();
    const web = new WebClient(this.token);

    return pullRequests.forEach(async pr => {
      const slackIds = pr.reviewers.map(async reviewer => {
        const user = await User.findByGitHubAccount(reviewer);
        return user.slackId;
      });

      const text = [
        `title: ${pr.title}`,
        `url: ${pr.url}`,
        `reviewers: ${slackIds.join(",")}`
      ].join("\n");

      if (process.env.NodeEnv === "production") {
        return await web.chat.postMessage(this.channelID, text);
      } else {
        return console.log(text);
      }
    });
  }
}
