import AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB({
  endpoint: "http://localhost:8000",
  region: "ap-north-east1"
});

const params = {
  TableName: "User",
  Item: { Id: { S: "SlackID" }, github: { S: "GitHubID" } }
};

const getParams = {
  Key: {
    Id: {
      S: "SlackID"
    }
  },
  TableName: "User"
};

/* put Item
dynamo.putItem(params, (err, data) => {
  console.log(err);
  console.log(data);
});
*/

// get Item
dynamo.getItem(getParams, (err, data) => {
  console.log(err);
  console.log(data);
});
