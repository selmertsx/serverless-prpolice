import { SlackMessage } from "../src/slack_message";

describe("test text function", () => {
  const testPR = {
    reviewers: ["yhatt"],
    title: "bugfix github.ts",
    url: "https://github.com/selmertsx/serverless-prpolice/pulls/1"
  };

  test("valid parameter was given", async () => {
    const message = new SlackMessage(testPR);
    const text = message.buildText();
    await expect(message.buildText()).resolves.toEqual(
      [
        "title: bugfix github.ts",
        "url: https://github.com/selmertsx/serverless-prpolice/pulls/1",
        "reviewers: <@yhatt>"
      ].join("\n")
    );
  });
});
