import {
  drivenRpm,
  requiredFrequency,
  threePhasePowerKw,
  threePhaseCurrentA,
  waterHeating,
  convertPressure,
} from "./calculators.js";

const $ = (id) => document.getElementById(id);
const n = (id) => Number($(id).value);

function format(value, digits = 2) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
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

function renderPressure() {
  try {
    const to = $("pressure-to").value;
    const converted = convertPressure(
      n("pressure-value"),
      $("pressure-from").value,
      to,
    );

    $("pressure-result").textContent = `${format(converted, 3)} ${to === "mH2O" ? "mH₂O" : to}`;
    $("pressure-error").textContent = "";
  } catch (error) {
    $("pressure-result").textContent = "—";
    $("pressure-error").textContent = error.message;
  }
}

$("drive-card").addEventListener("input", renderDrive);
$("power-card").addEventListener("input", renderPower);
$("heat-card").addEventListener("input", renderHeat);
$("pressure-card").addEventListener("input", renderPressure);

document.querySelectorAll("[data-power-mode]").forEach((button) => {
  button.addEventListener("click", () => setPowerMode(button.dataset.powerMode));
});

renderDrive();
renderPower();
renderHeat();
renderPressure();
