const Alexa = require('ask-sdk-core');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Configure this to match the hardcoded session ID from app/page.tsx
const KIOSK_SESSION_ID = 'kiosk-session-001';
// The local Next.js endpoint
const NEXTJS_API_ENDPOINT = 'http://127.0.0.1:3000/api/voice-search';

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to Omni Retail Future Store. How can I help you today?';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const FindProductIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'FindProductIntent';
    },
    async handle(handlerInput) {
        const slots = handlerInput.requestEnvelope.request.intent.slots;
        const query = slots.query && slots.query.value ? slots.query.value : '';

        if (!query) {
             return handlerInput.responseBuilder.speak("I didn't quite catch what you were looking for.").getResponse();
        }

        try {
            // Forward the query to the OmniRetail Next.js Backend
            const res = await axios.post(NEXTJS_API_ENDPOINT, {
                sessionId: KIOSK_SESSION_ID,
                query: query
            });

            let speakOutput = `I found some ${query} for you. Checking the display now.`;
            if (res.data && res.data.matchedProduct) {
                speakOutput = `I've highlighted the ${res.data.matchedProduct.name} on the screen for you in aisle ${res.data.matchedProduct.location.aisle}.`;
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } catch (error) {
            console.error("Error connecting to Next.js API:", error.message);
            return handlerInput.responseBuilder
                .speak('Sorry, I am having trouble communicating with the store network right now.')
                .getResponse();
        }
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Sorry, I had trouble doing what you asked. Please try again.`;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Setup the Skill
const skillBuilder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        FindProductIntentHandler,
        CancelAndStopIntentHandler
    )
    .addErrorHandlers(ErrorHandler);

const skill = skillBuilder.create();

// Create an Express Server to host the skill endpoint
const app = express();
app.use(bodyParser.json());

app.post('/', async (req, res) => {
    try {
        const response = await skill.invoke(req.body);
        res.send(response);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error invoking skill');
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Alexa Skill webhook listening at http://localhost:${PORT}`);
});
