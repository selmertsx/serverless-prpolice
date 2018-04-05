import { GitHub } from "./github";
import { PullRequestMessage } from "./pull_request_message";
import { SlackClient } from "./slack_client";

export class Reporter {
  private readonly github: GitHub;
  private readonly channelID;

  constructor(github: GitHub, channelId: string) {
    this.github = github;
    this.channelID = channelId;
  }

  public async pullRequestReport(): Promise<void> {
    const pullRequests = await this.github.pullRequests();
    return pullRequests.forEach(async pullRequest => {
      const slackIds: string[] = [];
      const message = new PullRequestMessage(pullRequest);
      const attachements = await message.attachments();

      if (process.env.NODE_ENV === "production") {
        const client = new SlackClient(this.channelID);
        return await client.postMessage("", attachements);
      }
    });
  }
}
