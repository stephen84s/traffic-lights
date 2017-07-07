'use strict';
const moment = require('moment')

class SignalSystem {
    /**
     * Create the Signal system with the given initial state of the signal and the timeframe.
     * north: state of the northern signal (R, Y, G).
     * south: state of the southern signal.
     * east: state of the eastern signal.
     * west: state of the western signal.
     * startTime: Time at which simulation will start
     * endTime: Time at which simulation will end, by default 30 minutes from current time
     * redGreenTime: After how long do the signals (R and G) change.
     * yellowTime: After how long does the yellow signal change
     */
    constructor({
        north = 'R',
        south = 'R',
        east = 'R',
        west = 'R',
        startTime = moment(),
        endTime = moment().add('30', 'minutes'),
        yellowTime = 30,
        redGreenTime = 300
    }) {
        this._signals = [north, south, east, west];
        this._startTime = startTime;
        this._endTime = endTime
        this._yellowTime = yellowTime;
        this._redGreenTime = redGreenTime;

        // This is to calculate the maximum number of times the signals will change,
        // without factoring in the time of the yellow signal, so number of changes can
        // never exceed this value.
        this._totalChanges = ((endTime - startTime) / 1000) / redGreenTime;
        this._changesCompleted = 0;
    }

    /**
     * Runs the signal simulation.
     * If the initial state was invalid, it gets the signals to a valid state by calling
     * the method _normalizeState() and then starts the simulation.
     * In the simulation, the change from red to green and green to yellow is considered 1 change.
     * A change from yellow to red however is considered yellowTime / redGreenTime change since it
     * takes a lesser amount of time than the red-green / green-yellow change.
     * Ex: For Red-Green Time = 300 secs and Yellow time = 30 secs
     * Yellow Change would be considered as 30/300 changes = 0.01 part of signal change.
     */
    run() {
        const yellowTimeRatio = this._yellowTime / this._redGreenTime
        console.log(`Initial State: ${this._signals.join('')}`);
        this._normalizeState();

        console.log(`Normalised State: ${this._signals.join('')}`);
        while (this._changesCompleted <= this._totalChanges) {
            // If the state contains a 'Y', then its a microchange
            this._change();
            this.displaySignalState()

            if (this._signals.includes('Y')) {
                this._changesCompleted += yellowTimeRatio;
            } else {
                this._changesCompleted++;
            }
        }
    }

    /**
     * Tells the system to change the signals, state transitions:-
     * North South East West
     * RRGG -> RRYY
     * RRYY -> GGRR
     * GGRR -> YYRR
     * YYRR -> RRGG
     * This method doesn't care about the time intervals, it just changes the state based on previous state.
     * But it does need a valid initial state top operate correctly.
     */
    _change() {
        let input = '',
            output = '';
        if (this._signals.includes('G')) {
            // Just switch the greens to yellows, reds do not change
            this._signals = this
                ._signals
                .map((signal) => (signal === 'G' && 'Y') || signal);
        } else if (this._signals.includes('Y')) {
            // Switch the yellows to Red and Red to Green
            this._signals = this
                ._signals
                .map((signal) => ((signal === 'Y' && 'R') || signal === 'R' && 'G'));
        } else {
            // No Greens or Yellows, so everything has to be red, so just make the North
            // South signals red.
            this._signals[0] = 'G';
            this._signals[1] = 'G';
        }
    }

    /**
     * If we have a bad start state where two perpendicular signal are green (ex: north and east), normalize that state first.
     * This method will first convert everyone to Red (via Yellow) and then start the simulation.
     * The 'change()' method needs this guy to run first and make a valid state.
     * Initial valid states are RRRR, RRGG, GGRR, RRYY, YYRR
     */
    _normalizeState() {
        if (this._isStateValid()) {
            this._changesCompleted = 1;
            return;
        }
        const yellowTimeRatio = this._yellowTime / this._redGreenTime;

        // Get everyone to a RED state
        do {
            // Step 1: Check if there are any Greens
            const greenPresent = this
                ._signals
                .filter((signal) => signal === 'G')
                .length > 0;

            // Step 2: Convert Greens to Yellow and Yellows to Red, Reds stay Red.
            this._signals = this
                ._signals
                .map((signal) => (signal === 'G' && 'Y') || (signal === 'Y' && 'R') || 'R');

            // Step 3: Increment the number if changes done, A green takes longer time to change than a yellow,
            // so if a green is present it is incremented by one
            this._changesCompleted += greenPresent
                ? 1
                : yellowTimeRatio;

            this.displaySignalState();
        } while (this._signals.join('') !== 'RRRR');
        this._changesCompleted++;
    }

    _isStateValid() {
        const validStates = ['RRRR', 'RRGG', 'GGRR', 'YYRR', 'RRYY'];
        const stateString = this
            ._signals
            .join('');
        return validStates.filter((validState) => validState === stateString).length > 0;
    }

    displaySignalState() {
        const secondsPassed = Math.round(this._changesCompleted * this._redGreenTime);
        const currentMoment = moment(this._startTime).add(secondsPassed, 'seconds');
        console.log(currentMoment.format('LTS') + ' ' + this._signals.join(''));
    }
}

module.exports.SignalSystem = SignalSystem;
