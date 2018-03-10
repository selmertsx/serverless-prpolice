import {
  APIGatewayEventRequestContext,
  APIGatewayProxyCallback,
  APIGatewayProxyEvent
} from "aws-lambda";

import { GitHub } from "./github";
import { Reporter } from "./reporter";
import { SlackClient } from "./slack_client";
import { User } from "./user";

// see: https://api.slack.com/events/url_verification
function verify(params: any, callback: APIGatewayProxyCallback) {
  const response = {
    statusCode: 200,
    headers: {
      my_header: "my_value"
    },
    body: JSON.stringify({ challenge: params.challenge }),
    isBase64Encoded: false
  };
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

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  });
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

  return callback(null, {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  });
}

function helpMessage(event: any, callback: APIGatewayProxyCallback) {
  const client = new SlackClient(event.channel);
  const helpText = `
  Usage
    @{bot_name} google account {your_account_name}
    @{bot_name} get_pr {organization} {repository}
    @{bot_name} show users
  Example
    @bot google account sample_account
    @bot get_pr selmertsx serverless-prpolice
    @bot show users
  `;

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  });

  return client.postMessage(helpText, null);
}

async function allUsers(event: any, callback: APIGatewayProxyCallback) {
  const client = new SlackClient(event.channel);
  const userNames = await User.all();
  const message = userNames.join("\n");
  callback(null, {
    statusCode: 200,
    body: JSON.stringify({ status: "ok" })
  });

  return client.postMessage(message, null);
}

export function index(
  event: APIGatewayProxyEvent,
  context: APIGatewayEventRequestContext,
  callback: APIGatewayProxyCallback
) {
  const params = JSON.parse(event.body);

  // NOTE: 暫定的な対処方法.
  const slackRetryReason = event.headers["X-Slack-Retry-Reason"];
  if (slackRetryReason === "http_timeout") {
    console.log("Ignore retrying request from Slack");
    return callback(null, { statusCode: 200, body: "ok" });
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
        default:
          return helpMessage(params.event, callback);
      }
    default:
      return callback(null, {
        statusCode: 200,
        body: JSON.stringify({ status: "ok" })
      });
  }
}
