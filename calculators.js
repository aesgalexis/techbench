const finite = (...values) => values.every(Number.isFinite);

export function drivenRpm({ motorRpm, motorPulley, drivenPulley }) {
  if (!finite(motorRpm, motorPulley, drivenPulley) || motorRpm < 0 || motorPulley <= 0 || drivenPulley <= 0) {
    throw new Error("Enter valid positive values.");
  }
  return motorRpm * (motorPulley / drivenPulley);
}

export function requiredFrequency({ targetRpm, motorRatedRpm, motorPulley, drivenPulley, ratedHz = 50 }) {
  if (
    !finite(targetRpm, motorRatedRpm, motorPulley, drivenPulley, ratedHz) ||
    targetRpm < 0 ||
    motorRatedRpm <= 0 ||
    motorPulley <= 0 ||
    drivenPulley <= 0 ||
    ratedHz <= 0
  ) {
    throw new Error("Enter valid positive values.");
  }

  const rpmAtRatedHz = drivenRpm({ motorRpm: motorRatedRpm, motorPulley, drivenPulley });
  return targetRpm / rpmAtRatedHz * ratedHz;
}

export function threePhasePowerKw({ volts, amps, powerFactor = 1, efficiency = 1 }) {
  if (!finite(volts, amps, powerFactor, efficiency) || volts <= 0 || amps < 0 || powerFactor <= 0 || powerFactor > 1 || efficiency <= 0 || efficiency > 1) {
    throw new Error("Check voltage, current, power factor, and efficiency.");
  }
  return Math.sqrt(3) * volts * amps * powerFactor * efficiency / 1000;
}

export function threePhaseCurrentA({ kw, volts, powerFactor = 1, efficiency = 1 }) {
  if (!finite(kw, volts, powerFactor, efficiency) || kw < 0 || volts <= 0 || powerFactor <= 0 || powerFactor > 1 || efficiency <= 0 || efficiency > 1) {
    throw new Error("Check power, voltage, power factor, and efficiency.");
  }
  return kw * 1000 / (Math.sqrt(3) * volts * powerFactor * efficiency);
}

export function waterHeating({ liters, startC, targetC, heaterKw }) {
  if (!finite(liters, startC, targetC, heaterKw) || liters < 0 || heaterKw <= 0 || targetC < startC) {
    throw new Error("Check volume, temperatures, and heater power.");
  }

  const deltaC = targetC - startC;
  const kwh = liters * 4.186 * deltaC / 3600;
  return {
    deltaC,
    kwh,
    minutes: kwh / heaterKw * 60,
  };
}

const pressureToPa = {
  bar: 100000,
  kPa: 1000,
  MPa: 1000000,
  psi: 6894.757293168,
  mH2O: 9806.65,
};

export function convertPressure(value, from, to) {
  if (!Number.isFinite(value) || !pressureToPa[from] || !pressureToPa[to]) {
    throw new Error("Invalid pressure conversion.");
  }
  return value * pressureToPa[from] / pressureToPa[to];
}
