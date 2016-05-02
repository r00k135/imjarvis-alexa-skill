//********************************
// Name: imjarvis-alexa-skill.js
//********************************

//Imports
var http = require('http');
var fs = require('fs');
var doubleMetaphone = require('double-metaphone');

// Kodi JSONRPC URL
var imjarvisApiHost = "<ip or dynamicDNS host name>";
var imjarvisApiPort = 80;
var imjarvisApiPath = "/<randomURL from Reverse Proxy>/jsonrpc";
// Alexa Application Id
var applicationId = "<applicationId>";
// Load Overrides File - Blocking
var overrides = JSON.parse(fs.readFileSync('imjarvis-alexa-skill-override.json', 'utf8'));
if (overrides) {
    imjarvisApiHost = overrides.imjarvisApiHost;
    imjarvisApiPort = overrides.imjarvisApiPort;
    imjarvisApiPath = overrides.imjarvisApiPath;
    applicationId = overrides.applicationId;
}


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app."+applicationId) {
             context.fail("Invalid Application ID");
        }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("TempQueryIntent" === intentName) {
        tempQueryIMJarvis(intent, session, callback);
    } else if ("StartComputerIntent" === intentName) {
        StartComputerIMJarvis(intent, session, callback);    
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "What would you like the Jarvis to do, you can query the outside temperature";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "What would you jarvis to do";
    var shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}


/**
 * Asks IMJarvis Whats The Outside Temperature.
 */
function tempQueryIMJarvis(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    var options = { host: imjarvisApiHost, port: imjarvisApiPort, path: imjarvisApiPath+"/temp/outside.py", method: 'POST', headers: { 'Content-Type': 'application/json' } };
    console.log('HTTP OPTIONS: ' + JSON.stringify(options));

    var post_data = '{}';
    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode); console.log('HEADERS: ' + JSON.stringify(res.headers)); console.log('DATA: ' + post_data);
      if (res.statusCode == 200 ) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            var response_json = JSON.parse(chunk);
            if ( response_json.scale ) {
                speechOutput = "Jarvis reports that the outside temperature is " + response_json.temp + " " +response_json.scale;
            } else {
               speechOutput = "Jarvis doesn't know the outside temperature";
            }
            repromptText = "";
            callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
          });
    }
    else {
        speechOutput = "Jarvis couldn't be contacted";
        repromptText = "";
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    });
    req.write(post_data);
    req.end();
}


/**
 * Asks IMJarvis Whats The Outside Temperature.
 */
function StartComputerIMJarvis(intent, session, callback) {
    var cardTitle = intent.name;
    var OwnerNameSlot = intent.slots.OwnerName;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    if (OwnerNameSlot.value) {
        console.log('OwnerNameSlot Value: ' + OwnerNameSlot.value);
        var options = { host: imjarvisApiHost, port: imjarvisApiPort, path: imjarvisApiPath+"/wol/turnon.py?computer="+OwnerNameSlot.value, method: 'GET', headers: { 'Content-Type': 'application/json' } };
        console.log('HTTP OPTIONS: ' + JSON.stringify(options));

        var post_data = '{}';
        var req = http.request(options, function(res) {
          console.log('STATUS: ' + res.statusCode); console.log('HEADERS: ' + JSON.stringify(res.headers)); console.log('DATA: ' + post_data);
          if (res.statusCode == 200 ) {
              res.setEncoding('utf8');
              res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                var response_json = JSON.parse(chunk);
                if ( response_json.result ) {
                    speechOutput = "Jarvis reports " + response_json.result;
                } else {
                   speechOutput = "Jarvis didn't respond";
                }
                repromptText = "";
                callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
              });
        }
        else {
            speechOutput = "Jarvis couldn't be contacted";
            repromptText = "";
            callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
        }
        });
        req.write(post_data);
        req.end();
    }
    else {
        console.log('OwnerNameSlot Not Set');
        shouldEndSession = false;
        speechOutput = "Which owners computer would you like to start";
        repromptText = "Which owners computer would you like to start. You can tell the owner to start by saying, start chris's computer";
        callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }

}



// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
