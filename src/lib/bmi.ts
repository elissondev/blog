export const adultBmiRanges = [
  { classification: "Baixo peso", range: "Abaixo de 18,5", upperLimit: 18.5 },
  {
    classification: "Faixa considerada adequada",
    range: "18,5 a 24,9",
    upperLimit: 25,
  },
  { classification: "Sobrepeso", range: "25,0 a 29,9", upperLimit: 30 },
  { classification: "Obesidade", range: "30,0 ou mais", upperLimit: Infinity },
] as const;

export function classifyAdultBmi(bmi: number) {
  return (
    adultBmiRanges.find(({ upperLimit }) => bmi < upperLimit)?.classification ??
    "Obesidade"
  );
}
