export function ArticleListLoading({
  showHero = false,
}: {
  showHero?: boolean;
}) {
  return (
    <div role="status" aria-label="Carregando artigos">
      {showHero && (
        <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
          <section
            aria-hidden="true"
            className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600 px-6 py-7 sm:px-8 sm:py-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[22px_22px]" />
            <div className="relative animate-pulse text-center">
              <div className="mx-auto h-9 w-2/3 max-w-2xl rounded bg-white/20 sm:h-11" />
              <div className="mx-auto mt-3 h-5 w-5/6 max-w-3xl rounded bg-white/15" />
            </div>
          </section>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-hidden="true" className="flex flex-col gap-6">
          <div className="animate-pulse rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 h-4 w-28 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
              <div className="h-4 w-4/5 rounded bg-muted" />
              <div className="h-4 w-3/4 rounded bg-muted" />
            </div>
          </div>
          <div className="animate-pulse rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-5 h-4 w-16 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-20 rounded-full bg-muted" />
              <div className="h-6 w-16 rounded-full bg-muted" />
              <div className="h-6 w-24 rounded-full bg-muted" />
              <div className="h-6 w-14 rounded-full bg-muted" />
            </div>
          </div>
          <div className="hidden animate-pulse rounded-xl border bg-card p-5 shadow-sm xl:block">
            <div className="mb-5 h-4 w-20 rounded bg-muted" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-muted" />
              <div className="h-4 w-5/6 rounded bg-muted" />
            </div>
          </div>
        </aside>

        <main aria-hidden="true">
          <div className="mb-6 flex animate-pulse items-center justify-between gap-4">
            <div className="h-7 w-40 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div className="aspect-[16/9] bg-muted" />
                <div className="flex h-full flex-col gap-3 p-5">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="space-y-2">
                    <div className="h-5 w-full rounded bg-muted" />
                    <div className="h-5 w-4/5 rounded bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                  </div>
                  <div className="mt-1 flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-muted" />
                    <div className="h-5 w-20 rounded-full bg-muted" />
                  </div>
                  <div className="mt-1 h-4 w-20 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
