import AWS from "aws-sdk";

const dbParams =
  process.env.NodeEnv === "production"
    ? {}
    : { endpoint: "http://localhost:8000", region: "ap-north-east1" };

const dynamo = new AWS.DynamoDB(dbParams);
const tableName = process.env.TableName;

export class User {
  public static findByGitHubAccount(account) {
    return new Promise<any>(resolve => {
      const getParams = {
        TableName: tableName,
        Key: {
          id: {
            S: account
          }
        }
      };

      dynamo.getItem(getParams, (err, data) => {
        if (data.Item === undefined) {
          return resolve(null);
        }
        const user = new User(data.Item.slackId.S, data.Item.id.S);
        return resolve(user);
      });
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
        id: {
          S: this.githubAccount
        },
        slackId: {
          S: this.slackId
        }
      }
    };

    dynamo.putItem(record, (err, data) => {
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
