var express = require('express');
const cache = require('memory-cache');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cors());
app.options('*', cors());

app.get('/', (req, res) => res.status(200).send('Arkesel Rocks!!'));

app.post('/ussd', ((req, res) => {
    const {
        sessionID,
        userID,
        newSession,
        msisdn,
        userData,
        network,
    } = req.body;

    if (newSession) {
        const message = "Welcome to Arkesel Voting Portal. Please vote for your favourite service from Arkesel" +
            "\n1. SMS" +
            "\n2. Voice" +
            "\n3. Email" +
            "\n4. USSD" +
            "\n5. Payments";
        const continueSession = true;

        // Keep track of the USSD state of the user and their session
        const currentState = {
            sessionID,
            msisdn,
            userData,
            network,
            newSession,
            message,
            level: 1,
            page: 1,
        };

        let userResponseTracker = cache.get(sessionID);

        !userResponseTracker
            ? userResponseTracker = [{ ...currentState }]
            : userResponseTracker.push({ ...currentState });

        cache.put(sessionID, userResponseTracker);

        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            userID,
            sessionID,
            message,
            continueSession,
            msisdn
        });
    }

    const userResponseTracker = cache.get(sessionID);

    if (!userResponseTracker) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json({
            userID,
            sessionID,
            message: 'Error! Please dial code again!',
            continueSession: false,
            msisdn
        });
    }

    const lastResponse = userResponseTracker[userResponseTracker.length - 1];

    let message = "Bad Option";
    let continueSession = false;

    if (lastResponse.level === 1) {
        if (["2", "3", "4", "5"].includes(userData)) {
            message = "Thank you for voting!";
            continueSession = false;
        } else if (userData === '1') {
            message = "For SMS which of the features do you like best?" +
                "\n1. From File" +
                "\n2. Quick SMS" +
                "\n\n #. Next Page";

            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 2,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 1,
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        }
    } else if (lastResponse.level === 2) {
        if (lastResponse.page === 1 && userData === '#') {
            message = "For SMS which of the features do you like best?" +
                "\n3. Bulk SMS" +
                "\n\n*. Go Back" +
                "\n#. Next Page";

            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 2,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 2
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);

        } else if (lastResponse.page === 2 && userData === '#') {
            // Useful Resources
            message = "For SMS which of the features do you like best?" +
                "\n4. SMS To Contacts" +
                "\n5. Enter your name" +
                "\n\n*. Go Back";

            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 2,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 3,
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        } else if (lastResponse.page === 3 && userData === '*') {
            message = "For SMS which of the features do you like best?" +
                "\n3. Bulk SMS" +
                "\n\n*. Go Back" +
                "\n#. Next Page";

            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 2,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 2
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        } else if (lastResponse.page === 2 && userData === '*') {
            message = "For SMS which of the features do you like best?" +
                "\n1. From File" +
                "\n2. Quick SMS" +
                "\n\n #. Next Page";

            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 2,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 1,
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        } else if (["1", "2", "3", "4"].includes(userData)) {
            message = "Thank you for voting!";
            continueSession = false;
        } else if (userData === "5"){
            message = "Enter your name below: "
            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 3,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 1,
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        } else {
            message = "Bad choice!";
            continueSession = false;
        }
    } else if (lastResponse.level === 3) {
        if (["Kwame", "Kofi", "Kwaku", "Komla", "Kwadwo"].includes(userData)) {
            message = "Dear " + userData + ", thank you for voting!";
            continueSession = false;
        } else {
            message = "You entered a wrong name. Please enter a valid name: "
            continueSession = true;

            const currentState = {
                sessionID,
                userID,
                level: 3,
                msisdn,
                message,
                userData,
                network,
                newSession,
                page: 1,
            };

            userResponseTracker.push({ ...currentState });
            cache.put(sessionID, userResponseTracker);
        }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
        userID,
        sessionID,
        message,
        continueSession,
        msisdn
    });
}));

app.listen(8000, function () {
    console.log('Arkesel USSD app listening on 8000!');
});