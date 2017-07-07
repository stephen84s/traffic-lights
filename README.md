# Signalling System

## Assumptions

* The main assumpion for this algorithm is that we have just three sets of lights RYG.
* So opposite lanes have green signals while perpendicular lanes will be Red.
* When the light is turning from green to yellow the other lights should stay red.
* Although the values are configurable, the simulation is designed such that amount of time spent on a yellow is always less than that on green.

## Expected Output

All the light changes which occurred over a 30 min period.
So something like:

```
N,S,E,W
R,R,R,R
G,G,R,R
Y,Y,R,R
R,R,G,G
... so on
```

## Running the Code

After checking out the repo just run to install all dependencies.

```shell
yarn install
```

To start the app run:-

```shell
node --harmony index.js
```

The harmony flag is needed to use the object spread operator.

Once running you will be asked to enter:-

1. The initial state of all the four signals. (Default: RRRR), You can enter that as any four letter combination of `R`, `Y` and `G`. The first character refers to the Northern signal, second to Southern, third to Eastern and fourth to the Western signal. Valid values for each signal are `R`, `G` or `Y`.
1. The time after which Red and Green signals change in seconds (Defaults to 300)
1. The time yellow signal will be active for in seconds (Defaults to 30)
1. Start and End times for the simulation in 24 hours format, Ex: `09:00 09:30` (Defaults from 9:00 a.m. to 9:30 a.m.)

Once these questions have been answered, the simulation will run showing the states of the lights.

Following is a sample run of the program:-

```text
~/code/traffic-lights$ node -harmony index.js
Signaling System for Traffic Lights
Enter initial state of the signals in the order North South East West (Ex: RGRG): RRRR
Enter time after which the red and green signals change (seconds):
Found invalid value, defaulting to 300 seconds
Yellow signal time in seconds:
Either no value was entered or invalid value found, defaulting to 30 seconds
Enter and start and end times (HH:MM HH:MM):
Could not reconginise entered values for start and end time, defaulting to 9:00 and 9:30
Following paramters were received for the signal simulation:
Initial State: RRRR
Red Green Signal Time: 300
Yellow Signal Time: 30
Start Time: 9:00:00 AM
End Time: 9:30:00 AM

Initial State: RRRR
Normalised State: RRRR
9:05:00 AM GGRR
9:10:00 AM YYRR
9:10:30 AM RRGG
9:15:30 AM RRYY
9:16:00 AM GGRR
9:21:00 AM YYRR
9:21:30 AM RRGG
9:26:30 AM RRYY
9:27:00 AM GGRR
```

`Normalised State` comes into play when the initial state is invalid, ex all lights are green, so we normalise the state of the traffic lights by getting them all to Red before starting the simulation.

## Running Tests

The tests can be run with the following command:-

```shell
yarn test
```

or

```shell
mocha
```
