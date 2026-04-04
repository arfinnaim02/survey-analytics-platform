export default function ProgressBar({ value, currentStep, totalSteps, stepLabel }) {
  const percent = Math.min(1, Math.max(0, value)) * 100;

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Survey Progress
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            {stepLabel || 'Section'} 
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          Step <span className="font-semibold text-slate-900">{currentStep}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalSteps}</span>
        </div>
      </div>

      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-cyan-600 to-teal-500 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 text-right text-xs font-medium text-slate-500">
        {Math.round(percent)}% completed
      </div>
    </div>
  );
}