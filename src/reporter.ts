import { WebClient } from "@slack/client";
import { GitHub } from "./github";
import { SlackMessage } from "./slack_message";

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

    return pullRequests.forEach(async pullRequest => {
      const slackIds: string[] = [];
      const message = new SlackMessage(pullRequest);
      if (process.env.NodeEnv === "production") {
        return await web.chat.postMessage(this.channelID, message.text);
      } else {
        return message.text;
      }
    });
  }
}
