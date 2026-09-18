import assert from "node:assert/strict";
import {
  drivenRpm,
  requiredFrequency,
  threePhasePowerKw,
  threePhaseCurrentA,
  waterHeating,
  convertPressure,
} from "./calculators.js";

const close = (actual, expected, tolerance = 1e-6) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} ≈ ${expected}`);
};

close(drivenRpm({ motorRpm: 960, motorPulley: 115, drivenPulley: 640 }), 172.5);

close(
  requiredFrequency({
    targetRpm: 650,
    motorRatedRpm: 960,
    motorPulley: 115,
    drivenPulley: 640,
    ratedHz: 50,
  }),
  188.40579710144928,
);

const kw = threePhasePowerKw({
  volts: 400,
  amps: 32,
  powerFactor: 0.85,
  efficiency: 0.9,
});
close(kw, 16.957927662052084);

close(
  threePhaseCurrentA({
    kw,
    volts: 400,
    powerFactor: 0.85,
    efficiency: 0.9,
  }),
  32,
);

const heat = waterHeating({
  liters: 500,
  startC: 15,
  targetC: 60,
  heaterKw: 36,
});
close(heat.kwh, 26.1625);
close(heat.minutes, 43.604166666666664);

close(convertPressure(6, "bar", "psi"), 87.02264187015315);
close(convertPressure(1, "bar", "kPa"), 100);

assert.throws(() => drivenRpm({ motorRpm: 960, motorPulley: 115, drivenPulley: 0 }));
assert.throws(() => waterHeating({ liters: 100, startC: 60, targetC: 20, heaterKw: 10 }));

console.log("TechBench calculation tests passed.");
