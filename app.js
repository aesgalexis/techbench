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
  convertPressure,
} from "./calculators.js";

const $ = (id) => document.getElementById(id);
const n = (id) => Number($(id).value);

function format(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
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
    $("drive-rpm").textContent = "—";
    $("drive-hz").textContent = "—";
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
    $("speed-sync").textContent = "—";
    $("speed-loaded").textContent = "—";
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
    $("torque-result").textContent = "—";
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
    $("power-result").textContent = "—";
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
    $("heat-energy").textContent = "—";
    $("heat-time").textContent = "—";
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
    $("cyl-extend").textContent = "—";
    $("cyl-retract").textContent = "—";
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
    $("belt-mm").textContent = "—";
    $("belt-m").textContent = "—";
    $("belt-error").textContent = error.message;
  }
}

function renderPressure() {
  try {
    const to = $("pressure-to").value;
    const converted = convertPressure(n("pressure-value"), $("pressure-from").value, to);
    $("pressure-result").textContent = `${format(converted, 3)} ${to === "mH2O" ? "mH₂O" : to}`;
    $("pressure-error").textContent = "";
  } catch (error) {
    $("pressure-result").textContent = "—";
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
  ["pressure-card", renderPressure],
].forEach(([id, render]) => $(id).addEventListener("input", render));

document.querySelectorAll("[data-torque-mode]").forEach((button) => {
  button.addEventListener("click", () => setTorqueMode(button.dataset.torqueMode));
});

document.querySelectorAll("[data-power-mode]").forEach((button) => {
  button.addEventListener("click", () => setPowerMode(button.dataset.powerMode));
});

renderDrive();
renderMotorSpeed();
renderTorque();
renderPower();
renderHeat();
renderCylinder();
renderBelt();
renderPressure();

const initialTool = location.hash.slice(1);
showTool(initialTool);
