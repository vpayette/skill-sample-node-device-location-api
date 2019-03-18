/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const messages = {
  WELCOME: 'Welcome to the Sample Device Location API Skill!  You can ask for the device location by saying what is my location.  What do you want to ask?',
  WHAT_DO_YOU_WANT: 'What do you want to ask?',
  NOTIFY_MISSING_PERMISSIONS: 'Please enable Location Services permissions in the Amazon Alexa app and try again.',
  NO_LOCATION_PERMISSION: 'It looks like your device does not support device location features. Please try the device location skill on a mobile device, or try again.',
  NO_LOCATION_AVAILABLE: 'It looks like we did not obtain your location. Please try again.',
  LOCATION_SHARING_OFF: 'I can\'t read the location from your device. Please share location for the Alexa App on your mobile device or try again.',
  ADDRESS_AVAILABLE: 'Here is your full location: ',
  ERROR: 'Uh Oh. Looks like something went wrong.',
  LOCATION_FAILURE: 'There was an error with the Device Location API. Please try again.',
  GOODBYE: 'Bye! Thanks for using the Sample Device Location API Skill!',
  UNHANDLED: 'This skill doesn\'t support that. Please ask something else.',
  HELP: 'You can use this skill by asking something like: whats my location?',
  STOP: 'Bye! Thanks for using the Sample Device Location API Skill!',
};

const PERMISSIONS = ['read::alexa:device:all:geolocation'];
//const PERMISSIONS = ['alexa::devices:all:geolocation:read'];

const LaunchRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.speak(messages.WELCOME)
      .reprompt(messages.WHAT_DO_YOU_WANT)
      .getResponse();
  },
};

const GetLocationIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'GetLocationIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, responseBuilder } = handlerInput;

    try {

      var isGeolocationSupported = requestEnvelope.context.System.device.supportedInterfaces.Geolocation;
      var geoObject = requestEnvelope.context.Geolocation;

      if (isGeolocationSupported) {   //  does the device support location based features? 
        console.log('geolocation supported');
        if (geoObject === undefined) { //check first if object is undefined
          var skillPermissionGranted = requestEnvelope.context.System.user.permissions.scopes['alexa::devices:all:geolocation:read'].status === "GRANTED";
          if (!skillPermissionGranted) {
            console.log('location services turned off on Alexa app');
            return responseBuilder
            .speak(messages.NOTIFY_MISSING_PERMISSIONS)
            .withAskForPermissionsConsentCard(PERMISSIONS)
            .getResponse();
          }
          else{
            console.log('location turned off on the device or can not read location');
            // location turned off on the device or can't read location
            return responseBuilder
            .speak(messages.LOCATION_SHARING_OFF)
            .getResponse();  
          }
        }
        else {
          if ( ! geoObject || ! geoObject.coordinate ) {
            var skillPermissionGranted = requestEnvelope.context.System.user.permissions.scopes['alexa::devices:all:geolocation:read'].status === "GRANTED";
            if (!skillPermissionGranted) {
              console.log('location services turned off on Alexa app');
              return responseBuilder
              .speak(messages.NOTIFY_MISSING_PERMISSIONS)
              .withAskForPermissionsConsentCard(PERMISSIONS)
              .getResponse();
            }
            else {
              console.log('Somehow we did not get your location');
              return responseBuilder
              .speak(messages.LOCATION_SHARING_OFF)
              .getResponse();
            }           
          }
          else {
            console.log('all looks good, we can read the location');
            const LOCATION_MESSAGE = messages.ADDRESS_AVAILABLE + ' ' + geoObject.coordinate.latitudeInDegrees + ' degrees latitude. and ' + geoObject.coordinate.longitudeInDegrees + ' degrees longitude';
            response = responseBuilder.speak(LOCATION_MESSAGE).getResponse();
            return response;
          }  
        }
      }
      else {
        console.log('device does not support location features');
        return responseBuilder
        .speak(messages.NO_LOCATION_PERMISSION)
        .getResponse();
      }      
    } catch (error) {
      if (error.name !== 'ServiceError') {
        console.log(error.name)
        const response = responseBuilder.speak(messages.ERROR).getResponse();
        return response;
      }
      throw error;
    }
  },
};

const SessionEndedRequest = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.UNHANDLED)
      .reprompt(messages.UNHANDLED)
      .getResponse();
  },
};

const HelpIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.HELP)
      .reprompt(messages.HELP)
      .getResponse();
  },
};

const CancelIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.GOODBYE)
      .getResponse();
  },
};

const StopIntent = {
  canHandle(handlerInput) {
    const { request } = handlerInput.requestEnvelope;

    return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(messages.STOP)
      .getResponse();
  },
};

const GetAddressError = {
  canHandle(handlerInput, error) {
    return error.name === 'ServiceError';
  },
  handle(handlerInput, error) {
    if (error.statusCode === 403) {
      return handlerInput.responseBuilder
        .speak(messages.NOTIFY_MISSING_PERMISSIONS)
        .withAskForPermissionsConsentCard(PERMISSIONS)
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak(messages.LOCATION_FAILURE)
      .reprompt(messages.LOCATION_FAILURE)
      .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequest,
    GetLocationIntent,
    SessionEndedRequest,
    HelpIntent,
    CancelIntent,
    StopIntent,
    UnhandledIntent,
  )
  .addErrorHandlers(GetAddressError)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();
