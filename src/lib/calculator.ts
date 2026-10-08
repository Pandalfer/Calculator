import { CHEMISTRY } from "@/lib/equations/chemistry";
import { MATHS } from "@/lib/equations/maths";
import { PHYSICS } from "@/lib/equations/physics";
import {
  categoryFor,
  CONSTANTS,
  convertUnitValue,
  type CalculationDefinition,
  type CalculationResult,
  type Domain,
  fmt,
  customEquation,
  productEquation,
  type InputDefinition,
  type UnitGroup,
  UNIT_TABLE,
  unitGroupFor,
  unitOptionsFor,
} from "@/lib/engine";

export * from "@/lib/engine";

export const CALCULATIONS: CalculationDefinition[] = [...PHYSICS, ...CHEMISTRY, ...MATHS];

export function getCalculations(): CalculationDefinition[] {
  return CALCULATIONS;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/(\p{L})'s\b/gu, "$1")
    .replace(/(\p{L})'(\p{L})/gu, "$1$2")
    .replace(/[–—−]/g, "-")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function searchCalculations(query: string, domain: "all" | Domain, category = "all"): CalculationDefinition[] {
  const needle = normalizeSearchText(query);
  return CALCULATIONS
    .filter((item) => domain === "all" || item.domain === domain)
    .filter((item) => category === "all" || item.category === category)
    .filter((item) => !needle || normalizeSearchText([item.title, item.description, item.equation, ...item.aliases, item.category, item.domain].join(" ")).includes(needle))
    .sort((a, b) => {
      if (!needle) return a.title.localeCompare(b.title);
      const aTitle = normalizeSearchText(a.title);
      const bTitle = normalizeSearchText(b.title);
      const aScore = aTitle === needle ? 0 : aTitle.startsWith(needle) ? 1 : aTitle.includes(needle) ? 2 : 3;
      const bScore = bTitle === needle ? 0 : bTitle.startsWith(needle) ? 1 : bTitle.includes(needle) ? 2 : 3;
      return aScore - bScore || a.title.localeCompare(b.title);
    });
}

export function normalizeValuesForCalculation(definition: CalculationDefinition, values: Record<string, string>, units: Record<string, string>): Record<string, string> {
  const normalized = { ...values };
  for (const input of definition.inputs) {
    const raw = values[input.key];
    if (!raw?.trim() || !input.unitGroup) continue;
    const from = units[input.key] ?? input.unit;
    if (from === input.unit) continue;
    const numeric = Number(raw.replace(/,/g, ""));
    if (Number.isFinite(numeric)) normalized[input.key] = String(convertUnitValue(numeric, input.unitGroup, from, input.unit));
  }
  return normalized;
}

export function solveCalculation(definition: CalculationDefinition, values: Record<string, string>): CalculationResult {
  return definition.solve(values);
}

export function countByDomain(domain: Domain): number {
  return CALCULATIONS.filter((item) => item.domain === domain).length;
}

export function categoriesForDomain(domain: Domain): string[] {
  return ["all", ...Array.from(new Set(CALCULATIONS.filter((item) => item.domain === domain).map(categoryFor))).sort((a, b) => a.localeCompare(b))];
}

export const ENGINE_EXPORTS = { CONSTANTS, UNIT_TABLE, fmt, customEquation, productEquation, unitGroupFor, unitOptionsFor };
