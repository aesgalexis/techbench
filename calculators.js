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

export function synchronousMotorSpeed({ hz, poles, slipPercent = 0 }) {
  if (!finite(hz, poles, slipPercent) || hz <= 0 || poles <= 0 || poles % 2 !== 0 || slipPercent < 0 || slipPercent >= 100) {
    throw new Error("Use a positive frequency, an even pole count, and valid slip.");
  }
  const synchronousRpm = 120 * hz / poles;
  return {
    synchronousRpm,
    loadedRpm: synchronousRpm * (1 - slipPercent / 100),
  };
}

export function torqueNm({ kw, rpm }) {
  if (!finite(kw, rpm) || kw < 0 || rpm <= 0) {
    throw new Error("Enter valid power and RPM.");
  }
  return 9550 * kw / rpm;
}

export function powerFromTorqueKw({ torque, rpm }) {
  if (!finite(torque, rpm) || torque < 0 || rpm <= 0) {
    throw new Error("Enter valid torque and RPM.");
  }
  return torque * rpm / 9550;
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

export function cylinderForce({ pressureBar, boreMm, rodMm = 0 }) {
  if (!finite(pressureBar, boreMm, rodMm) || pressureBar < 0 || boreMm <= 0 || rodMm < 0 || rodMm >= boreMm) {
    throw new Error("Check pressure, bore, and rod diameters.");
  }
  const pistonAreaMm2 = Math.PI * boreMm ** 2 / 4;
  const rodAreaMm2 = Math.PI * rodMm ** 2 / 4;
  const newtonsPerMm2 = pressureBar * 0.1;

  return {
    extendN: pistonAreaMm2 * newtonsPerMm2,
    retractN: (pistonAreaMm2 - rodAreaMm2) * newtonsPerMm2,
  };
}

export function openBeltLength({ pulleyA, pulleyB, centerDistance }) {
  if (!finite(pulleyA, pulleyB, centerDistance) || pulleyA <= 0 || pulleyB <= 0 || centerDistance <= 0) {
    throw new Error("Enter valid pulley diameters and center distance.");
  }
  const large = Math.max(pulleyA, pulleyB);
  const small = Math.min(pulleyA, pulleyB);
  if (centerDistance <= (large - small) / 2) {
    throw new Error("Center distance is too small for this pulley pair.");
  }
  return 2 * centerDistance +
    Math.PI / 2 * (large + small) +
    (large - small) ** 2 / (4 * centerDistance);
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
