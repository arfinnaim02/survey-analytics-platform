import Link from 'next/link';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <Layout title="Home">
      <div className="relative min-h-[88vh] overflow-hidden flex items-center justify-center">
        <PremiumBackground />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 shadow-sm backdrop-blur"
            >
              Policy Research Platform
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="text-4xl font-bold leading-tight text-slate-900 md:text-6xl md:leading-[1.08]"
            >
              Impact of Energy Crisis on Employees and Shop Owners of Supermarkets in Bangladesh
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.7 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg"
            >
              A premium web-based survey and analytics platform for academic policy research,
              designed to capture operational, financial, and workforce impacts of energy-related
              restrictions across supermarkets in Bangladesh.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <Link
                href="/survey"
                className="group inline-flex items-center rounded-2xl bg-primary px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Start Survey
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                href="/admin/login"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white/85 px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white"
              >
                Research Admin
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.75 }}
              className="mt-14 grid gap-4 md:grid-cols-3"
            >
              <StatCard value="5–7 min" label="Completion Time" />
              <StatCard value="100%" label="Anonymous Response" />
              <StatCard value="Academic" label="Policy Study Design" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.75 }}
              className="mx-auto mt-8 max-w-3xl rounded-3xl border border-white/70 bg-white/70 p-5 text-left shadow-xl shadow-slate-200/60 backdrop-blur-xl"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Study Scope
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Comparative insight collection from supermarket employees and owners using
                    structured Likert-scale instruments and automated dashboard analytics.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Output Focus
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Response tracking, impact scoring, cross-tab analysis, and policy-oriented
                    evidence generation for research reporting and presentation.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ value, label }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-white/70 bg-white/75 p-6 shadow-lg shadow-slate-200/50 backdrop-blur-xl"
    >
      <p className="text-2xl font-bold text-slate-900 md:text-3xl">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{label}</p>
    </motion.div>
  );
}

function PremiumBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_35%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />

      <motion.div
        className="absolute -top-16 left-[8%] h-56 w-56 rounded-full bg-primary/10 blur-3xl"
        animate={{ x: [0, 20, -10, 0], y: [0, 30, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute right-[8%] top-20 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl"
        animate={{ x: [0, -25, 15, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-100/40 blur-3xl"
        animate={{ y: [0, -18, 8, 0], x: [0, 10, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
    </div>
  );
}