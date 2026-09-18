import assert from "node:assert/strict";
import {
  drivenRpm,
  requiredFrequency,
  synchronousMotorSpeed,
  torqueNm,
  powerFromTorqueKw,
  threePhasePowerKw,
  threePhaseCurrentA,
  waterHeating,
  cylinderForce,
  openBeltLength,
  laundryGForce,
  rpmForGForce,
  surfaceSpeedMMin,
  rpmForSurfaceSpeed,
  speedDifferentialPercent,
  speedFromDifferential,
  scale4to20FromMa,
  scale4to20ToMa,
  gearboxOutputRpm,
  gearboxRatioForOutput,
  steamSaturationTemperature,
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

const speed = synchronousMotorSpeed({ hz: 50, poles: 6, slipPercent: 2.5 });
close(speed.synchronousRpm, 1000);
close(speed.loadedRpm, 975);

close(torqueNm({ kw: 18.5, rpm: 1450 }), 121.83585298758885);
close(powerFromTorqueKw({ torque: 121.84482758620689, rpm: 1450 }), 18.5);

const kw = threePhasePowerKw({
  volts: 400,
  amps: 32,
  powerFactor: 0.85,
  efficiency: 0.9,
});
close(kw, 16.960241507714446);

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

const force = cylinderForce({ pressureBar: 6, boreMm: 80, rodMm: 25 });
close(force.extendN, 3015.928947446202);
close(force.retractN, 2721.4046361721585);

close(openBeltLength({ pulleyA: 640, pulleyB: 115, centerDistance: 800 }), 2872.883073618424);

const gForce = laundryGForce({ drumDiameterMm: 640, rpm: 650 });
close(gForce, 151.18658314366968);
close(rpmForGForce({ drumDiameterMm: 640, gForce }), 650);

const electroluxG = laundryGForce({ drumDiameterMm: 920, rpm: 825 });
close(electroluxG, 350, 0.2);

const surfaceSpeed = surfaceSpeedMMin({ diameterMm: 800, rpm: 5 });
close(surfaceSpeed, 12.566370614359172);
close(rpmForSurfaceSpeed({ diameterMm: 800, speedMMin: surfaceSpeed }), 5);

close(speedDifferentialPercent({ referenceSpeed: 20, secondarySpeed: 20.1 }), 0.5);
close(speedFromDifferential({ referenceSpeed: 20, differentialPercent: 0.5 }), 20.1);

close(scale4to20FromMa({ milliAmps: 12, engineeringMin: 0, engineeringMax: 10 }), 5);
close(scale4to20ToMa({ value: 5, engineeringMin: 0, engineeringMax: 10 }), 12);

close(gearboxOutputRpm({ inputRpm: 1450, ratio: 20 }), 72.5);
close(gearboxRatioForOutput({ inputRpm: 1450, outputRpm: 72.5 }), 20);

const steamAtAtmosphere = steamSaturationTemperature({
  pressure: 1.01325,
  unit: "bar",
  reference: "absolute",
});
close(steamAtAtmosphere.celsius, 99.9743, 0.02);

const steamAtZeroGauge = steamSaturationTemperature({
  pressure: 0,
  unit: "bar",
  reference: "gauge",
});
close(steamAtZeroGauge.celsius, steamAtAtmosphere.celsius, 0.001);

const steamAtSixBarg = steamSaturationTemperature({
  pressure: 6,
  unit: "bar",
  reference: "gauge",
});
close(steamAtSixBarg.celsius, 165.029, 0.03);

close(convertPressure(6, "bar", "psi"), 87.02264187015315);
close(convertPressure(1, "bar", "kPa"), 100);

assert.throws(() => drivenRpm({ motorRpm: 960, motorPulley: 115, drivenPulley: 0 }));
assert.throws(() => synchronousMotorSpeed({ hz: 50, poles: 5, slipPercent: 2 }));
assert.throws(() => cylinderForce({ pressureBar: 6, boreMm: 50, rodMm: 60 }));
assert.throws(() => openBeltLength({ pulleyA: 640, pulleyB: 115, centerDistance: 200 }));
assert.throws(() => waterHeating({ liters: 100, startC: 60, targetC: 20, heaterKw: 10 }));
assert.throws(() => laundryGForce({ drumDiameterMm: 0, rpm: 500 }));
assert.throws(() => steamSaturationTemperature({ pressure: -2, unit: "bar", reference: "gauge" }));

console.log("TechBench calculation tests passed.");
