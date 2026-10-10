export default function ArticleLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6"
      role="status"
      aria-label="Carregando artigo"
    >
      <article className="mx-auto max-w-3xl">
        <div className="mb-6 h-4 w-36 rounded bg-muted" />

        <header className="mb-8">
          <div className="mb-4 flex gap-2">
            <div className="h-6 w-24 rounded-full bg-muted" />
            <div className="h-6 w-20 rounded-full bg-muted" />
          </div>

          <div className="space-y-3">
            <div className="h-9 w-full rounded bg-muted sm:h-12" />
            <div className="h-9 w-4/5 rounded bg-muted sm:h-12" />
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-5 w-full rounded bg-muted" />
            <div className="h-5 w-5/6 rounded bg-muted" />
          </div>

          <div className="mt-6 flex flex-wrap gap-5 border-y py-4">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-24 rounded bg-muted" />
          </div>
        </header>

        <div className="mb-10 aspect-[21/9] rounded-xl bg-muted" />

        <div className="space-y-4">
          <div className="h-7 w-3/5 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="h-7 w-1/2 rounded bg-muted pt-4" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-11/12 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      </article>
      <span className="sr-only">Carregando artigo…</span>
    </div>
  );
}
