'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  categoryFor,
  categoriesForDomain,
  convertUnitValue,
  getCalculations,
  normalizeValuesForCalculation,
  searchCalculations,
  solveCalculation,
  unitGroupFor,
  unitOptionsFor,
  type CalculationDefinition,
  type CalculationResult,
  type Domain,
  type InputDefinition,
} from '@/lib/calculator';

const SUBJECTS: Array<{ key: Domain | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'maths', label: 'Maths' },
];

function Formula({ text, large = false }: { text: string; large?: boolean }) {
  const spacedSlash = text.indexOf(' / ');
  const parenthesizedSlash = text.indexOf('/(');
  const slash =
    spacedSlash > -1
      ? spacedSlash
      : parenthesizedSlash > -1
        ? parenthesizedSlash
        : -1;
  const slashLength = spacedSlash > -1 ? 3 : 1;
  const renderPiece = (piece: string) => {
    const tokens = piece.split(/(\^[A-Za-z0-9+−-]+)/g);
    return tokens.map((token, index) => {
      const match = token.match(/^\^([A-Za-z0-9+−-]+)$/);
      return match ? (
        <sup key={index}>{match[1]}</sup>
      ) : (
        <span key={index}>{token}</span>
      );
    });
  };

  return (
    <span
      className={large ? 'formula formula-large' : 'formula'}
      aria-label={text}
    >
      {slash > -1 ? (
        <>
          {renderPiece(text.slice(0, slash))}
          <span className="fraction" aria-hidden="true">
            <span className="fraction-top">
              {renderPiece(text.slice(slash + slashLength))}
            </span>
          </span>
        </>
      ) : (
        renderPiece(text)
      )}
    </span>
  );
}

function UnitPicker({
  input,
  value,
  onChange,
  compact = false,
}: {
  input: InputDefinition;
  value: string;
  onChange: (unit: string) => void;
  compact?: boolean;
}) {
  const options = unitOptionsFor(input);
  const [open, setOpen] = useState(false);
  const [mobileMenuStyle, setMobileMenuStyle] = useState<
    React.CSSProperties | undefined
  >(undefined);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      )
        setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setMobileMenuStyle(undefined);
      return;
    }

    const updateMobilePosition = () => {
      if (window.innerWidth > 700) {
        setMobileMenuStyle(undefined);
        return;
      }

      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const menuWidth = Math.min(190, window.innerWidth - 24);
      const menuHeight = Math.min(230, options.length * 34 + 10);
      const gap = 5;

      let left = rect.right - menuWidth;
      left = Math.max(12, Math.min(left, window.innerWidth - menuWidth - 12));

      const roomBelow = window.innerHeight - rect.bottom;
      const top =
        roomBelow >= menuHeight + gap
          ? rect.bottom + gap
          : Math.max(12, rect.top - menuHeight - gap);

      setMobileMenuStyle({
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        right: 'auto',
        bottom: 'auto',
      });
    };

    updateMobilePosition();
    window.addEventListener('resize', updateMobilePosition);
    window.addEventListener('scroll', updateMobilePosition, true);

    return () => {
      window.removeEventListener('resize', updateMobilePosition);
      window.removeEventListener('scroll', updateMobilePosition, true);
    };
  }, [open, options.length]);

  if (options.length <= 1) return <span className="unit-label">{value}</span>;

  return (
    <div className={`unit-picker${compact ? ' compact' : ''}`} ref={rootRef}>
      <button
        type="button"
        className="unit-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Change unit for ${input.label}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <svg
          viewBox="0 0 12 8"
          className={open ? 'unit-chevron open' : 'unit-chevron'}
          aria-hidden="true"
        >
          <path d="M1 1.5 6 6.5 11 1.5" />
        </svg>
      </button>
      {open ? (
        mobileMenuStyle ? (
          createPortal(
            <div
              ref={menuRef}
              className="unit-menu unit-menu-mobile"
              role="listbox"
              aria-label={`Units for ${input.label}`}
              style={mobileMenuStyle}
            >
              {options.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  role="option"
                  aria-selected={unit === value}
                  className={
                    unit === value ? 'unit-option selected' : 'unit-option'
                  }
                  onClick={() => {
                    setOpen(false);
                    onChange(unit);
                  }}
                >
                  <span>{unit}</span>
                  {unit === value ? (
                    <span className="unit-check" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        ) : (
          <div
            ref={menuRef}
            className="unit-menu"
            role="listbox"
            aria-label={`Units for ${input.label}`}
          >
            {options.map((unit) => (
              <button
                key={unit}
                type="button"
                role="option"
                aria-selected={unit === value}
                className={
                  unit === value ? 'unit-option selected' : 'unit-option'
                }
                onClick={() => {
                  setOpen(false);
                  onChange(unit);
                }}
              >
                <span>{unit}</span>
                {unit === value ? (
                  <span className="unit-check" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

export default function CalculatorApp() {
  const calculations = useMemo(
    () =>
      Array.from(
        new Map(getCalculations().map((item) => [item.id, item])).values(),
      ),
    [],
  );
  const [domain, setDomain] = useState<'all' | Domain>('all');
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CalculationDefinition | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [units, setUnits] = useState<Record<string, string>>({});
  const [answer, setAnswer] = useState<CalculationResult | null>(null);
  const [answerUnit, setAnswerUnit] = useState('');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem('calc-studio-recent') ?? '[]',
      );
      if (Array.isArray(saved))
        setRecentIds(
          saved
            .filter((id): id is string => typeof id === 'string')
            .slice(0, 7),
        );
    } catch {
      setRecentIds([]);
    }
  }, []);

  const categories = useMemo(
    () => (domain === 'all' ? [] : categoriesForDomain(domain)),
    [domain],
  );
  const matches = useMemo(
    () => searchCalculations(query, domain, category),
    [query, domain, category],
  );
  const recent = useMemo(
    () =>
      recentIds
        .map((id) => calculations.find((item) => item.id === id))
        .filter(Boolean) as CalculationDefinition[],
    [calculations, recentIds],
  );
  const shownMatches = useMemo(
    () => (showAll ? matches : matches.slice(0, 14)),
    [matches, showAll],
  );

  function pushRecent(id: string) {
    setRecentIds((current) => {
      const next = [id, ...current.filter((item) => item !== id)].slice(0, 7);
      try {
        localStorage.setItem('calc-studio-recent', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function removeRecent(id: string) {
    setRecentIds((current) => {
      const next = current.filter((item) => item !== id);
      try {
        localStorage.setItem('calc-studio-recent', JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function choose(definition: CalculationDefinition) {
    setSelected(definition);
    setValues({});
    setUnits(
      Object.fromEntries(
        definition.inputs.map((input) => [input.key, input.unit]),
      ),
    );
    setAnswer(null);
    setAnswerUnit('');
    pushRecent(definition.id);
  }

  function backToEquations() {
    setSelected(null);
    setValues({});
    setUnits({});
    setAnswer(null);
    setAnswerUnit('');
  }

  function changeUnit(key: string, nextUnit: string) {
    if (!selected) return;
    // Changing the displayed unit must not change the number the user entered.
    // The value is interpreted in the newly selected unit when the calculation runs.
    setUnits((current) => ({ ...current, [key]: nextUnit }));
    setAnswer(null);
  }

  function calculate() {
    if (!selected) return;
    const solved = solveCalculation(
      selected,
      normalizeValuesForCalculation(selected, values, units),
    );
    setAnswer(solved);
    setAnswerUnit(solved.ok ? (solved.unit ?? '') : '');
  }

  function clear() {
    if (!selected) return;
    setValues({});
    setUnits(
      Object.fromEntries(
        selected.inputs.map((input) => [input.key, input.unit]),
      ),
    );
    setAnswer(null);
    setAnswerUnit('');
  }

  const answerInput: InputDefinition | null = answer?.unit
    ? {
        key: 'answer',
        label: answer.title,
        symbol: '',
        unit: answer.unit,
        unitGroup: answer.unitGroup,
      }
    : null;
  const resultOptions = answerInput ? unitOptionsFor(answerInput) : [];
  const shownAnswer =
    answer?.ok && answer.numeric !== undefined
      ? (() => {
          const base = answer.unit ?? '';
          const target = answerUnit || base;
          const group = answer.unitGroup;
          const converted = group
            ? convertUnitValue(answer.numeric, group, base, target)
            : answer.numeric;
          return `${Number(converted.toFixed(10))}${target ? ` ${target}` : ''}`;
        })()
      : '';

  return (
    <main className="page">
      <div className="app-shell">
        {!selected ? (
          <section className="picker" aria-label="Choose an equation">
            <div className="search-wrap">
              <svg
                viewBox="0 0 24 24"
                className="search-icon"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.2" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                value={query}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setQuery(event.target.value);
                  setShowAll(false);
                }}
                placeholder="Search equations"
                autoComplete="off"
                aria-label="Search equations"
              />
              {query ? (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : null}
            </div>

            <div className="subject-row" role="tablist" aria-label="Subjects">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject.key}
                  className={
                    domain === subject.key
                      ? 'subject-tab active'
                      : 'subject-tab'
                  }
                  onClick={() => {
                    setDomain(subject.key);
                    setCategory('all');
                    setQuery('');
                    setShowAll(false);
                  }}
                  role="tab"
                  aria-selected={domain === subject.key}
                >
                  {subject.label}
                  {subject.key !== 'all' ? (
                    <span className="subject-count">
                      {
                        calculations.filter(
                          (item) => item.domain === subject.key,
                        ).length
                      }
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {domain !== 'all' ? (
              <div className="category-row" aria-label="Equation types">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={
                      category === item ? 'category-tab active' : 'category-tab'
                    }
                    onClick={() => {
                      setCategory(item);
                      setShowAll(false);
                    }}
                  >
                    {item === 'all' ? 'All types' : item}
                  </button>
                ))}
              </div>
            ) : null}

            {!query.trim() && recent.length ? (
              <div className="recent-row" aria-label="Recent equations">
                <span className="row-label">Recent</span>
                <div className="recent-list">
                  {recent.map((item) => (
                    <div className="recent-chip" key={item.id}>
                      <button type="button" onClick={() => choose(item)}>
                        {item.title}
                      </button>
                      <button
                        type="button"
                        className="recent-remove"
                        onClick={() => removeRecent(item.id)}
                        aria-label={`Remove ${item.title}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {(query.trim() || domain !== 'all') && shownMatches.length ? (
              <div className="equation-list">
                {shownMatches.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="equation-item"
                    onClick={() => choose(item)}
                  >
                    <span className="equation-item-title">{item.title}</span>
                    <Formula text={item.equation} />
                  </button>
                ))}
                {matches.length > 14 ? (
                  <button
                    type="button"
                    className="show-more"
                    onClick={() => setShowAll((value) => !value)}
                  >
                    {showAll ? 'Show less' : 'Show all'}
                  </button>
                ) : null}
              </div>
            ) : (query.trim() || domain !== 'all') && !shownMatches.length ? (
              <div className="empty-state">No matching equations</div>
            ) : null}
          </section>
        ) : (
          <section className="calculator" aria-label="Calculate">
            <div className="calc-topline">
              <button
                type="button"
                className="back-button"
                onClick={backToEquations}
              >
                ← Equations
              </button>
              <span className="calc-category">{categoryFor(selected)}</span>
            </div>

            <div className="equation-heading">
              <h1>{selected.title}</h1>
              <Formula text={selected.equation} large />
            </div>

            <div className="field-grid">
              {selected.inputs.map((input) => {
                const currentUnit = units[input.key] ?? input.unit;
                return (
                  <label className="field" key={input.key}>
                    <span className="field-topline">
                      <span>{input.label}</span>
                      <span className="field-symbol">{input.symbol}</span>
                    </span>
                    <span className="field-control">
                      <input
                        value={values[input.key] ?? ''}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setValues((current) => ({
                            ...current,
                            [input.key]: event.target.value,
                          }));
                          setAnswer(null);
                        }}
                        placeholder={input.placeholder}
                        inputMode="decimal"
                        autoComplete="off"
                        aria-label={input.label}
                      />
                      <UnitPicker
                        input={input}
                        value={currentUnit}
                        onChange={(unit) => changeUnit(input.key, unit)}
                      />
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="action-row">
              <button
                type="button"
                className="primary-button"
                onClick={calculate}
              >
                Calculate
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={clear}
              >
                Clear
              </button>
            </div>

            {answer ? (
              <section
                className={answer.ok ? 'result' : 'result error'}
                aria-live="polite"
              >
                {answer.ok ? (
                  <>
                    <div className="result-main">
                      <div>
                        <span className="result-label">{answer.title}</span>
                        <div className="result-value">
                          {shownAnswer || answer.result}
                        </div>
                      </div>
                      {answerInput && resultOptions.length > 1 ? (
                        <UnitPicker
                          input={answerInput}
                          value={answerUnit || answer.unit || ''}
                          onChange={setAnswerUnit}
                          compact
                        />
                      ) : null}
                    </div>
                    <div className="steps">
                      {answer.steps.map((step, index) => (
                        <div className="step" key={`${step.title}-${index}`}>
                          <span className="step-index">{index + 1}</span>
                          <div className="step-copy">
                            <span className="step-title">{step.title}</span>
                            <Formula text={step.equation} />
                            {step.result ? (
                              <span className="step-result">{step.result}</span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                    {answer.note ? (
                      <p className="result-note">{answer.note}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="error-message">{answer.error}</p>
                )}
              </section>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
