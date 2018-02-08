import qs from "querystring";
import { GitHub } from "./github";
import { Reporter } from "./reporter";

const owner = process.env.Owener;

// see: https://api.slack.com/events/url_verification
export function challenge(event, context, callback) {
  callback(null, event.challenge);
}

export async function get(event, context, callback) {
  const params = qs.parse(event.body);
  const repository = params.text.toString();
  const github = new GitHub(owner, repository);
  const reporter = new Reporter(github);

  reporter.report().catch(error => {
    console.error(error, error.stack);
    callback("Command failed.", null);
  });
}
