import { AlertCircle, ArrowRight, CheckCircle2, Lightbulb, Loader2, Sparkles } from "lucide-react";

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-moss/10 text-moss">
        <Sparkles size={27} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-2xl font-bold text-ink">Your architecture review will appear here</h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Upload a project and choose a marked file to see practical ways to make it more dependable at scale.
      </p>
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <Loader2 className="animate-spin text-sky" size={34} aria-hidden="true" />
      <h2 className="mt-5 text-xl font-bold text-ink">Reviewing your project structure</h2>
      <div className="mt-7 w-full max-w-xl space-y-3">
        <div className="h-4 w-3/4 animate-pulse bg-slate-200" />
        <div className="h-20 animate-pulse bg-slate-100" />
        <div className="h-20 animate-pulse bg-slate-100" />
      </div>
    </div>
  );
}

function CodePanel({ title, code, tone }) {
  return (
    <section className="min-w-0 border border-slate-200 bg-white">
      <div className={`flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-bold ${tone}`}>
        {title === "Original code" ? <AlertCircle size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
        {title}
      </div>
      <pre className="max-h-[370px] overflow-auto p-4 text-xs leading-6 text-slate-700">{code || "No original file content is available."}</pre>
    </section>
  );
}

export default function InsightsPanel({ isLoading, error, selectedFile, insights, sourceCode }) {
  if (isLoading) return <LoadingState />;
  if (!selectedFile) return <EmptyState />;

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <AlertCircle size={34} className="text-coral" aria-hidden="true" />
        <h2 className="mt-5 text-xl font-bold text-ink">The review could not finish</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{error}</p>
      </div>
    );
  }

  const selectedInsights = insights.filter((insight) => insight.file === selectedFile);

  return (
    <main className="h-full overflow-y-auto px-6 py-7 lg:px-10">
      <div className="mb-7 border-b border-slate-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-sky">Architecture review</p>
        <h2 className="mt-2 break-all text-2xl font-bold text-ink">{selectedFile}</h2>
      </div>

      {!selectedInsights.length ? (
        <div className="border border-moss/30 bg-moss/5 p-6">
          <CheckCircle2 size={24} className="text-moss" aria-hidden="true" />
          <h3 className="mt-3 text-lg font-bold text-ink">No major concern was flagged here</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose an orange-marked file to explore the most useful improvements from this review.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {selectedInsights.map((insight, index) => (
            <article key={`${insight.concept}-${index}`} className="border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-coral/10 text-coral">
                    <Lightbulb size={19} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-coral">Growth opportunity</p>
                    <h3 className="mt-1 text-xl font-bold text-ink">{insight.concept}</h3>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{insight.explanation}</p>
              </div>
              <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto_1fr] xl:items-stretch">
                <CodePanel title="Original code" code={sourceCode} tone="text-coral" />
                <div className="hidden items-center justify-center text-slate-400 xl:flex">
                  <ArrowRight size={22} aria-hidden="true" />
                </div>
                <CodePanel title="A scalable direction" code={insight.refactoredCode} tone="text-moss" />
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
