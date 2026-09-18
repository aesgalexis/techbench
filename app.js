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

const $ = (id) => document.getElementById(id);
const n = (id) => Number($(id).value);

function format(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: digits }).format(value);
}

function showTool(tool) {
  const cards = [...document.querySelectorAll("[data-tool]")];
  const exists = cards.some((card) => card.dataset.tool === tool);
  cards.forEach((card) => { card.hidden = card.dataset.tool !== tool; });
  $("empty-state").hidden = exists;
  $("tool-picker").value = exists ? tool : "";

  if (exists) {
    history.replaceState(null, "", `#${tool}`);
  } else {
    history.replaceState(null, "", location.pathname + location.search);
  }
}

function renderDrive() {
  try {
    const values = {
      motorRpm: n("motor-rpm"),
      motorPulley: n("motor-pulley"),
      drivenPulley: n("driven-pulley"),
    };
    const rpm = drivenRpm(values);
    const hz = requiredFrequency({
      targetRpm: n("target-rpm"),
      motorRatedRpm: values.motorRpm,
      motorPulley: values.motorPulley,
      drivenPulley: values.drivenPulley,
      ratedHz: n("rated-hz"),
    });
    $("drive-rpm").textContent = `${format(rpm, 1)} rpm`;
    $("drive-hz").textContent = `${format(hz, 1)} Hz`;
    $("drive-error").textContent = "";
  } catch (error) {
    $("drive-rpm").textContent = "-";
    $("drive-hz").textContent = "-";
    $("drive-error").textContent = error.message;
  }
}

function renderMotorSpeed() {
  try {
    const result = synchronousMotorSpeed({
      hz: n("speed-hz"),
      poles: n("speed-poles"),
      slipPercent: n("speed-slip"),
    });
    $("speed-sync").textContent = `${format(result.synchronousRpm, 1)} rpm`;
    $("speed-loaded").textContent = `${format(result.loadedRpm, 1)} rpm`;
    $("speed-error").textContent = "";
  } catch (error) {
    $("speed-sync").textContent = "-";
    $("speed-loaded").textContent = "-";
    $("speed-error").textContent = error.message;
  }
}

let torqueMode = "torque";

function setTorqueMode(mode) {
  torqueMode = mode;
  document.querySelectorAll("[data-torque-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.torqueMode === mode);
  });
  $("torque-kw-field").hidden = mode !== "torque";
  $("torque-nm-field").hidden = mode !== "power";
  renderTorque();
}

function renderTorque() {
  try {
    if (torqueMode === "torque") {
      const torque = torqueNm({ kw: n("torque-kw"), rpm: n("torque-rpm") });
      $("torque-result-label").textContent = "Estimated torque";
      $("torque-result").textContent = `${format(torque, 1)} Nm`;
    } else {
      const kw = powerFromTorqueKw({ torque: n("torque-nm"), rpm: n("torque-rpm") });
      $("torque-result-label").textContent = "Estimated shaft power";
      $("torque-result").textContent = `${format(kw, 2)} kW`;
    }
    $("torque-error").textContent = "";
  } catch (error) {
    $("torque-result").textContent = "-";
    $("torque-error").textContent = error.message;
  }
}

let powerMode = "power";

function setPowerMode(mode) {
  powerMode = mode;
  document.querySelectorAll("[data-power-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.powerMode === mode);
  });
  $("power-amps-field").hidden = mode !== "power";
  $("power-kw-field").hidden = mode !== "current";
  renderPower();
}

function renderPower() {
  try {
    const shared = {
      volts: n("power-volts"),
      powerFactor: n("power-pf"),
      efficiency: n("power-eff"),
    };

    if (powerMode === "power") {
      const kw = threePhasePowerKw({ ...shared, amps: n("power-amps") });
      $("power-result-label").textContent = "Estimated output power";
      $("power-result").textContent = `${format(kw, 2)} kW`;
    } else {
      const amps = threePhaseCurrentA({ ...shared, kw: n("power-kw") });
      $("power-result-label").textContent = "Estimated line current";
      $("power-result").textContent = `${format(amps, 1)} A`;
    }
    $("power-error").textContent = "";
  } catch (error) {
    $("power-result").textContent = "-";
    $("power-error").textContent = error.message;
  }
}

function renderHeat() {
  try {
    const result = waterHeating({
      liters: n("heat-liters"),
      startC: n("heat-start"),
      targetC: n("heat-target"),
      heaterKw: n("heat-kw"),
    });
    $("heat-energy").textContent = `${format(result.kwh, 2)} kWh`;
    $("heat-time").textContent = `${format(result.minutes, 1)} min`;
    $("heat-error").textContent = "";
  } catch (error) {
    $("heat-energy").textContent = "-";
    $("heat-time").textContent = "-";
    $("heat-error").textContent = error.message;
  }
}

function renderCylinder() {
  try {
    const result = cylinderForce({
      pressureBar: n("cyl-pressure"),
      boreMm: n("cyl-bore"),
      rodMm: n("cyl-rod"),
    });
    $("cyl-extend").textContent = `${format(result.extendN / 1000, 2)} kN`;
    $("cyl-retract").textContent = `${format(result.retractN / 1000, 2)} kN`;
    $("cyl-error").textContent = "";
  } catch (error) {
    $("cyl-extend").textContent = "-";
    $("cyl-retract").textContent = "-";
    $("cyl-error").textContent = error.message;
  }
}

function renderBelt() {
  try {
    const mm = openBeltLength({
      pulleyA: n("belt-a"),
      pulleyB: n("belt-b"),
      centerDistance: n("belt-center"),
    });
    $("belt-mm").textContent = `${format(mm, 1)} mm`;
    $("belt-m").textContent = `${format(mm / 1000, 3)} m`;
    $("belt-error").textContent = "";
  } catch (error) {
    $("belt-mm").textContent = "-";
    $("belt-m").textContent = "-";
    $("belt-error").textContent = error.message;
  }
}


let gearboxMode = "output";

function setGearboxMode(mode) {
  gearboxMode = mode;
  document.querySelectorAll("[data-gearbox-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.gearboxMode === mode);
  });
  $("gear-ratio-field").hidden = mode !== "output";
  $("gear-output-field").hidden = mode !== "ratio";
  renderGearbox();
}

function renderGearbox() {
  try {
    if (gearboxMode === "output") {
      const output = gearboxOutputRpm({ inputRpm: n("gear-input"), ratio: n("gear-ratio") });
      $("gear-result-label").textContent = "Output speed";
      $("gear-result").textContent = `${format(output, 2)} rpm`;
    } else {
      const ratio = gearboxRatioForOutput({ inputRpm: n("gear-input"), outputRpm: n("gear-output") });
      $("gear-result-label").textContent = "Required ratio";
      $("gear-result").textContent = `${format(ratio, 2)}:1`;
    }
    $("gear-error").textContent = "";
  } catch (error) {
    $("gear-result").textContent = "-";
    $("gear-error").textContent = error.message;
  }
}

let gForceMode = "g";

function setGForceMode(mode) {
  gForceMode = mode;
  document.querySelectorAll("[data-gforce-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.gforceMode === mode);
  });
  $("g-rpm-field").hidden = mode !== "g";
  $("g-target-field").hidden = mode !== "rpm";
  renderGForce();
}

function renderGForce() {
  try {
    if (gForceMode === "g") {
      const g = laundryGForce({ drumDiameterMm: n("g-diameter"), rpm: n("g-rpm") });
      $("g-result-label").textContent = "Centrifugal force";
      $("g-result").textContent = `${format(g, 1)} G`;
    } else {
      const rpm = rpmForGForce({ drumDiameterMm: n("g-diameter"), gForce: n("g-target") });
      $("g-result-label").textContent = "Required drum speed";
      $("g-result").textContent = `${format(rpm, 1)} rpm`;
    }
    $("g-error").textContent = "";
  } catch (error) {
    $("g-result").textContent = "-";
    $("g-error").textContent = error.message;
  }
}

let surfaceMode = "speed";

function setSurfaceMode(mode) {
  surfaceMode = mode;
  document.querySelectorAll("[data-surface-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.surfaceMode === mode);
  });
  $("surface-rpm-field").hidden = mode !== "speed";
  $("surface-speed-field").hidden = mode !== "rpm";
  renderSurfaceSpeed();
}

function renderSurfaceSpeed() {
  try {
    if (surfaceMode === "speed") {
      const speed = surfaceSpeedMMin({ diameterMm: n("surface-diameter"), rpm: n("surface-rpm") });
      $("surface-result-label").textContent = "Surface speed";
      $("surface-result").textContent = `${format(speed, 3)} m/min`;
    } else {
      const rpm = rpmForSurfaceSpeed({ diameterMm: n("surface-diameter"), speedMMin: n("surface-speed") });
      $("surface-result-label").textContent = "Required roller speed";
      $("surface-result").textContent = `${format(rpm, 3)} rpm`;
    }
    $("surface-error").textContent = "";
  } catch (error) {
    $("surface-result").textContent = "-";
    $("surface-error").textContent = error.message;
  }
}

let diffMode = "percent";

function setDiffMode(mode) {
  diffMode = mode;
  document.querySelectorAll("[data-diff-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.diffMode === mode);
  });
  $("diff-secondary-field").hidden = mode !== "percent";
  $("diff-percent-field").hidden = mode !== "speed";
  renderDifferential();
}

function renderDifferential() {
  try {
    if (diffMode === "percent") {
      const pct = speedDifferentialPercent({
        referenceSpeed: n("diff-reference"),
        secondarySpeed: n("diff-secondary"),
      });
      $("diff-result-label").textContent = "Differential";
      $("diff-result").textContent = `${format(pct, 3)} %`;
    } else {
      const speed = speedFromDifferential({
        referenceSpeed: n("diff-reference"),
        differentialPercent: n("diff-percent"),
      });
      $("diff-result-label").textContent = "Secondary speed";
      $("diff-result").textContent = format(speed, 4);
    }
    $("diff-error").textContent = "";
  } catch (error) {
    $("diff-result").textContent = "-";
    $("diff-error").textContent = error.message;
  }
}

function renderSteam() {
  try {
    const result = steamSaturationTemperature({
      pressure: n("steam-pressure"),
      unit: $("steam-unit").value,
      reference: $("steam-reference").value,
    });
    $("steam-c").textContent = `${format(result.celsius, 1)} °C`;
    $("steam-f").textContent = `${format(result.fahrenheit, 1)} °F`;
    $("steam-abs").textContent = `${format(result.absoluteBar, 3)} bara / ${format(result.absolutePsi, 2)} psia`;
    $("steam-error").textContent = "";
  } catch (error) {
    $("steam-c").textContent = "-";
    $("steam-f").textContent = "-";
    $("steam-abs").textContent = "-";
    $("steam-error").textContent = error.message;
  }
}

let signalMode = "value";

function setSignalMode(mode) {
  signalMode = mode;
  document.querySelectorAll("[data-signal-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.signalMode === mode);
  });
  $("signal-ma-field").hidden = mode !== "value";
  $("signal-value-field").hidden = mode !== "ma";
  renderSignal();
}

function renderSignal() {
  try {
    const engineeringMin = n("signal-min");
    const engineeringMax = n("signal-max");

    if (signalMode === "value") {
      const value = scale4to20FromMa({
        milliAmps: n("signal-ma"),
        engineeringMin,
        engineeringMax,
      });
      $("signal-result-label").textContent = "Scaled value";
      $("signal-result").textContent = format(value, 4);
    } else {
      const ma = scale4to20ToMa({
        value: n("signal-value"),
        engineeringMin,
        engineeringMax,
      });
      $("signal-result-label").textContent = "Expected loop current";
      $("signal-result").textContent = `${format(ma, 3)} mA`;
    }
    $("signal-error").textContent = "";
  } catch (error) {
    $("signal-result").textContent = "-";
    $("signal-error").textContent = error.message;
  }
}

function renderPressure() {
  try {
    const to = $("pressure-to").value;
    const converted = convertPressure(n("pressure-value"), $("pressure-from").value, to);
    $("pressure-result").textContent = `${format(converted, 3)} ${to === "mH2O" ? "mH₂O" : to}`;
    $("pressure-error").textContent = "";
  } catch (error) {
    $("pressure-result").textContent = "-";
    $("pressure-error").textContent = error.message;
  }
}

$("tool-picker").addEventListener("change", (event) => showTool(event.target.value));

[
  ["drive-card", renderDrive],
  ["motor-speed-card", renderMotorSpeed],
  ["torque-card", renderTorque],
  ["power-card", renderPower],
  ["heat-card", renderHeat],
  ["cylinder-card", renderCylinder],
  ["belt-card", renderBelt],
  ["gearbox-card", renderGearbox],
  ["gforce-card", renderGForce],
  ["surface-speed-card", renderSurfaceSpeed],
  ["differential-card", renderDifferential],
  ["steam-card", renderSteam],
  ["signal-card", renderSignal],
  ["pressure-card", renderPressure],
].forEach(([id, render]) => $(id).addEventListener("input", render));

document.querySelectorAll("[data-torque-mode]").forEach((button) => {
  button.addEventListener("click", () => setTorqueMode(button.dataset.torqueMode));
});

document.querySelectorAll("[data-power-mode]").forEach((button) => {
  button.addEventListener("click", () => setPowerMode(button.dataset.powerMode));
});

document.querySelectorAll("[data-gearbox-mode]").forEach((button) => {
  button.addEventListener("click", () => setGearboxMode(button.dataset.gearboxMode));
});

document.querySelectorAll("[data-gforce-mode]").forEach((button) => {
  button.addEventListener("click", () => setGForceMode(button.dataset.gforceMode));
});

document.querySelectorAll("[data-surface-mode]").forEach((button) => {
  button.addEventListener("click", () => setSurfaceMode(button.dataset.surfaceMode));
});

document.querySelectorAll("[data-diff-mode]").forEach((button) => {
  button.addEventListener("click", () => setDiffMode(button.dataset.diffMode));
});

document.querySelectorAll("[data-signal-mode]").forEach((button) => {
  button.addEventListener("click", () => setSignalMode(button.dataset.signalMode));
});

renderDrive();
renderMotorSpeed();
renderTorque();
renderPower();
renderHeat();
renderCylinder();
renderBelt();
renderGearbox();
renderGForce();
renderSurfaceSpeed();
renderDifferential();
renderSteam();
renderSignal();
renderPressure();

const initialTool = location.hash.slice(1);
showTool(initialTool);
