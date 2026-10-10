export function HomeLoading() {
  return (
    <div role="status" aria-label="Carregando página inicial">
      <div className="mx-auto mt-5 max-w-7xl px-4 sm:px-6">
        <section
          aria-hidden="true"
          className="rounded-3xl bg-linear-to-br from-emerald-800 via-emerald-700 to-green-600 px-6 py-10 text-center sm:px-8 sm:py-12"
        >
          <div className="animate-pulse">
            <div className="mx-auto h-7 w-64 rounded-full bg-white/20" />
            <div className="mx-auto mt-4 h-10 max-w-3xl rounded bg-white/20 sm:h-12" />
            <div className="mx-auto mt-3 h-5 max-w-2xl rounded bg-white/15" />
            <div className="mx-auto mt-2 h-5 max-w-xl rounded bg-white/15" />
          </div>
        </section>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside aria-hidden="true" className="space-y-5">
          {[0, 1].map((group) => (
            <div key={group} className="animate-pulse rounded-xl border p-5">
              <div className="mb-5 h-4 w-28 rounded bg-muted" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-5/6 rounded bg-muted" />
                <div className="h-4 w-4/5 rounded bg-muted" />
              </div>
            </div>
          ))}
        </aside>

        <main aria-hidden="true">
          <div className="mb-6 flex animate-pulse items-center justify-between gap-4">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-4 w-20 rounded bg-muted" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-xl border bg-card"
              >
                <div className="aspect-video bg-muted" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-2/3 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                  <div className="h-3 w-5/6 rounded bg-muted" />
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
