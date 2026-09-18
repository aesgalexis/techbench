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
  return (60000 / (2 * Math.PI)) * kw / rpm;
}

export function powerFromTorqueKw({ torque, rpm }) {
  if (!finite(torque, rpm) || torque < 0 || rpm <= 0) {
    throw new Error("Enter valid torque and RPM.");
  }
  return torque * rpm / (60000 / (2 * Math.PI));
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
  const radiusDifference = (large - small) / 2;
  const tangentLength = Math.sqrt(centerDistance ** 2 - radiusDifference ** 2);
  const angle = Math.asin(radiusDifference / centerDistance);

  return 2 * tangentLength +
    Math.PI * (large + small) / 2 +
    2 * radiusDifference * angle;
}


export function laundryGForce({ drumDiameterMm, rpm }) {
  if (!finite(drumDiameterMm, rpm) || drumDiameterMm <= 0 || rpm < 0) {
    throw new Error("Enter a valid drum diameter and RPM.");
  }
  const radiusCm = drumDiameterMm / 20;
  const rcfConstant = (4 * Math.PI ** 2 / (60 ** 2 * 9.80665)) * 0.01;
  return rcfConstant * radiusCm * rpm ** 2;
}

export function rpmForGForce({ drumDiameterMm, gForce }) {
  if (!finite(drumDiameterMm, gForce) || drumDiameterMm <= 0 || gForce < 0) {
    throw new Error("Enter a valid drum diameter and G-force.");
  }
  const radiusCm = drumDiameterMm / 20;
  const rcfConstant = (4 * Math.PI ** 2 / (60 ** 2 * 9.80665)) * 0.01;
  return Math.sqrt(gForce / (rcfConstant * radiusCm));
}

export function surfaceSpeedMMin({ diameterMm, rpm }) {
  if (!finite(diameterMm, rpm) || diameterMm <= 0 || rpm < 0) {
    throw new Error("Enter a valid roller diameter and RPM.");
  }
  return Math.PI * (diameterMm / 1000) * rpm;
}

export function rpmForSurfaceSpeed({ diameterMm, speedMMin }) {
  if (!finite(diameterMm, speedMMin) || diameterMm <= 0 || speedMMin < 0) {
    throw new Error("Enter a valid roller diameter and surface speed.");
  }
  return speedMMin / (Math.PI * (diameterMm / 1000));
}

export function speedDifferentialPercent({ referenceSpeed, secondarySpeed }) {
  if (!finite(referenceSpeed, secondarySpeed) || referenceSpeed <= 0 || secondarySpeed < 0) {
    throw new Error("Enter valid speeds.");
  }
  return (secondarySpeed - referenceSpeed) / referenceSpeed * 100;
}

export function speedFromDifferential({ referenceSpeed, differentialPercent }) {
  if (!finite(referenceSpeed, differentialPercent) || referenceSpeed <= 0 || differentialPercent <= -100) {
    throw new Error("Enter a valid reference speed and differential.");
  }
  return referenceSpeed * (1 + differentialPercent / 100);
}

export function scale4to20FromMa({ milliAmps, engineeringMin, engineeringMax }) {
  if (!finite(milliAmps, engineeringMin, engineeringMax) || engineeringMax === engineeringMin) {
    throw new Error("Check signal and engineering range.");
  }
  return engineeringMin + ((milliAmps - 4) / 16) * (engineeringMax - engineeringMin);
}

export function scale4to20ToMa({ value, engineeringMin, engineeringMax }) {
  if (!finite(value, engineeringMin, engineeringMax) || engineeringMax === engineeringMin) {
    throw new Error("Check value and engineering range.");
  }
  return 4 + ((value - engineeringMin) / (engineeringMax - engineeringMin)) * 16;
}

export function gearboxOutputRpm({ inputRpm, ratio }) {
  if (!finite(inputRpm, ratio) || inputRpm < 0 || ratio <= 0) {
    throw new Error("Enter valid input RPM and gearbox ratio.");
  }
  return inputRpm / ratio;
}

export function gearboxRatioForOutput({ inputRpm, outputRpm }) {
  if (!finite(inputRpm, outputRpm) || inputRpm <= 0 || outputRpm <= 0) {
    throw new Error("Enter valid input and output RPM.");
  }
  return inputRpm / outputRpm;
}

const IF97_SATURATION = {
  n1: 1167.0521452767,
  n2: -724213.16703206,
  n3: -17.073846940092,
  n4: 12020.82470247,
  n5: -3232555.0322333,
  n6: 14.91510861353,
  n7: -4823.2657361591,
  n8: 405113.40542057,
  n9: -0.23855557567849,
  n10: 650.17534844798,
};

function saturationPressureMPaFromKelvin(kelvin) {
  const n = IF97_SATURATION;
  const theta = kelvin + n.n9 / (kelvin - n.n10);
  const A = theta ** 2 + n.n1 * theta + n.n2;
  const B = n.n3 * theta ** 2 + n.n4 * theta + n.n5;
  const C = n.n6 * theta ** 2 + n.n7 * theta + n.n8;
  return (2 * C / (-B + Math.sqrt(B ** 2 - 4 * A * C))) ** 4;
}

export function steamSaturationTemperature({ pressure, unit = "bar", reference = "gauge" }) {
  if (!finite(pressure) || !["bar", "psi"].includes(unit) || !["gauge", "absolute"].includes(reference)) {
    throw new Error("Check pressure, unit, and reference.");
  }

  let absoluteBar = unit === "psi" ? pressure / 14.503773773 : pressure;
  if (reference === "gauge") absoluteBar += 1.01325;

  const absoluteMPa = absoluteBar / 10;
  const minMPa = 0.000611657;
  const maxMPa = 22.064;

  if (absoluteMPa < minMPa || absoluteMPa > maxMPa) {
    throw new Error("Pressure is outside the saturated-water range.");
  }

  let lowK = 273.16;
  let highK = 647.096;

  for (let i = 0; i < 70; i += 1) {
    const midK = (lowK + highK) / 2;
    const midP = saturationPressureMPaFromKelvin(midK);
    if (midP < absoluteMPa) lowK = midK;
    else highK = midK;
  }

  const celsius = (lowK + highK) / 2 - 273.15;
  return {
    celsius,
    fahrenheit: celsius * 9 / 5 + 32,
    absoluteBar,
    absolutePsi: absoluteBar * 14.503773773,
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
