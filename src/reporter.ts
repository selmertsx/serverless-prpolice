import { WebClient } from "@slack/client";
import { GitHub } from "./github";

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
      const text = [
        `title: ${pr.title}`,
        `url: ${pr.url}`,
        `reviewers: ${pr.reviewers.join(",")}`
      ].join("\n");

      await web.chat.postMessage(this.channelID, text);
    });
  }
}
