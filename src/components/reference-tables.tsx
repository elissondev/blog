const adultDriRows = [
  {
    nutrient: "Carboidratos",
    ear: "100 g/dia (H/M)",
    rda: "130 g/dia (H/M)",
    ai: "—",
    ul: "Não estabelecido",
  },
  {
    nutrient: "Proteínas",
    ear: "0,66 g/kg/dia (H/M)",
    rda: "0,8 g/kg/dia (H/M)",
    ai: "—",
    ul: "Não estabelecido",
  },
  {
    nutrient: "Fibras totais",
    ear: "—",
    rda: "—",
    ai: "38 g/dia (H); 25 g/dia (M)",
    ul: "Não estabelecido",
  },
  {
    nutrient: "Vitamina C",
    ear: "75 mg/dia (H); 60 mg/dia (M)",
    rda: "90 mg/dia (H); 75 mg/dia (M)",
    ai: "—",
    ul: "2.000 mg/dia (H/M)",
  },
  {
    nutrient: "Cálcio",
    ear: "800 mg/dia (H/M)",
    rda: "1.000 mg/dia (H/M)",
    ai: "—",
    ul: "2.500 mg/dia (H/M)",
  },
];

const referencePortions = [
  { food: "Arroz cru", portion: "50 g", measure: "Xícara" },
  { food: "Aveia em flocos", portion: "30 g", measure: "Colher de sopa" },
  { food: "Leite fluido", portion: "200 mL", measure: "Copo" },
  { food: "Óleos vegetais", portion: "13 g", measure: "Colher de sopa" },
  { food: "Açúcar", portion: "5 g", measure: "Colher de chá" },
];

export function ReferenceTables() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="dri-table-title">
        <h2 id="dri-table-title" className="mb-6 font-serif text-2xl font-bold">
          DRIs para adultos
        </h2>
        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Recorte de nutrientes selecionados para adultos saudáveis de 19 a 50
            anos. H = homens; M = mulheres. Valores diários; proteína em g/kg.
            As DRIs abaixo são referências dos EUA/Canadá, não os valores
            diários de rotulagem brasileiros.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-left text-sm">
              <caption className="sr-only">
                EAR, RDA, AI e UL para nutrientes selecionados em adultos de 19
                a 50 anos
              </caption>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Nutriente
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    EAR
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    RDA
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    AI
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    UL
                  </th>
                </tr>
              </thead>
              <tbody>
                {adultDriRows.map((row) => (
                  <tr key={row.nutrient} className="border-b last:border-0">
                    <th scope="row" className="px-3 py-3 font-medium">
                      {row.nutrient}
                    </th>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.ear}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.rda}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.ai}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.ul}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            EAR estima a necessidade média; RDA atende às necessidades de quase
            todos os indivíduos saudáveis; AI é usada quando não há evidência
            suficiente para estabelecer uma RDA; UL é o limite superior de
            ingestão diária habitual. “Não estabelecido” não significa consumo
            ilimitado.
          </p>
          <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
            Fonte: Dietary Reference Intakes do Food and Nutrition Board,
            National Academies of Sciences, Engineering, and Medicine. Consulte
            as tabelas completas por nutriente e faixa etária no{" "}
            <a
              href="https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              NIH Office of Dietary Supplements
            </a>
            .
          </p>
        </div>
      </section>

      <section aria-labelledby="household-measures-title">
        <h2
          id="household-measures-title"
          className="mb-6 font-serif text-2xl font-bold"
        >
          Porções e medidas caseiras
        </h2>
        <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Exemplos de porções de referência para rotulagem nutricional. A
            medida caseira sugerida depende do alimento e não deve ser tratada
            como conversão universal de peso.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-136 border-collapse text-left text-sm">
              <caption className="sr-only">
                Exemplos de porções de referência e medidas caseiras da Anvisa
              </caption>
              <thead>
                <tr className="border-b bg-muted/50">
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Alimento
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Porção
                  </th>
                  <th scope="col" className="px-3 py-3 font-semibold">
                    Medida caseira
                  </th>
                </tr>
              </thead>
              <tbody>
                {referencePortions.map((row) => (
                  <tr key={row.food} className="border-b last:border-0">
                    <th scope="row" className="px-3 py-3 font-medium">
                      {row.food}
                    </th>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.portion}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.measure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Para fins de rotulagem, a IN nº 75/2020 define, entre outros, xícara
            de chá e copo de 200 mL, colher de sopa de 10 mL e colher de chá de
            5 mL. O peso real varia conforme densidade, preenchimento e preparo
            do alimento.
          </p>
          <p className="mt-4 border-t pt-4 text-sm leading-relaxed text-muted-foreground">
            Fonte: Anvisa, Instrução Normativa nº 75, de 8 de outubro de 2020,
            Anexos V e VII. Consulte o{" "}
            <a
              href="https://www.in.gov.br/en/web/dou/-/instrucao-normativa-in-n-75-de-8-de-outubro-de-2020-282071143"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-foreground"
            >
              texto oficial
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
