"use client";

import { useState, type FormEvent } from "react";

type WeightChangeResult = {
  percentage: number;
  days: number;
};

export function WeightChangeCalculator() {
  const [referenceWeight, setReferenceWeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [referenceDate, setReferenceDate] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [result, setResult] = useState<WeightChangeResult | null>(null);
  const [error, setError] = useState("");

  function calculateChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const referenceTimestamp = Date.parse(`${referenceDate}T00:00:00Z`);
    const currentTimestamp = Date.parse(`${currentDate}T00:00:00Z`);
    if (
      !Number.isFinite(referenceTimestamp) ||
      !Number.isFinite(currentTimestamp) ||
      currentTimestamp <= referenceTimestamp
    ) {
      setResult(null);
      setError("A data atual deve ser posterior à data do peso inicial.");
      return;
    }

    const initial = Number(referenceWeight);
    const current = Number(currentWeight);
    if (initial <= 0 || current <= 0) return;

    setResult({
      percentage: ((current - initial) / initial) * 100,
      days: (currentTimestamp - referenceTimestamp) / 86_400_000,
    });
  }

  const direction =
    result === null || result.percentage === 0
      ? "sem variação"
      : result.percentage < 0
        ? "redução"
        : "aumento";

  return (
    <>
      <form
        onSubmit={calculateChange}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <label className="grid gap-2 text-sm font-medium">
          Peso inicial (kg)
          <input
            required
            type="number"
            min="0.1"
            step="any"
            inputMode="decimal"
            value={referenceWeight}
            onChange={(event) => setReferenceWeight(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Data do peso inicial
          <input
            required
            type="date"
            value={referenceDate}
            onChange={(event) => setReferenceDate(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Peso atual (kg)
          <input
            required
            type="number"
            min="0.1"
            step="any"
            inputMode="decimal"
            value={currentWeight}
            onChange={(event) => setCurrentWeight(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Data do peso atual
          <input
            required
            type="date"
            value={currentDate}
            onChange={(event) => setCurrentDate(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2 sm:w-fit"
        >
          Calcular variação
        </button>
      </form>
      <p role="alert" className="mt-3 text-sm text-destructive">
        {error}
      </p>
      {result !== null && (
        <output aria-live="polite" className="mt-4 block text-lg font-semibold">
          {direction === "sem variação"
            ? "Sem variação de peso"
            : `${direction === "redução" ? "Redução" : "Aumento"} de ${Math.abs(
                result.percentage,
              ).toFixed(1)}%`}{" "}
          <span className="text-base font-medium text-muted-foreground">
            em {result.days} {result.days === 1 ? "dia" : "dias"}
          </span>
        </output>
      )}
    </>
  );
}
