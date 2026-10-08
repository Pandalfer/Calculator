# Calculator

A dark-only personal calculator for OCR A Level Maths / Further Maths and Pearson Edexcel A Level Physics / Chemistry.

## Run

```bash
npm install
npm run dev
```

## Equation catalogue

The catalogue is data-driven and split into:

- `src/lib/equations/physics.ts`
- `src/lib/equations/chemistry.ts`
- `src/lib/equations/maths.ts`

The current app contains 106 Physics, 56 Chemistry and 177 Maths calculation definitions. The Maths library deliberately combines OCR A Level Maths and Further Maths into one subject.

Some A Level syllabus content is proof, interpretation, definitions or practical methodology rather than a numerical equation, so it is not represented as a calculator route.

## Adding a new equation

The easiest pattern is `oneBlankEquation`: the user fills every value except the value they want to find. Search automatically sees the title, description, equation, category and aliases.

Example:

```ts
physics.push(oneBlankEquation({
  id: "spring-energy",
  domain: "physics",
  category: "Energy",
  title: "Spring energy",
  description: "Energy stored in a spring",
  equation: "E = ½kx²",
  aliases: ["spring energy", "elastic energy"],
  inputs: [
    n("E", "Energy", "E", "J", "energy"),
    n("k", "Spring constant", "k", "N/m", "springConstant"),
    n("x", "Extension", "x", "m", "distance"),
  ],
  derive: (target, v) => ({
    value: target === "E"
      ? 0.5 * v.k * v.x ** 2
      : target === "k"
      ? (2 * v.E) / (v.x ** 2)
      : Math.sqrt((2 * v.E) / v.k),
    rearranged: target === "E"
      ? "E = ½kx²"
      : target === "k"
      ? "k = 2E/x²"
      : "x = √(2E/k)",
  }),
}));
```

For a simple product/quotient equation, `productEquation` is even shorter. It handles the output and rearrangement automatically when exactly one input is blank.

```ts
physics.push(productEquation({
  id: "density",
  domain: "physics",
  category: "Materials",
  title: "Density",
  description: "Mass per unit volume",
  equation: "ρ = m/V",
  aliases: ["density", "mass density"],
  outputKey: "rho",
  inputs: [
    n("rho", "Density", "ρ", "kg/m³", "density"),
    n("m", "Mass", "m", "kg", "mass"),
    n("V", "Volume", "V", "m³", "volumeM3"),
  ],
  factors: [
    { key: "m", power: 1 },
    { key: "V", power: -1 },
  ],
}));
```

### Units

Give an input a `unitGroup` when the value can be converted, for example `velocity`, `distance`, `pressure`, `energy`, `mass` or `temperature`. Add new units to `UNIT_TABLE` in `src/lib/engine.ts`.

### Checklist

1. Give the equation a unique `id`.
2. Add useful aliases because they are what make search forgiving.
3. Give every input its unit and, where relevant, a `unitGroup`.
4. Make sure every possible blank target has a correct `derive` branch when using `oneBlankEquation`.
5. Run `npx tsc --noEmit -p tsconfig.validation.json`.
