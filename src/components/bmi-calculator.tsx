"use client";

import { useState, type FormEvent } from "react";
import { classifyAdultBmi } from "@/lib/bmi";

export function BmiCalculator() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  function calculateBmi(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const weightInKg = Number(weight);
    const heightInMeters = Number(height) / 100;

    if (weightInKg > 0 && heightInMeters > 0) {
      setBmi(weightInKg / heightInMeters ** 2);
    }
  }

  return (
    <form onSubmit={calculateBmi} className="mt-6 grid gap-4 sm:grid-cols-2">
      <label className="grid gap-2 text-sm font-medium">
        Peso (kg)
        <input
          required
          type="number"
          min="1"
          step="any"
          inputMode="decimal"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          className="h-11 rounded-md border bg-background px-3 text-base"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Altura (cm)
        <input
          required
          type="number"
          min="1"
          step="any"
          inputMode="decimal"
          value={height}
          onChange={(event) => setHeight(event.target.value)}
          className="h-11 rounded-md border bg-background px-3 text-base"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2 sm:w-fit"
      >
        Calcular IMC
      </button>
      <output
        aria-live="polite"
        className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg font-semibold sm:col-span-2"
      >
        {bmi !== null && (
          <>
            <span>IMC: {bmi.toFixed(1)} kg/m²</span>
            <span className="text-base font-medium text-muted-foreground">
              Classificação: {classifyAdultBmi(bmi)}
            </span>
          </>
        )}
      </output>
    </form>
  );
}
