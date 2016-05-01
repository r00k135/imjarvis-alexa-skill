# imjarvis-alexa-skill
Alexa Skill to Query Home Systems - Implemented in NodeJS

```
                     Firewall
                     +
                     |
                     |       +--+
                     |       |  |
    +------------------------+  |  Amazon
    |                |       |  |  Echo
+---v----+           |       |  |
| Alexa  |           |       +--+
|  AWS   |           |
| Lambda |           |
|        |           |       +---------+          +------------+
+---+----+           |       |         |          |            |
    |                |       | Reverse |          |            |
    +------------------------>  Proxy  +---------->  imjarvis  |
                     |       |         |          |            |
                     |       |         |          |            |
                     |       +---------+          +------------+
                     |
                     + Reverse Proxy Maps /<randomURL> to / on imjarvis

```


## Functions Implemented

Alexa, ask Kodi:

* whats the temperature outside - ask imjarvis what the outside temperature is

## Install
Download latest code from github
> git clone https://github.com:r00k135/imjarvis-alexa-skill.git

Create an override file called: *imjarvis-alexa-skill-override.json*, use the following format and replace the defaults with your actual values so lamdba can access your imjarvis server:
```
{
	"imjarvisApiHost" : "<ip or dynamicDNS host name>",
	"imjarvisApiPort" : <HTTP Port Number - no speech marks needed>,
	"imjarvisApiPath" : "/<randomURL from Reverse Proxy>/jsonrpc",
	"applicationId" : "<applicationId>"
}
```

Ensure that you have the AWS Command Line Tools (CLI) configured (http://aws.amazon.com/tools/#AWS_Command_Line_Interface) with an IAM user who can update lambda function.

Create Lambda Function, as described here, called *imjarvis-control*: https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/deploying-a-sample-skill-to-aws-lambda#Creating%20the%20Lambda%20Function%20for%20the%20Sample

In order to build your zip file and upload, run the release.sh script:
> ./release.sh

## imjarvis API
* Get Active Players
  > curl -s --data-binary '{"jsonrpc": "2.0", "method": "Player.GetActivePlayers", "id": 1}' -H 'content-type: application/json;' http://localhost/jsonrpc


## Appendix A: References

* https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/alexa-skills-kit-interface-reference
* https://developer.amazon.com/appsandservices/solutions/alexa/alexa-skills-kit/docs/defining-the-voice-interface
* https://www.npmjs.com/package/double-metaphone
* https://github.com/robnewton/JSON-RPC-Browser