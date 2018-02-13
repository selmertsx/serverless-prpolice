import { WebClient } from "@slack/client";
import { GitHub } from "./github";

export class Reporter {
  private readonly apiURL = "https://slack.com/api/chat.postMessage";
  private readonly channel = "C8B7J7XJA";
  private readonly color = "#FF8822";
  private readonly github: GitHub;
  private readonly token = process.env.SlackToken;
  private readonly callback: any;
  private readonly web: WebClient;

  constructor(github: GitHub, callback) {
    this.github = github;
    this.callback = callback;
  }

  public async report(): Promise<void> {
    const pullRequests = await this.github.pullRequests();
    const web = new WebClient(this.token);

    return pullRequests.forEach(async pr => {
      const text = `
      title: ${pr.title}
      reviewers: ${pr.reviewers.join(",")}
      `;
      web.chat.postMessage(this.channel, text);
    });
  }
}
