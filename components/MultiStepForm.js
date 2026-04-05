import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import LikertScale from './LikertScale';

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    role: '',
    supermarket_type: '',
    location: '',
    backup_power_source: '',
    years_in_service: '',

    iv_power_interruptions: 3,
    iv_outage_duration: 3,
    iv_unstable_electricity: 3,
    iv_fuel_price_pressure: 3,
    iv_tariff_pressure: 3,
    iv_early_closure: 3,
    iv_reduced_working_hours: 3,
    iv_daily_uncertainty: 3,
    iv_backup_dependence: 3,
    iv_policy_flexibility: 3,

    business_cost_increase_level: '',
    business_sales_decrease_level: '',
    business_cost_increase: 3,
    business_sales_reduced_hours: 3,
    business_profit_margin_decline: 3,
    business_evening_customer_flow: 3,
    business_inventory_difficulty: 3,
    business_backup_maintenance_cost: 3,

    employee_workload_change: '',
    employee_work_stress: 3,
    employee_efficiency_decrease: 3,
    employee_job_difficulty: 3,
    employee_customer_handling: 3,
    employee_uncomfortable_environment: 3,
    employee_routine_disruption: 3,
    employee_low_motivation: 3,

    policy_necessary: 3,
    policy_business_negative: 3,
    policy_balance_needed: 3,
    policy_preferred_solution: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const isOwnerManager = formData.role === 'owner_manager';
  const isFloorEmployee = formData.role === 'floor_employee';

  const steps = useMemo(() => {
    const base = [
      {
        key: 'profile',
        title: 'Profile & Demographics',
        subtitle:
          'Provide your role, market type, location, backup power source, and experience.',
      },
      {
        key: 'independent',
        title: 'Energy Crisis Factors',
        subtitle:
          'Select your level of agreement for each statement.',
      },
    ];

    if (isOwnerManager) {
      base.push({
        key: 'business',
        title: 'Business Impact',
        subtitle:
          'Share how the energy crisis has affected costs, sales, and operations.',
      });
    }

    if (isFloorEmployee) {
      base.push({
        key: 'employee',
        title: 'Employee Impact',
        subtitle:
          'Share how the energy crisis has affected your work and environment.',
      });
    }

    base.push(
      {
        key: 'policy',
        title: 'Policy Perception',
        subtitle:
          'Share your opinion about current policy and preferred solution.',
      },
      {
        key: 'review',
        title: 'Review & Submit',
        subtitle: 'Review your answers before submission.',
      }
    );

    return base;
  }, [isOwnerManager, isFloorEmployee]);

  const progress = steps.length > 1 ? currentStep / (steps.length - 1) : 0;
  const current = steps[currentStep];

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function canProceed() {
    if (current.key === 'profile') {
      return (
        formData.role &&
        formData.supermarket_type &&
        formData.location &&
        formData.backup_power_source &&
        formData.years_in_service
      );
    }

    if (current.key === 'business') {
      return (
        formData.business_cost_increase_level &&
        formData.business_sales_decrease_level
      );
    }

    if (current.key === 'employee') {
      return formData.employee_workload_change;
    }

    if (current.key === 'policy') {
      return formData.policy_preferred_solution;
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
    <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/60 backdrop-blur-xl md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(13,59,102,0.06),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(20,184,166,0.06),_transparent_28%)]" />

      <div className="relative z-10">
        <ProgressBar
          value={progress}
          currentStep={currentStep + 1}
          totalSteps={steps.length}
          stepLabel={current.title}
        />

        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-sm leading-6 text-slate-600">{current.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28 }}
            className="space-y-4"
          >
            {current.key === 'profile' && (
              <>
                <SelectionQuestion
                  title="What is your role in the market?"
                  description="Select your main role."
                  field="role"
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    ['owner_manager', 'Owner / Manager'],
                    ['floor_employee', 'Employee'],
                  ]}
                />

                <SelectionQuestion
                  title="What type of market is this?"
                  description="Choose the market type."
                  field="supermarket_type"
                  value={formData.supermarket_type}
                  onChange={handleChange}
                  options={[
                    ['brand_chain', 'Brand Chain'],
                    ['independent_local_supermarket', 'Independent Market'],
                  ]}
                />

                <SelectionQuestion
                  title="Where is the market located?"
                  description="Choose the market location."
                  field="location"
                  value={formData.location}
                  onChange={handleChange}
                  options={[
                    ['dhaka_chattogram', 'Dhaka / Chattogram'],
                    ['other_district_suburban', 'Other District / Sub-urban'],
                  ]}
                />

                <SelectionQuestion
                  title="What is the main backup power source?"
                  description="Select the main backup option."
                  field="backup_power_source"
                  value={formData.backup_power_source}
                  onChange={handleChange}
                  options={[
                    ['diesel_generator', 'Diesel Generator'],
                    ['ips_solar', 'IPS / Solar'],
                    ['no_backup', 'No Backup'],
                  ]}
                />

                <SelectionQuestion
                  title="How long have you worked in this sector?"
                  description="Select your experience level."
                  field="years_in_service"
                  value={formData.years_in_service}
                  onChange={handleChange}
                  options={[
                    ['less_than_2_years', 'Less than 2 years'],
                    ['2_to_5_years', '2–5 years'],
                    ['more_than_5_years', 'More than 5 years'],
                  ]}
                />
              </>
            )}

            {current.key === 'independent' && (
              <>
                <LikertQuestion
                  title="Power cuts affect daily operations."
                  name="iv_power_interruptions"
                  value={formData.iv_power_interruptions}
                  onChange={(v) => handleChange('iv_power_interruptions', v)}
                />
                <LikertQuestion
                  title="Power outages last too long."
                  name="iv_outage_duration"
                  value={formData.iv_outage_duration}
                  onChange={(v) => handleChange('iv_outage_duration', v)}
                />
                <LikertQuestion
                  title="Unstable electricity affects business continuity."
                  name="iv_unstable_electricity"
                  value={formData.iv_unstable_electricity}
                  onChange={(v) => handleChange('iv_unstable_electricity', v)}
                />
                <LikertQuestion
                  title="Fuel and oil prices increase pressure."
                  name="iv_fuel_price_pressure"
                  value={formData.iv_fuel_price_pressure}
                  onChange={(v) => handleChange('iv_fuel_price_pressure', v)}
                />
                <LikertQuestion
                  title="Higher electricity tariffs are difficult to manage."
                  name="iv_tariff_pressure"
                  value={formData.iv_tariff_pressure}
                  onChange={(v) => handleChange('iv_tariff_pressure', v)}
                />
                <LikertQuestion
                  title="Early closing reduces profitable hours."
                  name="iv_early_closure"
                  value={formData.iv_early_closure}
                  onChange={(v) => handleChange('iv_early_closure', v)}
                />
                <LikertQuestion
                  title="Reduced hours limit customer flow."
                  name="iv_reduced_working_hours"
                  value={formData.iv_reduced_working_hours}
                  onChange={(v) => handleChange('iv_reduced_working_hours', v)}
                />
                <LikertQuestion
                  title="Energy problems create planning uncertainty."
                  name="iv_daily_uncertainty"
                  value={formData.iv_daily_uncertainty}
                  onChange={(v) => handleChange('iv_daily_uncertainty', v)}
                />
                <LikertQuestion
                  title="The market depends more on backup power."
                  name="iv_backup_dependence"
                  value={formData.iv_backup_dependence}
                  onChange={(v) => handleChange('iv_backup_dependence', v)}
                />
                <LikertQuestion
                  title="Energy policies reduce business flexibility."
                  name="iv_policy_flexibility"
                  value={formData.iv_policy_flexibility}
                  onChange={(v) => handleChange('iv_policy_flexibility', v)}
                />
              </>
            )}

            {current.key === 'business' && (
              <>
                <SelectionQuestion
                  title="How much have costs increased?"
                  description="Choose the level of increase."
                  field="business_cost_increase_level"
                  value={formData.business_cost_increase_level}
                  onChange={handleChange}
                  options={[
                    ['no_increase', 'No increase'],
                    ['low', 'Low'],
                    ['moderate', 'Moderate'],
                    ['high', 'High'],
                  ]}
                />

                <SelectionQuestion
                  title="How much have sales decreased?"
                  description="Choose the level of decrease."
                  field="business_sales_decrease_level"
                  value={formData.business_sales_decrease_level}
                  onChange={handleChange}
                  options={[
                    ['no_decrease', 'No decrease'],
                    ['slight', 'Slight'],
                    ['moderate', 'Moderate'],
                    ['significant', 'Significant'],
                  ]}
                />

                <LikertQuestion
                  title="Operational costs have increased."
                  name="business_cost_increase"
                  value={formData.business_cost_increase}
                  onChange={(v) => handleChange('business_cost_increase', v)}
                />
                <LikertQuestion
                  title="Daily sales have decreased."
                  name="business_sales_reduced_hours"
                  value={formData.business_sales_reduced_hours}
                  onChange={(v) => handleChange('business_sales_reduced_hours', v)}
                />
                <LikertQuestion
                  title="Profit margins have declined."
                  name="business_profit_margin_decline"
                  value={formData.business_profit_margin_decline}
                  onChange={(v) => handleChange('business_profit_margin_decline', v)}
                />
                <LikertQuestion
                  title="Evening customer flow has decreased."
                  name="business_evening_customer_flow"
                  value={formData.business_evening_customer_flow}
                  onChange={(v) => handleChange('business_evening_customer_flow', v)}
                />
                <LikertQuestion
                  title="Inventory management has become difficult."
                  name="business_inventory_difficulty"
                  value={formData.business_inventory_difficulty}
                  onChange={(v) => handleChange('business_inventory_difficulty', v)}
                />
                <LikertQuestion
                  title="Backup maintenance costs have increased."
                  name="business_backup_maintenance_cost"
                  value={formData.business_backup_maintenance_cost}
                  onChange={(v) => handleChange('business_backup_maintenance_cost', v)}
                />
              </>
            )}

            {current.key === 'employee' && (
              <>
                <SelectionQuestion
                  title="How has your workload changed?"
                  description="Choose the closest option."
                  field="employee_workload_change"
                  value={formData.employee_workload_change}
                  onChange={handleChange}
                  options={[
                    ['decreased', 'Decreased'],
                    ['no_change', 'No change'],
                    ['increased', 'Increased'],
                  ]}
                />

                <LikertQuestion
                  title="My work stress has increased."
                  name="employee_work_stress"
                  value={formData.employee_work_stress}
                  onChange={(v) => handleChange('employee_work_stress', v)}
                />
                <LikertQuestion
                  title="My work efficiency has decreased."
                  name="employee_efficiency_decrease"
                  value={formData.employee_efficiency_decrease}
                  onChange={(v) => handleChange('employee_efficiency_decrease', v)}
                />
                <LikertQuestion
                  title="Power-related issues make my job harder."
                  name="employee_job_difficulty"
                  value={formData.employee_job_difficulty}
                  onChange={(v) => handleChange('employee_job_difficulty', v)}
                />
                <LikertQuestion
                  title="Customer handling becomes more difficult."
                  name="employee_customer_handling"
                  value={formData.employee_customer_handling}
                  onChange={(v) => handleChange('employee_customer_handling', v)}
                />
                <LikertQuestion
                  title="The work environment becomes uncomfortable."
                  name="employee_uncomfortable_environment"
                  value={formData.employee_uncomfortable_environment}
                  onChange={(v) => handleChange('employee_uncomfortable_environment', v)}
                />
                <LikertQuestion
                  title="My daily work routine is disrupted."
                  name="employee_routine_disruption"
                  value={formData.employee_routine_disruption}
                  onChange={(v) => handleChange('employee_routine_disruption', v)}
                />
                <LikertQuestion
                  title="I feel less motivated to work."
                  name="employee_low_motivation"
                  value={formData.employee_low_motivation}
                  onChange={(v) => handleChange('employee_low_motivation', v)}
                />
              </>
            )}

            {current.key === 'policy' && (
              <>
                <LikertQuestion
                  title="Energy-saving policies are necessary."
                  name="policy_necessary"
                  value={formData.policy_necessary}
                  onChange={(v) => handleChange('policy_necessary', v)}
                />
                <LikertQuestion
                  title="Current policies hurt business performance."
                  name="policy_business_negative"
                  value={formData.policy_business_negative}
                  onChange={(v) => handleChange('policy_business_negative', v)}
                />
                <LikertQuestion
                  title="A balance between energy saving and business activity is needed."
                  name="policy_balance_needed"
                  value={formData.policy_balance_needed}
                  onChange={(v) => handleChange('policy_balance_needed', v)}
                />

                <SelectionQuestion
                  title="Which policy solution do you prefer?"
                  description="Choose the best option."
                  field="policy_preferred_solution"
                  value={formData.policy_preferred_solution}
                  onChange={handleChange}
                  options={[
                    ['continue_current_policy', 'Continue current policy'],
                    ['relax_restrictions', 'Relax restrictions for supermarkets'],
                    ['provide_subsidy_support', 'Provide subsidy/support'],
                    ['flexible_business_hours', 'Flexible business hours'],
                  ]}
                />
              </>
            )}

            {current.key === 'review' && (
              <QuestionCard
                title="Submission Summary"
                description="Please review your responses before final submission."
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
      className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm"
    >
      <h3 className="text-base md:text-lg font-semibold text-slate-900 leading-7">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </motion.div>
  );
}

function LikertQuestion({ title, name, value, onChange }) {
  return (
    <QuestionCard title={title} description="Select one option.">
      <LikertScale name={name} value={value} onChange={onChange} />
    </QuestionCard>
  );
}

function SelectionQuestion({ title, description, field, value, onChange, options }) {
  return (
    <QuestionCard title={title} description={description}>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map(([optionValue, optionLabel]) => (
          <RoleCard
            key={optionValue}
            active={value === optionValue}
            title={optionLabel}
            subtitle=""
            onClick={() => onChange(field, optionValue)}
          />
        ))}
      </div>
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
      className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
        active
          ? 'border-primary bg-primary text-white shadow-lg shadow-blue-900/15'
          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm md:text-base font-semibold leading-6">{title}</p>
          {subtitle ? (
            <p className={`mt-1 text-sm leading-6 ${active ? 'text-white/85' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          ) : null}
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