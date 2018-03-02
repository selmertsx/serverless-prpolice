import { GitHub } from "../src/github";
import { Reporter } from "../src/reporter";

describe("reporter", () => {
  test("get", async () => {
    const url = "https://github.com/selmertsx/serverless-prpolice";
    const repo = "serverless-prpolice";
    const owner = "selmertsx";
    const github = new GitHub(owner, repo);
    github.authenticate();
    const reporter = new Reporter(github, "SlackID");
    await expect(reporter.report()).resolves.not.toThrow();
  });
});
