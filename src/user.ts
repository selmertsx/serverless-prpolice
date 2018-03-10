import AWS from "aws-sdk";

const dbParams =
  process.env.NodeEnv === "production"
    ? {}
    : { endpoint: "http://localhost:8000", region: "ap-north-east1" };

const dynamo = new AWS.DynamoDB(dbParams);
const tableName = process.env.TableName;

export class User {
  public static all(): Promise<string[]> {
    return new Promise<string[]>(resolve => {
      const scanParams = { TableName: tableName };
      dynamo.scan(scanParams, (err, data) => {
        const names = data.Items.map(item => item.id.S);
        return resolve(names);
      });
    });
  }

  public static findByGitHubAccount(account) {
    return new Promise<User>(resolve => {
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

  public static deleteGitHubAccount(account) {
    return new Promise<string>((resolve, reject) => {
      const deleteParams = {
        TableName: tableName,
        Key: {
          id: {
            S: account
          }
        }
      };

      dynamo.deleteItem(deleteParams, (err, data) => {
        if (err) {
          return reject("error");
        } else {
          return resolve("removed");
        }
      });
    });
  }

  public slackId: string;
  public githubAccount: string;

  constructor(slackId: string, githubAccount: string) {
    this.slackId = slackId;
    this.githubAccount = githubAccount;
  }

  // FIXME: async/await or Promise
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
