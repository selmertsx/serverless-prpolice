import { WebClient } from "@slack/client";
import { GitHub } from "./github";

export class Reporter {
  private readonly apiURL = "https://slack.com/api/chat.postMessage";
  private readonly color = "#FF8822";
  private readonly github: GitHub;
  private readonly token = process.env.SlackToken;
  private readonly callback: any;
  private readonly web: WebClient;
  private readonly channelID;

  constructor(github: GitHub, callback, channelId: string) {
    this.github = github;
    this.callback = callback;
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

      web.chat.postMessage(this.channelID, text);
    });
  }
}
