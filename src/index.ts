import { GitHub } from "./github";
import { Reporter } from "./reporter";
import { User } from "./user";

// see: https://api.slack.com/events/url_verification
export function verify(params, callback) {
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

export async function report(params, callback): Promise<void> {
  const args = params.event.text.match(/get_pr\s(.*)\s(.*)/);
  const channelID = params.event.channel;
  const github = new GitHub(args[1], args[2]);
  github.authenticate();
  const reporter = new Reporter(github, callback, channelID);
  return reporter
    .report()
    .then(() => {
      callback(null, "pull request checked!!");
    })
    .catch(error => {
      console.error(error, error.stack);
      callback("Command failed.", null);
    });
}

export async function setAccount(params, callback): Promise<void> {
  const args = params.event.text.match(/github\saccount\s(.*)/);
  const channelID = params.event.channel;
  const slackID = params.event.user;
  const user = new User(slackID, args[1]);
}

export function index(event, context, callback) {
  const params = JSON.parse(event.body);
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
      return callback(`Error Occured ${params}`);
  }
}
