import {
  APIGatewayEventRequestContext,
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

import { GitHub } from "./github";
import { Reporter } from "./reporter";
import { ISlackEvent, ISlackEventCallback } from "./slack";
import { SlackClient } from "./slack_client";
import { User } from "./user";

function buildProxyResponse(statusCode: number, body?): APIGatewayProxyResult {
  return { statusCode, body: JSON.stringify(body) };
}

async function report(event: any): Promise<void> {
  const args = event.text.match(/get_pr\s(.*)\s(.*)/);
  const channelID = event.channel;
  const github = new GitHub(args[1], args[2]);
  github.authenticate();
  const reporter = new Reporter(github, channelID);
  return await reporter.pullRequestReport();
}

async function deleteAccount(event: any) {
  const args = event.text.match(/delete\saccount\s(.*)/);
  const client = new SlackClient(event.channel);
  const response = await User.deleteGitHubAccount(args[1]);
  return await client.postMessage(`${args[1]} ${response}`, null);
}

async function setAccount(event: any): Promise<void> {
  const args = event.text.match(/github\saccount\s(.*)/);
  const slackID = event.user;
  const user = new User(slackID, args[1]);
  user.register();
  const client = new SlackClient(event.channel);
  return await client.postMessage(
    `slackID: <@${slackID}>, github account: ${args[1]}`,
    null
  );
}

async function helpMessage(event: any) {
  const client = new SlackClient(event.channel);
  const helpText = `
  Usage
    @{bot_name} github account {your_account_name} # set your github account
    @{bot_name} get_pr {organization} {repository} # get pull request information
    @{bot_name} delete account {your_account_name} # delete github account from dynamodb
    @{bot_name} show users # show all github account in dynamodb
  Example
    @bot github account sample_account
    @bot get_pr selmertsx serverless-prpolice
    @bot delete account selmertsx
    @bot show users
  `;
  return await client.postMessage(helpText, null);
}

async function allUsers(event: any) {
  const client = new SlackClient(event.channel);
  const userNames = await User.all();
  const message = userNames.join("\n");
  return await client.postMessage(message, null);
}

export function index(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) {
  const payload: ISlackEvent = JSON.parse(event.body);
  if (event.headers["X-Slack-Retry-Reason"] === "http_timeout") {
    console.log("Ignore retrying request from Slack");
    return callback(null, buildProxyResponse(200, { status: "OK" }));
  }

  switch (payload.type) {
    case "url_verification":
      return callback(null, buildProxyResponse(200, payload.challenge));
    case "event_callback":
      const command = payload.event.text;
      switch (true) {
        case /get_pr/.test(command):
          report(payload.event);
          break;
        case /github\saccount/.test(command):
          setAccount(payload.event);
          break;
        case /show\susers/.test(command):
          allUsers(payload.event);
          break;
        case /delete\saccount/.test(command):
          deleteAccount(payload.event);
          break;
        default:
          helpMessage(payload.event);
          break;
      }
      return callback(null, buildProxyResponse(200, { action: command }));
    default:
      return callback(null, buildProxyResponse(200, { action: "default" }));
  }
}
