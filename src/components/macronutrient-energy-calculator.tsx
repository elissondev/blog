"use client";

import { useState, type FormEvent } from "react";

type EnergyResult = {
  carbohydrates: number;
  protein: number;
  fat: number;
};

function formatKcal(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kcal`;
}

export function MacronutrientEnergyCalculator() {
  const [carbohydrates, setCarbohydrates] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [result, setResult] = useState<EnergyResult | null>(null);

  function calculateEnergy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({
      carbohydrates: Number(carbohydrates) * 4,
      protein: Number(protein) * 4,
      fat: Number(fat) * 9,
    });
  }

  return (
    <>
      <form
        onSubmit={calculateEnergy}
        className="mt-6 grid gap-4 sm:grid-cols-2"
      >
        <label className="grid gap-2 text-sm font-medium">
          Carboidratos (g)
          <input
            required
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={carbohydrates}
            onChange={(event) => setCarbohydrates(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Proteínas (g)
          <input
            required
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={protein}
            onChange={(event) => setProtein(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Gorduras (g)
          <input
            required
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={fat}
            onChange={(event) => setFat(event.target.value)}
            className="h-11 rounded-md border bg-background px-3 text-base"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2 sm:w-fit"
        >
          Calcular energia
        </button>
      </form>
      {result !== null && (
        <output aria-live="polite" className="mt-4 block text-lg font-semibold">
          Total estimado:{" "}
          {formatKcal(result.carbohydrates + result.protein + result.fat)}
          <span className="mt-1 block text-sm font-normal text-muted-foreground">
            Carboidratos: {formatKcal(result.carbohydrates)} · Proteínas:{" "}
            {formatKcal(result.protein)} · Gorduras: {formatKcal(result.fat)}
          </span>
        </output>
      )}
    </>
  );
}
