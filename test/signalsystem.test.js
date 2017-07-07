// Tests for the Signal System module
const assert = require('assert');
const sinon =  require('sinon');
const moment = require('moment');

const {SignalSystem} = require('../signalsystem.js');

describe('SignalSystem ', () => {
    describe('_normalizeState ', () => {
        it('does not modify a valid inital state ', () => {

            const validStates = ['RRRR', 'RRGG', 'RRYY', 'GGRR', 'YYRR'];
            validStates.forEach((validState) => {   
                const signalSystem = new SignalSystem({
                    north: validState.charAt(0),
                    south: validState.charAt(1),
                    east: validState.charAt(2),
                    west: validState.charAt(3)
                });
                signalSystem._normalizeState();
                const signals = signalSystem._signals.join('');
                assert.deepEqual(signals, validState);
            });
        })
    });
    describe(' change() ', () => {
        it('performs only valid state transitions', () => {
            const initialStates = ['RRGG', 'GGRR', 'YYRR', 'RRYY'];
            const expectedStates = ['RRYY', 'YYRR', 'RRGG', 'GGRR'];

            initialStates.forEach((initialState, index) => {
                const signalSystem = new SignalSystem({
                    north: initialState.charAt(0),
                    south: initialState.charAt(1),
                    east: initialState.charAt(2),
                    west: initialState.charAt(3)
                });
                signalSystem._change();
                const signals = signalSystem._signals.join('');
                assert.deepEqual(signals, expectedStates[index]);
            })
        });
    });
    describe(' run() ', () => {
        it('Should perform no signal changes when redGreenTime and yellowTime are greater than simulation time', () => {
            const signalSystem = new SignalSystem({
                north: 'R',
                south: 'R',
                east: 'Y',
                west: 'Y',
                redGreenTime: 5000,
                yellowTime: 5000,
                startTime: moment(),
                endTime: moment()
            });
            signalSystem._change = sinon.stub();
            signalSystem.run();
            assert(signalSystem._change.notCalled);
        });

        it('Should perform one signal change when initial state is valid and ' + 
                'redGreenTime + yellowTime < simulationTime and redGreenTime < simulationTime', () => {
            const startTime = moment();
            const signalSystem = new SignalSystem({
                north: 'R',
                south: 'R',
                east: 'G',
                west: 'G',
                yellowTime: 30,
                redGreenTime: 270,
                startTime: moment(startTime),
                endTime: moment(startTime.add(290, 'seconds'))
            });
            const spy = sinon.spy(signalSystem, '_change');
            signalSystem.run();
            assert(spy.calledOnce);
        });

        it('Should perform two signal changes when ' +
                'redGreenTime + yellowTime > simulationTime', () => {
            const startTime = moment();
            const signalSystem = new SignalSystem({
                north: 'R',
                south: 'R',
                east: 'G',
                west: 'G',
                yellowTime: 30,
                redGreenTime: 270,
                startTime: moment(startTime),
                endTime: moment(startTime.add(300, 'seconds'))
            });
            const spy = sinon.spy(signalSystem, '_change');
            signalSystem.run();
            assert(spy.calledTwice);
        });

        it('Check number of transitions based on signalChangeInterval, yellowInterval and simulationInterval', () => {
            const startTime = moment();
            const signalSystem = new SignalSystem({
                north: 'G',
                south: 'G',
                east: 'R',
                west: 'R',
                yellowTime: 30,
                redGreenTime: 300,
                startTime: moment(startTime),
                endTime: moment(startTime.add(30, 'minutes'))
            });
            const spy = sinon.spy(signalSystem, '_change');
            signalSystem.run();
            // Transitions on (secs): 300 + 330 + 630 + 660 + 960 + 990 + 1290 + 1320 + 1620 + 1650 
            assert(spy.callCount === 10);
        });
    });
});
