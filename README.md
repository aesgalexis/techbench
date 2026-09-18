# TechBench

A small, practical field toolbox for technicians.

TechBench is intentionally simple: no accounts, no backend, no framework, no telemetry. It is a collection of fast calculators that work in the browser and are useful around real machines.

## Tools

- **Drive speed** — pulley ratio, driven RPM, and required motor frequency.
- **Three-phase power** — estimate electrical power or current from voltage, power factor, and efficiency.
- **Water heating** — estimate energy and ideal heating time for a water load.
- **Pressure** — convert between bar, kPa, MPa, psi, and mH₂O.

## Philosophy

TechBench is not meant to replace engineering judgement, manuals, measurements, or safety procedures. It is a quick field reference for calculations that are easy to get wrong when done in your head.

The project is deliberately dependency-free and deployable as a static site on GitHub Pages.

## Development

Open `index.html` through a local static server, or use any editor with a Live Server extension.

Run the calculation tests with Node:

```bash
node tests.mjs
```

No install step is required.

## Project structure

```
index.html       UI
styles.css       visual system
app.js           browser interactions
calculators.js   pure calculation functions
tests.mjs        zero-dependency tests
```

## Status

Early public build. More tools will be added when they solve an actual field problem.

## License

MIT
