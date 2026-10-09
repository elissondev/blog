import { Sparkles, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/10 via-background to-secondary/30">
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(theme(colors.primary/15)_1px,transparent_1px)] [background-size:22px_22px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-primary shadow-sm backdrop-blur">
          <Sparkles className="size-3.5" /> Neurociência aplicada ao dia a dia
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          Entenda seu cérebro.<br />
          <span className="text-primary">Viva melhor com ele.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
          Artigos baseados em evidências sobre sono, foco, emoções e hábitos — escritos por
          especialistas, revisados pela literatura científica mais recente.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="#artigos"><BookOpen className="size-4" /> Começar a ler</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/categoria/neurociencia">Explorar categorias</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
