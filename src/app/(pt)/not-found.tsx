import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
        <Brain className="size-8 text-primary" />
      </span>
      <h1 className="font-serif text-4xl font-bold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O artigo ou seção que você procura não existe ou foi movido. Que tal voltar e explorar outros temas?
      </p>
      <Button asChild><Link href="/">Voltar ao início</Link></Button>
    </main>
  );
}
