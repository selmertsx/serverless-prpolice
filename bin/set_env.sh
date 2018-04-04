#!/bin/sh -eu

rm .envrc.local
SlackToken=(`aws ssm get-parameters --names SlackToken --query "Parameters[*].{Value: Value}"  --output text`)
IAMRole=(`aws ssm get-parameters --names IAMRole --query "Parameters[*].{Value: Value}"  --output text`)

echo "export SlackToken=${SlackToken}" >> .envrc.local
echo "export IAMRole=${IAMRole}" >> .envrc.local

direnv allow
