import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import LikertScale from './LikertScale';

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    respondent_type: '',
    location: '',
    op_negative_impact: 3,
    op_service_time: 3,
    op_working_hours: 3,
    op_customer_flow: 3,
    business_cost: 3,
    business_sales: 3,
    business_profit: 3,
    emp_stress: 3,
    emp_efficiency: 3,
    emp_customer_handling: 3,
    policy_necessary: 3,
    policy_pressure: 3,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const steps = useMemo(() => {
    const base = [
      { key: 'profile', title: 'Profile Information', subtitle: 'Tell us your respondent role and location.' },
      { key: 'general', title: 'General Impact', subtitle: 'Assess the broad operational impact of the energy crisis.' },
    ];

    if (formData.respondent_type === 'owner') {
      base.push({
        key: 'business',
        title: 'Business Impact',
        subtitle: 'Measure the financial and sales-related pressure on supermarkets.',
      });
    }

    if (formData.respondent_type === 'employee') {
      base.push({
        key: 'employee',
        title: 'Employee Impact',
        subtitle: 'Capture stress, efficiency, and customer-handling challenges.',
      });
    }

    base.push(
      {
        key: 'policy',
        title: 'Policy Opinion',
        subtitle: 'Evaluate perceptions regarding current energy-saving policies.',
      },
      {
        key: 'review',
        title: 'Review & Submit',
        subtitle: 'Please review your responses before final submission.',
      }
    );

    return base;
  }, [formData.respondent_type]);

  const progress = steps.length > 1 ? currentStep / (steps.length - 1) : 0;
  const current = steps[currentStep];

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canProceed() {
    if (current.key === 'profile') {
      return formData.respondent_type && formData.location;
    }
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      const ipHash = btoa(Date.now().toString());
      const payload = { ...formData, ip_hash: ipHash };

      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to submit');
      }

      window.location.href = '/thank-you';
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-2xl shadow-slate-200/60 backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(13,59,102,0.06),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(20,184,166,0.06),_transparent_28%)]" />

      <div className="relative z-10">
        <ProgressBar
          value={progress}
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          stepLabel={current.title}
        />

        <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm leading-6 text-slate-600">{current.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-5"
          >
            {current.key === 'profile' && (
              <>
                <QuestionCard
                  title="Respondent Type"
                  description="Select the category that best describes you."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RoleCard
                      active={formData.respondent_type === 'owner'}
                      title="Owner / Manager"
                      subtitle="Business or store management respondent"
                      onClick={() => handleChange('respondent_type', 'owner')}
                    />
                    <RoleCard
                      active={formData.respondent_type === 'employee'}
                      title="Employee"
                      subtitle="Operational or service staff respondent"
                      onClick={() => handleChange('respondent_type', 'employee')}
                    />
                  </div>
                </QuestionCard>

                <QuestionCard
                  title="Location"
                  description="Choose the geographic context of the supermarket."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <RoleCard
                      active={formData.location === 'Dhaka'}
                      title="Dhaka"
                      subtitle="Stores located within Dhaka city"
                      onClick={() => handleChange('location', 'Dhaka')}
                    />
                    <RoleCard
                      active={formData.location === 'Outside Dhaka'}
                      title="Outside Dhaka"
                      subtitle="Stores located outside Dhaka city"
                      onClick={() => handleChange('location', 'Outside Dhaka')}
                    />
                  </div>
                </QuestionCard>
              </>
            )}

            {current.key === 'general' && (
              <>
                <LikertQuestion
                  title="The energy crisis has negatively affected supermarket operations."
                  name="op_negative_impact"
                  value={formData.op_negative_impact}
                  onChange={(v) => handleChange('op_negative_impact', v)}
                />
                <LikertQuestion
                  title="Early shop closure has reduced customer service time."
                  name="op_service_time"
                  value={formData.op_service_time}
                  onChange={(v) => handleChange('op_service_time', v)}
                />
                <LikertQuestion
                  title="Changes in working hours (e.g. 9–4) have affected business patterns."
                  name="op_working_hours"
                  value={formData.op_working_hours}
                  onChange={(v) => handleChange('op_working_hours', v)}
                />
                <LikertQuestion
                  title="Customer flow has decreased due to energy-related policies."
                  name="op_customer_flow"
                  value={formData.op_customer_flow}
                  onChange={(v) => handleChange('op_customer_flow', v)}
                />
              </>
            )}

            {current.key === 'business' && (
              <>
                <LikertQuestion
                  title="Electricity and fuel costs have increased significantly."
                  name="business_cost"
                  value={formData.business_cost}
                  onChange={(v) => handleChange('business_cost', v)}
                />
                <LikertQuestion
                  title="Early shop closure has reduced daily sales."
                  name="business_sales"
                  value={formData.business_sales}
                  onChange={(v) => handleChange('business_sales', v)}
                />
                <LikertQuestion
                  title="Business profit has decreased due to the energy crisis."
                  name="business_profit"
                  value={formData.business_profit}
                  onChange={(v) => handleChange('business_profit', v)}
                />
              </>
            )}

            {current.key === 'employee' && (
              <>
                <LikertQuestion
                  title="The energy crisis has increased my work stress."
                  name="emp_stress"
                  value={formData.emp_stress}
                  onChange={(v) => handleChange('emp_stress', v)}
                />
                <LikertQuestion
                  title="My work efficiency has decreased due to energy-related issues."
                  name="emp_efficiency"
                  value={formData.emp_efficiency}
                  onChange={(v) => handleChange('emp_efficiency', v)}
                />
                <LikertQuestion
                  title="Customer handling becomes difficult during energy-related disruptions."
                  name="emp_customer_handling"
                  value={formData.emp_customer_handling}
                  onChange={(v) => handleChange('emp_customer_handling', v)}
                />
              </>
            )}

            {current.key === 'policy' && (
              <>
                <LikertQuestion
                  title="Current energy-saving policies are necessary."
                  name="policy_necessary"
                  value={formData.policy_necessary}
                  onChange={(v) => handleChange('policy_necessary', v)}
                />
                <LikertQuestion
                  title="These policies create economic pressure on businesses."
                  name="policy_pressure"
                  value={formData.policy_pressure}
                  onChange={(v) => handleChange('policy_pressure', v)}
                />
              </>
            )}

            {current.key === 'review' && (
              <QuestionCard
                title="Submission Summary"
                description="Review the response object below before you submit."
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-sm text-slate-100 shadow-inner">
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                    {JSON.stringify(formData, null, 2)}
                  </pre>
                </div>
              </QuestionCard>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-4">
          {currentStep > 0 ? (
            <button
              type="button"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {current.key !== 'review' ? (
            <button
              type="button"
              className={`inline-flex items-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                canProceed()
                  ? 'bg-primary hover:-translate-y-0.5 hover:bg-primary-dark'
                  : 'cursor-not-allowed bg-slate-400'
              }`}
              onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          )}
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ title, description, children }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function LikertQuestion({ title, name, value, onChange }) {
  return (
    <QuestionCard title={title} description="Select one response on the five-point agreement scale.">
      <LikertScale name={name} value={value} onChange={onChange} />
    </QuestionCard>
  );
}

function RoleCard({ active, title, subtitle, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition-all duration-200 ${
        active
          ? 'border-primary bg-primary text-white shadow-lg shadow-blue-900/15'
          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{title}</p>
          <p className={`mt-1 text-sm leading-6 ${active ? 'text-white/85' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        </div>
        <span
          className={`mt-1 h-4 w-4 rounded-full border-2 ${
            active ? 'border-white bg-white' : 'border-slate-300'
          }`}
        />
      </div>
    </motion.button>
  );
}