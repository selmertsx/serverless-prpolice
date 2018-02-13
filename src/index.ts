import { GitHub } from "./github";
import { Reporter } from "./reporter";

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
  const github = new GitHub("selmertsx", "serverless-prpolice");
  const reporter = new Reporter(github, callback);
  return reporter.report().catch(error => {
    console.error(error, error.stack);
    callback("Command failed.", null);
  });
}

export function index(event, context, callback) {
  const params = JSON.parse(event.body);
  switch (params.type) {
    case "url_verification":
      return verify(params, callback);
    case "app_mention":
      return report(params, callback);
    default:
      return callback(`Error Occured ${params}`);
  }
}
