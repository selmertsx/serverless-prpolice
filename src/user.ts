import AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TableName;

export class User {
  public static async findByGitHubAccount(account) {
    const params = {
      TableName: tableName,
      Key: {
        id: account
      }
    };

    return await dynamo.get(params, (err, data) => {
      return data;
    });
  }

  public slackId: string;
  public githubAccount: string;

  constructor(slackId: string, githubAccount: string) {
    this.slackId = slackId;
    this.githubAccount = githubAccount;
  }

  public register() {
    const record = {
      TableName: tableName,
      Item: {
        id: this.githubAccount,
        thing: this.slackId
      }
    };

    dynamo.put(record, (err, data) => {
      if (err) {
        console.error(
          "Unable to add device. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        console.log("Added device:", JSON.stringify(data, null, 2));
      }
    });
  }
}
