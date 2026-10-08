export type Domain = "physics" | "chemistry" | "maths";

export type UnitGroup =
  | "acceleration" | "angle" | "area" | "amount" | "capacitance" | "charge" | "concentration"
  | "current" | "density" | "distance" | "electricField" | "energy" | "entropyMolar" | "force"
  | "frequency" | "inductance" | "latentHeat" | "length" | "magneticFlux" | "magneticFluxDensity"
  | "mass" | "moment" | "modulus" | "percentage" | "power" | "pressure" | "resistance" | "resistivity"
  | "specificHeat" | "springConstant" | "strain" | "stress" | "temperature" | "time" | "velocity"
  | "viscosity" | "voltage" | "volumeL" | "volumeM3" | "wavelength" | "dimensionless" | "frequencyPerMinute"
  | "molarMass" | "rate" | "enthalpyMolar" | "equilibrium" | "activity";

export type InputDefinition = {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  unitGroup?: UnitGroup;
  placeholder?: string;
  help?: string;
  kind?: "number" | "text";
};

export type Variable = {
  key: string;
  label: string;
  value: number;
  unit: string;
};

export type CalculationStep = {
  title: string;
  equation: string;
  result?: string;
};

export type CalculationResult = {
  ok: boolean;
  domain: Domain;
  title: string;
  result: string;
  numeric?: number;
  unit?: string;
  unitGroup?: UnitGroup;
  variables: Variable[];
  steps: CalculationStep[];
  note?: string;
  error?: string;
};

export type CalculationDefinition = {
  id: string;
  domain: Domain;
  category: string;
  title: string;
  description: string;
  equation: string;
  aliases: string[];
  inputs: InputDefinition[];
  inputMode?: "one-blank" | "all-filled";
  solve: (values: Record<string, string>) => CalculationResult;
};

export const CONSTANTS = {
  g: 9.81,
  G: 6.6743e-11,
  c: 2.99792458e8,
  h: 6.62607015e-34,
  e: 1.602176634e-19,
  kB: 1.380649e-23,
  eps0: 8.8541878128e-12,
  sigmaSB: 5.670374419e-8,
  R: 8.314462618,
  NA: 6.02214076e23,
  F: 96485.33212,
  me: 9.1093837e-31,
  mp: 1.6726219e-27,
  mu0: 1.25663706212e-6,
} as const;

export function fmt(value: number): string {
  if (!Number.isFinite(value)) return "undefined";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs >= 1e8 || abs < 1e-5)) return value.toExponential(5).replace(/\.0+e/, "e");
  return Number(value.toFixed(8)).toLocaleString("en-GB", { maximumFractionDigits: 8 });
}

export function powerText(power: number): string {
  const map: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 0.5: "½", "-0.5": "⁻½", "-1": "⁻¹", "-2": "⁻²" };
  return map[power] ?? `^${power}`;
}

export const UNIT_TABLE: Record<UnitGroup, Record<string, { factor: number; offset?: number; label: string }>> = {
  acceleration: {
    "m/s²": { label: "m/s²", factor: 1 },
    "km/s²": { label: "km/s²", factor: 1000 },
    "km/h²": { label: "km/h²", factor: 1 / 12960 },
    "ft/s²": { label: "ft/s²", factor: 0.3048 },
  },
  angle: { "°": { label: "°", factor: Math.PI / 180 }, rad: { label: "rad", factor: 1 } },
  area: {
    "m²": { label: "m²", factor: 1 }, "cm²": { label: "cm²", factor: 1e-4 },
    "mm²": { label: "mm²", factor: 1e-6 }, "km²": { label: "km²", factor: 1e6 },
  },
  amount: { mol: { label: "mol", factor: 1 }, mmol: { label: "mmol", factor: 1e-3 } },
  capacitance: { F: { label: "F", factor: 1 }, mF: { label: "mF", factor: 1e-3 }, μF: { label: "μF", factor: 1e-6 }, nF: { label: "nF", factor: 1e-9 }, pF: { label: "pF", factor: 1e-12 } },
  charge: { C: { label: "C", factor: 1 }, μC: { label: "μC", factor: 1e-6 }, nC: { label: "nC", factor: 1e-9 }, e: { label: "e", factor: CONSTANTS.e } },
  concentration: { "mol dm⁻³": { label: "mol dm⁻³", factor: 1 }, "mol m⁻³": { label: "mol m⁻³", factor: 1e-3 }, "mol L⁻¹": { label: "mol L⁻¹", factor: 1 } },
  current: { A: { label: "A", factor: 1 }, mA: { label: "mA", factor: 1e-3 }, μA: { label: "μA", factor: 1e-6 } },
  density: { "kg/m³": { label: "kg/m³", factor: 1 }, "g/cm³": { label: "g/cm³", factor: 1000 }, "g/mL": { label: "g/mL", factor: 1000 } },
  distance: { m: { label: "m", factor: 1 }, km: { label: "km", factor: 1000 }, cm: { label: "cm", factor: 0.01 }, mm: { label: "mm", factor: 0.001 }, μm: { label: "μm", factor: 1e-6 }, nm: { label: "nm", factor: 1e-9 } },
  electricField: { "N/C": { label: "N/C", factor: 1 }, "V/m": { label: "V/m", factor: 1 } },
  energy: { J: { label: "J", factor: 1 }, kJ: { label: "kJ", factor: 1000 }, MJ: { label: "MJ", factor: 1e6 }, eV: { label: "eV", factor: CONSTANTS.e }, keV: { label: "keV", factor: CONSTANTS.e * 1e3 }, MeV: { label: "MeV", factor: CONSTANTS.e * 1e6 } },
  entropyMolar: { "J mol⁻¹ K⁻¹": { label: "J mol⁻¹ K⁻¹", factor: 1 }, "kJ mol⁻¹ K⁻¹": { label: "kJ mol⁻¹ K⁻¹", factor: 1000 } },
  force: { N: { label: "N", factor: 1 }, kN: { label: "kN", factor: 1000 }, dyn: { label: "dyn", factor: 1e-5 } },
  frequency: { Hz: { label: "Hz", factor: 1 }, kHz: { label: "kHz", factor: 1000 }, MHz: { label: "MHz", factor: 1e6 }, rpm: { label: "rpm", factor: 1 / 60 } },
  frequencyPerMinute: { "s⁻¹": { label: "s⁻¹", factor: 1 }, "min⁻¹": { label: "min⁻¹", factor: 1 / 60 } },
  inductance: { H: { label: "H", factor: 1 }, mH: { label: "mH", factor: 1e-3 }, μH: { label: "μH", factor: 1e-6 } },
  latentHeat: { "J kg⁻¹": { label: "J kg⁻¹", factor: 1 }, "kJ kg⁻¹": { label: "kJ kg⁻¹", factor: 1000 }, "J g⁻¹": { label: "J g⁻¹", factor: 1000 } },
  length: { m: { label: "m", factor: 1 }, cm: { label: "cm", factor: 0.01 }, mm: { label: "mm", factor: 0.001 }, km: { label: "km", factor: 1000 } },
  magneticFlux: { Wb: { label: "Wb", factor: 1 }, mWb: { label: "mWb", factor: 1e-3 }, μWb: { label: "μWb", factor: 1e-6 } },
  magneticFluxDensity: { T: { label: "T", factor: 1 }, mT: { label: "mT", factor: 1e-3 }, μT: { label: "μT", factor: 1e-6 } },
  mass: { kg: { label: "kg", factor: 1 }, g: { label: "g", factor: 1e-3 }, mg: { label: "mg", factor: 1e-6 }, tonne: { label: "tonne", factor: 1000 } },
  moment: { "N m": { label: "N m", factor: 1 }, "kN m": { label: "kN m", factor: 1000 } },
  modulus: { Pa: { label: "Pa", factor: 1 }, kPa: { label: "kPa", factor: 1e3 }, MPa: { label: "MPa", factor: 1e6 }, GPa: { label: "GPa", factor: 1e9 } },
  percentage: { "%": { label: "%", factor: 1 } },
  power: { W: { label: "W", factor: 1 }, kW: { label: "kW", factor: 1000 }, MW: { label: "MW", factor: 1e6 } },
  pressure: { Pa: { label: "Pa", factor: 1 }, kPa: { label: "kPa", factor: 1e3 }, MPa: { label: "MPa", factor: 1e6 }, GPa: { label: "GPa", factor: 1e9 }, bar: { label: "bar", factor: 1e5 }, atm: { label: "atm", factor: 101325 } },
  resistance: { "Ω": { label: "Ω", factor: 1 }, kΩ: { label: "kΩ", factor: 1000 }, MΩ: { label: "MΩ", factor: 1e6 } },
  resistivity: { "Ω m": { label: "Ω m", factor: 1 }, "Ω mm² m⁻¹": { label: "Ω mm² m⁻¹", factor: 1e-6 } },
  specificHeat: { "J kg⁻¹ K⁻¹": { label: "J kg⁻¹ K⁻¹", factor: 1 }, "kJ kg⁻¹ K⁻¹": { label: "kJ kg⁻¹ K⁻¹", factor: 1000 } },
  springConstant: { "N/m": { label: "N/m", factor: 1 }, "N/cm": { label: "N/cm", factor: 100 } },
  strain: { "1": { label: "1", factor: 1 }, "%": { label: "%", factor: 0.01 } },
  stress: { Pa: { label: "Pa", factor: 1 }, kPa: { label: "kPa", factor: 1e3 }, MPa: { label: "MPa", factor: 1e6 }, GPa: { label: "GPa", factor: 1e9 } },
  temperature: { K: { label: "K", factor: 1, offset: 0 }, "°C": { label: "°C", factor: 1, offset: 273.15 }, "°F": { label: "°F", factor: 5 / 9, offset: 255.3722222222222 } },
  time: { s: { label: "s", factor: 1 }, min: { label: "min", factor: 60 }, h: { label: "h", factor: 3600 }, day: { label: "day", factor: 86400 } },
  velocity: { "m/s": { label: "m/s", factor: 1 }, "km/h": { label: "km/h", factor: 1 / 3.6 }, "mph": { label: "mph", factor: 0.44704 }, "cm/s": { label: "cm/s", factor: 0.01 } },
  viscosity: { "Pa s": { label: "Pa s", factor: 1 }, "mPa s": { label: "mPa s", factor: 1e-3 }, "N s m⁻²": { label: "N s m⁻²", factor: 1 } },
  voltage: { V: { label: "V", factor: 1 }, mV: { label: "mV", factor: 1e-3 }, kV: { label: "kV", factor: 1000 } },
  volumeL: { L: { label: "L", factor: 1 }, mL: { label: "mL", factor: 1e-3 }, "dm³": { label: "dm³", factor: 1 }, "cm³": { label: "cm³", factor: 1e-3 } },
  volumeM3: { "m³": { label: "m³", factor: 1 }, "dm³": { label: "dm³", factor: 1e-3 }, "cm³": { label: "cm³", factor: 1e-6 }, L: { label: "L", factor: 1e-3 } },
  wavelength: { m: { label: "m", factor: 1 }, mm: { label: "mm", factor: 1e-3 }, μm: { label: "μm", factor: 1e-6 }, nm: { label: "nm", factor: 1e-9 } },
  dimensionless: { "1": { label: "1", factor: 1 }, "%": { label: "%", factor: 0.01 } },
  molarMass: { "g mol⁻¹": { label: "g mol⁻¹", factor: 1 }, "kg mol⁻¹": { label: "kg mol⁻¹", factor: 1000 } },
  rate: { "mol dm⁻³ s⁻¹": { label: "mol dm⁻³ s⁻¹", factor: 1 }, "mol dm⁻³ min⁻¹": { label: "mol dm⁻³ min⁻¹", factor: 1 / 60 } },
  enthalpyMolar: { "kJ mol⁻¹": { label: "kJ mol⁻¹", factor: 1 }, "J mol⁻¹": { label: "J mol⁻¹", factor: 1e-3 } },
  equilibrium: { "mol dm⁻³": { label: "mol dm⁻³", factor: 1 }, "bar": { label: "bar", factor: 1 } },
  activity: { "1": { label: "1", factor: 1 } },
};

export function unitOptionsFor(input: InputDefinition): string[] {
  return input.unitGroup ? Object.keys(UNIT_TABLE[input.unitGroup]) : [input.unit];
}

export function unitGroupFor(input: InputDefinition): UnitGroup | undefined {
  return input.unitGroup;
}

export function convertUnitValue(value: number, group: UnitGroup, fromUnit: string, toUnit: string): number {
  const from = UNIT_TABLE[group]?.[fromUnit];
  const to = UNIT_TABLE[group]?.[toUnit];
  if (!from || !to) return value;
  const base = group === "temperature" ? value * from.factor + (from.offset ?? 0) : value * from.factor;
  return group === "temperature" ? (base - (to.offset ?? 0)) / to.factor : base / to.factor;
}

export function categoryFor(definition: CalculationDefinition): string {
  return definition.category;
}

function fail(definition: CalculationDefinition, message: string, values: Record<string, string> = {}): CalculationResult {
  return {
    ok: false,
    domain: definition.domain,
    title: "",
    result: "",
    variables: definition.inputs.filter((input) => Boolean(values[input.key]?.trim())).map((input) => ({ key: input.key, label: input.label, value: Number(values[input.key]), unit: input.unit })),
    steps: [],
    error: message,
  };
}

function num(value: string | undefined, label: string): number {
  if (value === undefined || value.trim() === "") throw new Error(`Enter ${label}.`);
  const parsed = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a number.`);
  return parsed;
}

function finish(definition: CalculationDefinition, values: Record<string, string>, title: string, numeric: number, unit: string, unitGroup: UnitGroup | undefined, steps: CalculationStep[], note?: string): CalculationResult {
  return {
    ok: true,
    domain: definition.domain,
    title,
    numeric,
    unit,
    unitGroup,
    result: `${fmt(numeric)}${unit ? ` ${unit}` : ""}`,
    variables: definition.inputs.filter((input) => Boolean(values[input.key]?.trim())).map((input) => ({ key: input.key, label: input.label, value: Number(values[input.key]), unit: input.unit })),
    steps,
    note,
  };
}

export type ProductFactor = { key: string; power: number };

export function productEquation(config: {
  id: string;
  domain: Domain;
  category: string;
  title: string;
  description: string;
  equation: string;
  aliases?: string[];
  inputs: InputDefinition[];
  outputKey: string;
  coefficient?: number;
  factors: ProductFactor[];
  note?: string;
}): CalculationDefinition {
  const definition: CalculationDefinition = {
    ...config,
    aliases: config.aliases ?? [],
    inputMode: "one-blank",
    solve(values) {
      const missing = config.inputs.filter((input) => !values[input.key]?.trim()).map((input) => input.key);
      if (missing.length !== 1) return fail(definition, "Leave exactly one variable blank — that is the value to find.", values);
      const target = missing[0];
      const targetInput = config.inputs.find((input) => input.key === target)!;
      const outputInput = config.inputs.find((input) => input.key === config.outputKey)!;
      const targetFactor = config.factors.find((item) => item.key === target);
      try {
        if (target === config.outputKey) {
          let answer = config.coefficient ?? 1;
          const parts: string[] = [];
          for (const factor of config.factors) {
            const input = config.inputs.find((item) => item.key === factor.key)!;
            const value = num(values[factor.key], input.label);
            answer *= value ** factor.power;
            parts.push(factor.power === 1 ? `(${fmt(value)})` : `(${fmt(value)})${powerText(factor.power)}`);
          }
          const expression = (config.coefficient ?? 1) === 1 ? parts.join(" × ") : `${fmt(config.coefficient ?? 1)} × ${parts.join(" × ")}`;
          return finish(definition, values, outputInput.label, answer, outputInput.unit, outputInput.unitGroup, [
            { title: "Formula", equation: config.equation },
            { title: "Substitute", equation: `${outputInput.symbol} = ${expression}`, result: `${fmt(answer)} ${outputInput.unit}` },
          ], config.note);
        }
        if (!targetFactor || targetFactor.power === 0) throw new Error("This equation cannot be rearranged for that variable.");
        const output = num(values[config.outputKey], outputInput.label);
        let denominator = config.coefficient ?? 1;
        const known: string[] = [];
        for (const factor of config.factors) {
          if (factor.key === target) continue;
          const input = config.inputs.find((item) => item.key === factor.key)!;
          const value = num(values[factor.key], input.label);
          denominator *= value ** factor.power;
          known.push(factor.power === 1 ? `(${fmt(value)})` : `(${fmt(value)})${powerText(factor.power)}`);
        }
        const base = output / denominator;
        if (targetFactor.power !== 1 && base < 0) throw new Error("No real solution exists for these values.");
        const answer = targetFactor.power === 1 ? base : base ** (1 / targetFactor.power);
        return finish(definition, values, targetInput.label, answer, targetInput.unit, targetInput.unitGroup, [
          { title: "Formula", equation: config.equation },
          { title: "Rearrange", equation: targetFactor.power === 1 ? `${targetInput.symbol} = ${outputInput.symbol} / (${known.join(" × ") || "1"})` : `${targetInput.symbol} = (${fmt(base)})${powerText(1 / targetFactor.power)}` },
          { title: "Substitute", equation: `${targetInput.symbol} = ${fmt(answer)}`, result: `${fmt(answer)} ${targetInput.unit}` },
        ], config.note);
      } catch (error) {
        return fail(definition, error instanceof Error ? error.message : "Check the values and try again.", values);
      }
    },
  };
  return definition;
}

export function customEquation(config: Omit<CalculationDefinition, "solve" | "aliases"> & { aliases?: string[]; solve: CalculationDefinition["solve"] }): CalculationDefinition {
  return { ...config, aliases: config.aliases ?? [] };
}

export function oneBlankEquation(config: {
  id: string;
  domain: Domain;
  category: string;
  title: string;
  description: string;
  equation: string;
  aliases?: string[];
  inputs: InputDefinition[];
  derive: (target: string, values: Record<string, number>) => { value: number; title?: string; unit?: string; unitGroup?: UnitGroup; rearranged?: string };
  note?: string;
}): CalculationDefinition {
  const definition: CalculationDefinition = {
    ...config,
    aliases: config.aliases ?? [],
    inputMode: "one-blank",
    solve(values) {
      const missing = config.inputs.filter((input) => !values[input.key]?.trim()).map((input) => input.key);
      if (missing.length !== 1) return fail(definition, "Leave exactly one variable blank — that is the value to find.", values);
      const target = missing[0];
      try {
        const numericValues: Record<string, number> = {};
        for (const input of config.inputs) {
          if (input.key !== target) numericValues[input.key] = num(values[input.key], input.label);
        }
        const derived = config.derive(target, numericValues);
        if (!Number.isFinite(derived.value)) throw new Error("These values do not give a finite solution.");
        const targetInput = config.inputs.find((input) => input.key === target)!;
        const title = derived.title ?? targetInput.label;
        const unit = derived.unit ?? targetInput.unit;
        const unitGroup = derived.unitGroup ?? targetInput.unitGroup;
        return finish(definition, values, title, derived.value, unit, unitGroup, [
          { title: "Formula", equation: config.equation },
          ...(derived.rearranged ? [{ title: "Rearrange", equation: derived.rearranged }] : []),
          { title: "Answer", equation: `${targetInput.symbol} = ${fmt(derived.value)}`, result: `${fmt(derived.value)} ${unit}`.trim() },
        ], config.note);
      } catch (error) {
        return fail(definition, error instanceof Error ? error.message : "Check the values and try again.", values);
      }
    },
  };
  return definition;
}
