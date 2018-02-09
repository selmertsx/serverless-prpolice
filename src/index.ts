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
  callback(null, response);
}

export async function report(params, callback) {
  const repository = params.text.toString();
  const github = new GitHub("selmertsx", repository);
  const reporter = new Reporter(github);
  reporter.report().catch(error => {
    console.error(error, error.stack);
    callback("Command failed.", null);
  });
}

export function index(event, context, callback) {
  const params = JSON.parse(event.body);
  switch (params.type) {
    case "url_verification":
      verify(params, callback);
      break;
    case "app_mention":
      report(params, callback);
      break;
    default:
      callback(`Error Occured ${params}`);
  }
}
