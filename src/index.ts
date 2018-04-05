import {
  APIGatewayEventRequestContext,
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

import { GitHub } from "./github";
import { Reporter } from "./reporter";
import { SlackClient } from "./slack_client";
import { User } from "./user";

function buildProxyResponse(status: number, body?): APIGatewayProxyResult {
  return { statusCode: status, body: JSON.stringify(body) };
}

// see: https://api.slack.com/events/url_verification
function verify(params: any, callback: APIGatewayProxyCallback) {
  const response = buildProxyResponse(200, params.challenge);
  return callback(null, response);
}

async function report(
  event: any,
  callback: APIGatewayProxyCallback
): Promise<void> {
  const args = event.text.match(/get_pr\s(.*)\s(.*)/);
  const channelID = event.channel;
  const github = new GitHub(args[1], args[2]);
  github.authenticate();
  const reporter = new Reporter(github, channelID);
  await reporter.pullRequestReport();
  return callback(null, buildProxyResponse(200, { status: "OK" }));
}

async function deleteAccount(event: any, callback: APIGatewayProxyCallback) {
  const args = event.text.match(/delete\saccount\s(.*)/);
  const client = new SlackClient(event.channel);
  const response = await User.deleteGitHubAccount(args[1]);
  await client.postMessage(`${args[1]} ${response}`, null);
  return callback(null, buildProxyResponse(200, { status: "OK" }));
}

async function setAccount(
  event: any,
  callback: APIGatewayProxyCallback
): Promise<void> {
  const args = event.text.match(/github\saccount\s(.*)/);
  const slackID = event.user;
  const user = new User(slackID, args[1]);
  user.register();
  const client = new SlackClient(event.channel);
  await client.postMessage(
    `slackID: <@${slackID}>, github account: ${args[1]}`,
    null
  );
  return callback(null, buildProxyResponse(200, { status: "OK" }));
}

function helpMessage(event: any, callback: APIGatewayProxyCallback) {
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
  callback(null, buildProxyResponse(200, { status: "OK" }));
  return client.postMessage(helpText, null);
}

async function allUsers(event: any, callback: APIGatewayProxyCallback) {
  const client = new SlackClient(event.channel);
  const userNames = await User.all();
  const message = userNames.join("\n");
  callback(null, buildProxyResponse(200, { status: "OK" }));
  return client.postMessage(message, null);
}

export function index(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) {
  const params = JSON.parse(event.body);
  if (event.headers["X-Slack-Retry-Reason"] === "http_timeout") {
    console.log("Ignore retrying request from Slack");
    return callback(null, buildProxyResponse(200, { status: "OK" }));
  }

  switch (params.type) {
    case "url_verification":
      return verify(params, callback);
    case "event_callback":
      const command = params.event.text;
      switch (true) {
        case /get_pr/.test(command):
          return report(params.event, callback);
        case /github\saccount/.test(command):
          return setAccount(params.event, callback);
        case /show\susers/.test(command):
          return allUsers(params.event, callback);
        case /delete\saccount/.test(command):
          return deleteAccount(params.event, callback);
        default:
          return helpMessage(params.event, callback);
      }
    default:
      return callback(null, buildProxyResponse(200, { status: "OK" }));
  }
}
