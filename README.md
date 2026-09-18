# TechBench

A small, practical field toolbox for technicians.

**Live:** https://aesgalexis.github.io/techbench/

**Accuracy and sources:** https://aesgalexis.github.io/techbench/accuracy.html

TechBench is intentionally simple: no accounts, no backend, no framework, no telemetry. Pick a calculator, get the number, move on.

## Tools

### Mechanical
- **Drive speed / VFD frequency** - pulley ratio, driven RPM, and required motor frequency.
- **Motor speed & slip** - synchronous RPM from frequency and pole count, plus estimated loaded speed.
- **Power & torque** - convert shaft power and RPM to torque, or torque back to power.
- **Cylinder force** - theoretical extension and retraction force from pressure, bore, and rod diameter.
- **Open belt length** - approximate belt length from pulley diameters and center distance.
- **Gearbox ratio** - calculate output RPM from a reduction ratio, or the ratio required for a target output speed.

### Laundry & process
- **Washer G-force** - calculate extraction G from drum diameter and RPM, or RPM required for a target G.
- **Roller surface speed** - convert roller diameter and RPM to m/min, or work backwards from line speed.
- **Speed differential** - compare two line speeds or calculate a target secondary speed from a percentage differential.
- **Steam saturation temperature** - approximate saturated-steam temperature from bar/psi, with gauge or absolute pressure.
- **Water heating** - estimate energy and ideal heating time for a water load.

### Electrical & instrumentation
- **Three-phase power** - estimate electrical power or current from voltage, power factor, and efficiency.
- **4-20 mA scaler** - convert loop current to engineering units or calculate the expected current for a known value.

### Conversions
- **Pressure** - convert between bar, kPa, MPa, psi, and mH₂O.

## Philosophy

TechBench is not meant to replace engineering judgement, manuals, measurements, or safety procedures. It is a quick field reference for calculations that are easy to get wrong when done in your head.

The project is deliberately dependency-free and deployed as a static site on GitHub Pages.

## Development

Open `index.html` through a local static server, or use any editor with a Live Server extension.

Run the calculation tests with Node:

```bash
node tests.mjs
```

No install step is required.

## Project structure

```
index.html       UI and calculator selector
styles.css       visual system
app.js           browser interactions
calculators.js   pure calculation functions
tests.mjs        zero-dependency tests
```

## Status

Early public build. More tools are added when they solve an actual field problem.

## License

MIT
