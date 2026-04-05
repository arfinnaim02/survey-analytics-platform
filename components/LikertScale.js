import React from 'react';

const options = [
  { value: 1, short: 'SA', label: 'Strongly Agree' },
  { value: 2, short: 'A', label: 'Agree' },
  { value: 3, short: 'N', label: 'Neutral' },
  { value: 4, short: 'D', label: 'Disagree' },
  { value: 5, short: 'SD', label: 'Strongly Disagree' },
];

export default function LikertScale({ name, value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((option) => {
        const active = Number(value) === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
              active
                ? 'border-primary bg-primary text-white shadow-lg shadow-blue-900/15'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
            aria-label={`${name}-${option.label}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {option.short}
              </div>

              <span className="text-sm md:text-base font-semibold leading-5">
                {option.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}