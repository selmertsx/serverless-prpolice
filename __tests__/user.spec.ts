import { User } from "../src/user";

describe("findByGitHubAccount", () => {
  beforeEach(async () => {
    const user = new User("TestSlackID", "GitHubAccountID");
    await user.register();
  });

  test("if github account ID exists", async () => {
    const user = await User.findByGitHubAccount("GitHubAccountID");
    expect(user.slackId).toEqual("TestSlackID");
  });

  test("if github account ID doesn't exist", async () => {
    const user = await User.findByGitHubAccount("notExistID");
    expect(user).toBeNull();
  });

  test("scan all account", async () => {
    const accounts = await User.all();
    expect(accounts).toEqual(["GitHubAccountID"]);
  });
});
