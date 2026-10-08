# Adding equations

Open the subject file in `src/lib/equations/`.

### 1. Simple multiplication/division
Use `productEquation` when the relationship can be represented as a coefficient multiplied by powers of variables.

```ts
physics.push(productEquation({
  id: "example",
  domain: "physics",
  category: "Energy",
  title: "Example",
  description: "What it calculates",
  equation: "y = ax²",
  aliases: ["example", "ay squared"],
  outputKey: "y",
  inputs: [
    n("y", "y", "y", "J", "energy"),
    n("a", "a", "a", "1", "dimensionless"),
    n("x", "x", "x", "m", "distance"),
  ],
  factors: [
    { key: "a", power: 1 },
    { key: "x", power: 2 },
  ],
}));
```

The user leaves exactly one field blank and the engine solves for it.

### 2. Anything more complicated
Use `oneBlankEquation` and explicitly return the rearranged expression for the requested target. This is the preferred pattern for quadratics, trigonometry, logarithms, multi-step chemistry relationships and equations with several possible rearrangements.

### 3. Search
Add natural aliases such as `young modulus`, `young's modulus`, `elastic modulus`, `Y modulus`. Search matches title, description, equation, aliases, category and subject.

### 4. Units
If a quantity can be converted, set a `unitGroup`. The UI automatically renders the unit button and converts an entered value when the user changes unit.

For a new unit, add it to `UNIT_TABLE` in `src/lib/engine.ts`.

### 5. Test

```bash
npx tsc --noEmit -p tsconfig.validation.json
```

For an end-to-end manual test, choose the new equation, enter sample values with one field blank, calculate it, then change one of the input units.
