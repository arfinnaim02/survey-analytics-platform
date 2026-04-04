import React from 'react';
import { motion } from 'framer-motion';

export default function LikertScale({ name, value, onChange }) {
  const options = [
    { value: 1, label: 'Strongly Disagree', short: 'SD' },
    { value: 2, label: 'Disagree', short: 'D' },
    { value: 3, label: 'Neutral', short: 'N' },
    { value: 4, label: 'Agree', short: 'A' },
    { value: 5, label: 'Strongly Agree', short: 'SA' },
  ];

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-5"
      role="radiogroup"
      aria-label={name}
    >
      {options.map((opt) => {
        const active = value === opt.value;

        return (
          <motion.label
            key={opt.value}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group cursor-pointer rounded-2xl border p-3 text-center transition-all duration-200 ${
              active
                ? 'border-primary bg-primary text-white shadow-lg shadow-blue-900/15'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />

            <div className="flex flex-col items-center justify-center">
              <span
                className={`mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                }`}
              >
                {opt.short}
              </span>
              <span className="text-sm font-semibold leading-5">{opt.label}</span>
            </div>
          </motion.label>
        );
      })}
    </div>
  );
}