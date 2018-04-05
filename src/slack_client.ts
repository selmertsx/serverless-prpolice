import { WebClient } from "@slack/client";

export class SlackClient {
  private readonly channelID: string;
  private readonly token = process.env.SLACK_TOKEN;

  constructor(channelID: string) {
    this.channelID = channelID;
  }

  public postMessage(message: string, attachements: any) {
    const client = new WebClient(this.token);
    client.chat.postMessage(this.channelID, message, {
      attachments: [attachements]
    });
  }
}
