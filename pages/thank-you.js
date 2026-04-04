import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function ThankYouPage() {
  return (
    <Layout title="Thank You">
      <div className="relative min-h-[80vh] overflow-hidden flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />
          <motion.div
            className="absolute left-[10%] top-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl"
            animate={{ x: [0, 18, -10, 0], y: [0, 20, -8, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-[10%] bottom-10 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl"
            animate={{ x: [0, -16, 10, 0], y: [0, -16, 8, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-2xl shadow-slate-200/60 backdrop-blur-xl md:p-10"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-lg shadow-blue-900/20">
            ✓
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Submission Complete
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            Thank you for your response
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
            Your survey has been submitted successfully. The response is now stored in the research
            database and will contribute to the policy analysis of energy crisis impacts on
            supermarkets in Bangladesh.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <InfoCard value="Saved" label="Response Status" />
            <InfoCard value="Anonymous" label="Privacy Level" />
            <InfoCard value="Research" label="Study Use" />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
            >
              Back to Home
            </Link>

            <Link
              href="/survey"
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            >
              Submit Another Response
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

function InfoCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-lg font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}