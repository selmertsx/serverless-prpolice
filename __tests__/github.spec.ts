import { GitHub } from "../src/github";

describe("pullRequests", () => {
  it("get", async () => {
    const url = "https://github.com/selmertsx/serverless-prpolice";
    const repo = "serverless-prpolice";
    const owner = "selmertsx";
    const github = new GitHub(owner, repo);
    github.authenticate();
    const pullRequests = await github.pullRequests();
    expect(pullRequests.data[0].url).toEqual(
      "https://api.github.com/repos/selmertsx/serverless-prpolice/pulls/1"
    );
  });
});
