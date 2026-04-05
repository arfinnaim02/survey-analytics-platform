import Layout from '../../components/Layout';
import MultiStepForm from '../../components/MultiStepForm';

export default function SurveyPage() {
  return (
    <Layout title="Survey">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Survey Instrument
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Energy Crisis Research Questionnaire
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Please complete the following section-based questionnaire covering respondent profile,
            exposure to the energy crisis, general operational impact, business or employee-specific
            effects, and policy evaluation. Your responses are anonymous and will be used for
            academic policy research and comparative analytics.
          </p>
        </div>

        <MultiStepForm />
      </div>
    </Layout>
  );
}