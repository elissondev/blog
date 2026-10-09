"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center" role="alert">
      <AlertTriangle className="size-10 text-destructive" />
      <h1 className="font-serif text-2xl font-bold">Algo deu errado</h1>
      <p className="text-muted-foreground">Ocorreu um erro ao carregar esta página. Tente novamente.</p>
      <Button onClick={reset}>Tentar de novo</Button>
    </div>
  );
}
