import { User } from "../src/user";

describe("findByGitHubAccount", () => {
  beforeEach(async () => {
    const user = new User("TestSlackID", "GitHubAccountID");
    await user.register();
  });

  test("if github account ID exists", async () => {
    const data = await User.findByGitHubAccount("GitHubAccountID");
    console.log(data);
  });

  test("if github account ID doesn't exist", async () => {
    const data = await User.findByGitHubAccount("notExistID");
    console.log(data);
  });
});
