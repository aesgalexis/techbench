# TechBench

A small, practical field toolbox for technicians.

**Live:** https://aesgalexis.github.io/techbench/

TechBench is intentionally simple: no accounts, no backend, no framework, no telemetry. Pick a calculator, get the number, move on.

## Tools

### Mechanical
- **Drive speed / VFD frequency** - pulley ratio, driven RPM, and required motor frequency.
- **Motor speed & slip** - synchronous RPM from frequency and pole count, plus estimated loaded speed.
- **Power & torque** - convert shaft power and RPM to torque, or torque back to power.
- **Cylinder force** - theoretical extension and retraction force from pressure, bore, and rod diameter.
- **Open belt length** - approximate belt length from pulley diameters and center distance.

### Electrical & thermal
- **Three-phase power** - estimate electrical power or current from voltage, power factor, and efficiency.
- **Water heating** - estimate energy and ideal heating time for a water load.

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
