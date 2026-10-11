import Link from "next/link";
import { Calculator, TableProperties } from "lucide-react";

const calculators = [
  { label: "Índice de Massa Corporal (IMC)", href: "/calculadoras#imc-title" },
  {
    label: "Variação percentual de peso",
    href: "/calculadoras#weight-change-title",
  },
  {
    label: "Energia dos macronutrientes",
    href: "/calculadoras#macro-energy-title",
  },
];

const tables = [
  {
    label: "Classificação do IMC em adultos",
    href: "/tabelas#imc-table-title",
  },
  { label: "DRIs para adultos", href: "/tabelas#dri-table-title" },
  {
    label: "Porções e medidas caseiras",
    href: "/tabelas#household-measures-title",
  },
];

const linkClass = "block rounded-md px-3 py-2 text-sm hover:bg-accent/60";

export function ToolsSidebar() {
  return (
    <aside className="flex flex-col gap-6" aria-label="Menu de ferramentas">
      <nav
        aria-labelledby="nav-calculators"
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <h2
          id="nav-calculators"
          className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          <Calculator aria-hidden="true" className="size-4" /> Calculadoras
        </h2>
        <ul className="space-y-1">
          {calculators.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav
        aria-labelledby="nav-tables"
        className="rounded-xl border bg-card p-5 shadow-sm"
      >
        <h2
          id="nav-tables"
          className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          <TableProperties aria-hidden="true" className="size-4" /> Tabelas
        </h2>
        <ul className="space-y-1">
          {tables.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={linkClass}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
