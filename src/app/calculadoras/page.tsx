import type { Metadata } from "next";
import { BmiCalculator } from "@/components/bmi-calculator";
import { Hero } from "@/components/hero";
import { ToolsSidebar } from "@/components/tools-sidebar";
import { MacronutrientEnergyCalculator } from "@/components/macronutrient-energy-calculator";
import { WeightChangeCalculator } from "@/components/weight-change-calculator";

export const metadata: Metadata = {
  title: "Calculadoras de nutrição",
  description:
    "Calculadoras de IMC, variação de peso e energia de macronutrientes, com métodos e fontes.",
};

export default function CalculadorasPage() {
  return (
    <>
      <Hero
        title="Calculadoras"
        description="Cálculos de referência para apoiar a consulta e o estudo em nutrição."
        compact
        showActions
        activeAction="calculators"
      />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ToolsSidebar />
          <div className="space-y-8">
            <section aria-labelledby="imc-title">
              <h2 id="imc-title" className="mb-6 font-serif text-2xl font-bold">
                Índice de Massa Corporal (IMC)
              </h2>
              <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Informe peso e altura para calcular o IMC. A classificação
                  exibida é uma referência para adultos e não substitui
                  avaliação individual.
                </p>
                <BmiCalculator />
                <p className="mt-6 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Fundamento:</strong> o IMC
                  é calculado dividindo o peso em quilogramas pela altura em
                  metros ao quadrado. A Organização Mundial da Saúde o utiliza
                  como indicador de classificação em adultos; ele não distingue
                  massa muscular de gordura corporal. Fonte:{" "}
                  <a
                    href="https://iris.who.int/handle/10665/42330"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    relatório técnico 894 da OMS (2000)
                  </a>
                  .
                </p>
              </div>
            </section>

            <section aria-labelledby="weight-change-title">
              <h2
                id="weight-change-title"
                className="mb-6 font-serif text-2xl font-bold"
              >
                Variação percentual de peso
              </h2>
              <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Compare dois pesos e suas datas para visualizar a variação
                  percentual e o intervalo entre as medidas.
                </p>
                <WeightChangeCalculator />
                <p className="mt-6 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Fundamento:</strong> a
                  variação é calculada por ((peso atual − peso inicial) ÷ peso
                  inicial) × 100. O resultado negativo indica redução; o
                  positivo, aumento. A ferramenta não aplica pontos de corte nem
                  classifica estado nutricional. Fonte: critérios de mudança de
                  peso no consenso AND/ASPEN, White et al. (2012),{" "}
                  <a
                    href="https://doi.org/10.1016/j.jand.2012.03.012"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    DOI 10.1016/j.jand.2012.03.012
                  </a>
                  .
                </p>
              </div>
            </section>

            <section aria-labelledby="macro-energy-title">
              <h2
                id="macro-energy-title"
                className="mb-6 font-serif text-2xl font-bold"
              >
                Energia dos macronutrientes
              </h2>
              <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Informe os gramas de carboidratos, proteínas e gorduras para
                  estimar a energia correspondente.
                </p>
                <MacronutrientEnergyCalculator />
                <p className="mt-6 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Fundamento:</strong> são
                  aplicados os fatores de 4 kcal/g para carboidratos e proteínas
                  e 9 kcal/g para gorduras, conforme a IN Anvisa nº 75/2020,
                  Anexo XXII. O cálculo não inclui fibras, polióis, álcool ou
                  ácidos orgânicos e não substitui a composição específica de um
                  alimento. Fonte:{" "}
                  <a
                    href="https://www.in.gov.br/en/web/dou/-/instrucao-normativa-in-n-75-de-8-de-outubro-de-2020-282071143"
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    texto oficial da Anvisa
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
