import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { ToolsSidebar } from "@/components/tools-sidebar";
import { adultBmiRanges } from "@/lib/bmi";
import { ReferenceTables } from "@/components/reference-tables";

export const metadata: Metadata = {
  title: "Tabelas de nutrição",
  description:
    "Tabelas de IMC, DRIs para adultos e porções de referência da Anvisa, com fontes.",
};

export default function TabelasPage() {
  return (
    <>
      <Hero
        title="Tabelas"
        description="Valores de referência para consulta rápida e apoio ao estudo."
        compact
        showActions
        activeAction="tables"
      />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <ToolsSidebar />
          <div className="space-y-8">
            <section aria-labelledby="imc-table-title">
              <h2
                id="imc-table-title"
                className="mb-6 font-serif text-2xl font-bold"
              >
                Classificação do IMC em adultos
              </h2>
              <div className="max-w-2xl rounded-xl border bg-card p-5 shadow-sm sm:p-6">
                <p className="text-sm text-muted-foreground">
                  Índice de Massa Corporal em kg/m².
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-80 border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th scope="col" className="px-4 py-3 font-semibold">
                          Classificação
                        </th>
                        <th scope="col" className="px-4 py-3 font-semibold">
                          IMC (kg/m²)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adultBmiRanges.map(({ classification, range }) => (
                        <tr
                          key={classification}
                          className="border-b last:border-0"
                        >
                          <th scope="row" className="px-4 py-3 font-medium">
                            {classification}
                          </th>
                          <td className="px-4 py-3 text-muted-foreground">
                            {range}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Referência geral para adultos. O IMC não avalia composição
                  corporal e deve ser interpretado considerando o contexto
                  individual.
                </p>
                <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Fundamento:</strong> as
                  faixas seguem os pontos de corte de IMC para adultos adotados
                  pela Organização Mundial da Saúde. São referências de
                  classificação, não um diagnóstico individual. Fonte:{" "}
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
            <ReferenceTables />
          </div>
        </div>
      </main>
    </>
  );
}
