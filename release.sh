#!/usr/bin/env bash
## Designed to be run from a linux or cygwin environment on Windows
## Requires AWS CLI: http://aws.amazon.com/tools/#AWS_Command_Line_Interface

packageName="imjarvis-alexa-skill"

if [ ! -d "target" ]; then
	echo "Creating Directory for the first time"
	mkdir target
fi

echo "Starting build"
echo "Remove old ${packageName}"
rm target/${packageName}.zip 2>/dev/null
chmod -R 777 *
echo "Zipping new ${packageName}"
zip -r target/${packageName}.zip * -x "target/*" ".git/*" ".gitignore" ".jshintrc/*" ".project" ".settings/*" ".tern-project" "npm-debug.log" "release.sh" "private-notes.txt" "imjarvis-alexa-skill.sublime-*"
ls -l target/${packageName}.zip

echo "Uploading... ${packageName}"
aws --region us-east-1 lambda update-function-code --function-name imjarvis-control --zip-file fileb://target/${packageName}.zip --publish
