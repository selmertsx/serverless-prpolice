import * as request from "request";
import { GitHub } from "./github";

export class Reporter {
  private readonly apiURL = "https://slack.com/api/chat.postMessage";
  private readonly channel = process.env.Channel;
  private readonly color = "#FF8822";
  private readonly github: GitHub;
  private readonly token = process.env.SlackToken;

  constructor(github: GitHub) {
    this.github = github;
  }

  public async report(): Promise<void> {
    const pullRequests = await this.github.pullRequests();
    pullRequests.forEach(pr => {
      const textData = {
        title: pr.title,
        text: pr.reviewers.join(","),
        color: this.color
      };

      const formData = {
        form: {
          token: this.token,
          channel: this.channel,
          text: textData
        }
      };

      request.post(this.apiURL, formData);
    });
  }
}
