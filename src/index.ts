import {
  APIGatewayEventRequestContext,
  APIGatewayProxyCallback,
  APIGatewayProxyEvent
} from "aws-lambda";

import { GitHub } from "./github";
import { Reporter } from "./reporter";
import { User } from "./user";

// see: https://api.slack.com/events/url_verification
function verify(params, callback) {
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

async function report(params, callback): Promise<void> {
  const args = params.event.text.match(/get_pr\s(.*)\s(.*)/);
  const channelID = params.event.channel;
  const github = new GitHub(args[1], args[2]);
  github.authenticate();
  const reporter = new Reporter(github, channelID);
  return await reporter.report();
}

function setAccount(params, callback): void {
  const args = params.event.text.match(/github\saccount\s(.*)/);
  const channelID = params.event.channel;
  const slackID = params.event.user;
  const user = new User(slackID, args[1]);
  return user.register();
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
      if (/get_pr/.test(command)) {
        return report(params, callback);
      } else if (/github\saccount/.test(command)) {
        return setAccount(params, callback);
      }
      break;
    default:
      return callback(null, { statusCode: 200, body: "ok" });
  }
}
