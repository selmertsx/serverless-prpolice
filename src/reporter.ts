import { WebClient } from "@slack/client";
import { GitHub } from "./github";
import { PullRequestMessage } from "./pull_request_message";

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
      const message = new PullRequestMessage(pullRequest);
      const attachements = await message.attachments();

      if (process.env.NodeEnv === "production") {
        return await web.chat.postMessage(this.channelID, "", {
          attachments: [attachements]
        });
      }
    });
  }
}
