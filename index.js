'use strict'

const moment = require('moment');

const { SignalSystem } = require("./signalsystem.js");
const readLine = require('readline');

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const timeStrToMoment = (timeStr) => {
    const hours = timeStr.split(':')[0];
    const minutes = timeStr.split(':')[1];

    return moment().set({
        hours,
        minutes,
        seconds: '00'
    });
}

console.log('Signaling System for Traffic Lights');

new Promise((res, rej) => {
    rl.question('Enter initial state of the signals in the order North South East West (Ex: RGRG): ', (initialState) => {
        if (initialState.toUpperCase().match(/[RGY]{4}/)) {
            return res({initialState});
        } else {
            console.log('Invalid value or no value found for inital state, defaulting to all red (RRRR).');
            return res({initialState: 'RRRR'});
        }
    });
}).then((obj) => {
    return new Promise((res, rej) => {
        rl.question('Enter time after which the red and green signals change (seconds): ', (redGreenTimeStr) => {
            let redGreenTime = 300;
            if (redGreenTimeStr.match(/[\d]+/)) {
                redGreenTime = parseInt(redGreenTimeStr);
            } else {
                console.log('Found invalid value, defaulting to 300 seconds');
            }
            return res({
                ...obj,
                redGreenTime
            });
        });
    });
}).then((obj) => {
    return new Promise((res, rej) => {
        rl.question('Yellow signal time in seconds: ', (yellowTimeStr) => {
            let yellowTime = 30;
            if (yellowTimeStr.match(/[\d]+/)) {
                yellowTime = parseInt(yellowTimeStr);
            } else {
                console.log('Either no value was entered or invalid value found, defaulting to 30 seconds');
            }

            return res({
                ...obj,
                yellowTime
            });
        })
    });
    
}).then((obj)=> {
    return new Promise((res, rej) => {
        rl.question('Enter and start and end times (HH:MM HH:MM): ', (timeStr) => {
            const defaultStartTime = moment().set({hours: '9', minutes: '00', seconds: '00'});
            const defaultEndTime = moment().set({hours: '9', minutes: '30', seconds: '00'});

            const timeRegex = new RegExp(/2[0-3]{1}:[0-5]{1}[0-9]{1}||[01][0-9]{1}:[0-5]{1}[0-9]{1}/)
            const inputRegex = new RegExp('^(' + timeRegex.source + ')[\\s]+(' + timeRegex.source + ')$');
            const matchers = timeStr.match(inputRegex)
            if (matchers) {
                const startTime = timeStrToMoment(matchers[1]);
                const endTime = timeStrToMoment(matchers[2]);

                return res({
                    ...obj,
                    startTime,
                    endTime
                });
            }

            console.log('Could not recongnise entered values for start and end time, defaulting to 9:00 and 9:30');

            return res({
                ...obj,
                startTime: defaultStartTime,
                endTime: defaultEndTime
            });
        });
    });
}).then(({initialState, redGreenTime, startTime, endTime, yellowTime}) => {
    console.log('Following paramters were received for the signal simulation: \n' +
        `Initial State: ${initialState}\n` +
        `Red Green Signal Time: ${redGreenTime}\n` + 
        `Yellow Signal Time: ${yellowTime}\n` +
        `Start Time: ${startTime.format('LTS')}\n` +
        `End Time: ${endTime.format('LTS')}\n`);

    // Starting simulation
    const signalSystem = new SignalSystem({
        north: initialState.charAt(0),
        south: initialState.charAt(1),
        east: initialState.charAt(2),
        west: initialState.charAt(3),
        yellowTime,
        redGreenTime,
        startTime,
        endTime
    });

    signalSystem.run();
    rl.close();
});

