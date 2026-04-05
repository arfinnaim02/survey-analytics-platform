import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, ArcElement, CategoryScale, LinearScale, Tooltip, Legend);

export const getServerSideProps = async (ctx) => requireAdmin(ctx);

function normalizeLikertMean(value) {
  const num = Number(value || 0);
  if (!num) return 0;
  return 6 - num;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/analytics');
      const json = await res.json();
      setData(json);
      setLoading(false);
    }
    fetchData();
  }, []);

  const findings = useMemo(() => {
    if (!data) return [];

    const business = normalizeLikertMean(data.businessImpactScore);
    const employee = normalizeLikertMean(data.employeeImpactScore);
    const policyNeed = normalizeLikertMean(data.policyStats?.policy_necessary?.mean);
    const policyNegative = normalizeLikertMean(data.policyStats?.policy_business_negative?.mean);
    const policyBalance = normalizeLikertMean(data.policyStats?.policy_balance_needed?.mean);

    const ownerManagerCount = Number(data.respondentCounts?.owner_manager || 0);
    const employeeCount = Number(data.respondentCounts?.floor_employee || 0);

    return [
      {
        title: business >= 3.5 ? 'High business impact' : 'Moderate business impact',
        body: `Owner/manager composite business impact score is ${business.toFixed(2)}.`,
      },
      {
        title: employee >= 3.5 ? 'Strong employee-side disruption' : 'Employee impact remains visible',
        body: `Floor employee impact score is ${employee.toFixed(2)}.`,
      },
      {
        title:
          policyNegative > policyNeed
            ? 'Policies seen as more harmful than necessary'
            : 'Policy necessity still recognized',
        body: `Policy necessity mean: ${policyNeed.toFixed(2)} | Negative business effect mean: ${policyNegative.toFixed(2)}.`,
      },
      {
        title: 'Balanced approach is important',
        body: `Balance-between-energy-saving-and-economic-activity mean score is ${policyBalance.toFixed(2)}.`,
      },
      {
        title: 'Sample composition insight',
        body: `Owner/manager responses: ${ownerManagerCount} | Floor employee responses: ${employeeCount}.`,
      },
    ];
  }, [data]);

  const executiveSummary = useMemo(() => {
    if (!data) return '';

    const business = normalizeLikertMean(data.businessImpactScore);
    const employee = normalizeLikertMean(data.employeeImpactScore);
    const negative = normalizeLikertMean(data.policyStats?.policy_business_negative?.mean);
    const balance = normalizeLikertMean(data.policyStats?.policy_balance_needed?.mean);

    if (business > employee) {
      return `The current dataset suggests stronger business-side effects among owners and managers, with policy-related business burden also remaining visible. Demand for a balanced policy approach is strong at ${balance.toFixed(2)}.`;
    }

    if (employee > business) {
      return `The current dataset suggests stronger employee-side disruption, especially in stress, efficiency, and routine stability. Respondents still strongly favor a balanced policy approach at ${balance.toFixed(2)}.`;
    }

    return `The current dataset shows meaningful effects on both business performance and employee wellbeing, while policy negativity remains visible at ${negative.toFixed(2)} and respondents strongly support a balanced approach.`;
  }, [data]);

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <AdminShell>
          <p className="text-slate-600">Loading dashboard...</p>
        </AdminShell>
      </Layout>
    );
  }

  const {
    totalResponses,
    respondentCounts,
    locationCounts,
    supermarketTypeCounts,
    backupPowerCounts,
    independentStats,
    businessImpactScore,
    employeeImpactScore,
    policyStats,
  } = data;

  return (
    <Layout title="Admin Dashboard">
      <AdminShell>
        <AdminNav />

        <section className="mb-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Executive Overview
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
                Research Analytics Dashboard
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                Monitor live survey outcomes and extract policy-ready insights from owner/manager and floor employee responses.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/api/export?format=csv"
                className="inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Export CSV
              </a>

              <a
                href="/api/export?format=excel"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Export Excel
              </a>

              <a
                href="/api/export?format=pdf"
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Premium PDF Report
              </a>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/survey`)}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Copy Survey Link
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <KpiCard label="Total Responses" value={totalResponses} />
            <KpiCard
              label="Business Impact Score"
              value={normalizeLikertMean(businessImpactScore).toFixed(2)}
            />
            <KpiCard
              label="Employee Impact Score"
              value={normalizeLikertMean(employeeImpactScore).toFixed(2)}
            />
            <KpiCard
              label="Policy Negative Mean"
              value={normalizeLikertMean(policyStats?.policy_business_negative?.mean).toFixed(2)}
            />
            <KpiCard
              label="Balance Needed Mean"
              value={normalizeLikertMean(policyStats?.policy_balance_needed?.mean).toFixed(2)}
            />
          </div>

          <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
              Executive Interpretation
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700 md:text-base">
              {executiveSummary}
            </p>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-2">
          <ChartCard title="Role Distribution" subtitle="Owner/manager versus floor employee">
            <div className="mx-auto max-w-[320px]">
              <Doughnut
                data={{
                  labels: Object.keys(respondentCounts || {}).map(formatLabel),
                  datasets: [
                    {
                      data: Object.values(respondentCounts || {}),
                      backgroundColor: ['#0d3b66', '#14b8a6', '#cbd5e1'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '68%',
                }}
              />
            </div>
          </ChartCard>

          <ChartCard title="Location Distribution" subtitle="Dhaka/Chattogram versus other district/sub-urban">
            <div className="mx-auto max-w-[320px]">
              <Doughnut
                data={{
                  labels: Object.keys(locationCounts || {}).map(formatLabel),
                  datasets: [
                    {
                      data: Object.values(locationCounts || {}),
                      backgroundColor: ['#1d4ed8', '#f59e0b', '#cbd5e1'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '68%',
                }}
              />
            </div>
          </ChartCard>

          <ChartCard title="Supermarket Type" subtitle="Profile breakdown by market category">
            <Bar
              data={{
                labels: Object.keys(supermarketTypeCounts || {}).map(formatLabel),
                datasets: [
                  {
                    label: 'Responses',
                    data: Object.values(supermarketTypeCounts || {}),
                    backgroundColor: ['#0d3b66', '#14b8a6'],
                    borderRadius: 12,
                  },
                ],
              }}
              options={barOptions()}
            />
          </ChartCard>

          <ChartCard title="Backup Power Source" subtitle="Primary backup source used by respondents">
            <Bar
              data={{
                labels: Object.keys(backupPowerCounts || {}).map(formatLabel),
                datasets: [
                  {
                    label: 'Responses',
                    data: Object.values(backupPowerCounts || {}),
                    backgroundColor: ['#0d3b66', '#1d4ed8', '#94a3b8'],
                    borderRadius: 12,
                  },
                ],
              }}
              options={barOptions()}
            />
          </ChartCard>

          <ChartCard
            title="Independent Variable Mean Scores"
            subtitle="Top energy crisis factors reported by respondents"
            className="xl:col-span-2"
          >
            <Bar
              data={{
                labels: [
                  'Interruptions',
                  'Outage Duration',
                  'Unstable Electricity',
                  'Fuel Price',
                  'Tariff Pressure',
                  'Early Closure',
                  'Reduced Hours',
                  'Planning Uncertainty',
                  'Backup Dependence',
                  'Policy Flexibility',
                ],
                datasets: [
                  {
                    label: 'Mean Score',
                    data: [
                      normalizeLikertMean(independentStats?.iv_power_interruptions?.mean),
                      normalizeLikertMean(independentStats?.iv_outage_duration?.mean),
                      normalizeLikertMean(independentStats?.iv_unstable_electricity?.mean),
                      normalizeLikertMean(independentStats?.iv_fuel_price_pressure?.mean),
                      normalizeLikertMean(independentStats?.iv_tariff_pressure?.mean),
                      normalizeLikertMean(independentStats?.iv_early_closure?.mean),
                      normalizeLikertMean(independentStats?.iv_reduced_working_hours?.mean),
                      normalizeLikertMean(independentStats?.iv_daily_uncertainty?.mean),
                      normalizeLikertMean(independentStats?.iv_backup_dependence?.mean),
                      normalizeLikertMean(independentStats?.iv_policy_flexibility?.mean),
                    ],
                    backgroundColor: [
                      '#0d3b66',
                      '#1d4ed8',
                      '#2563eb',
                      '#14b8a6',
                      '#0f766e',
                      '#f59e0b',
                      '#f97316',
                      '#8b5cf6',
                      '#7c3aed',
                      '#64748b',
                    ],
                    borderRadius: 10,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    grid: { color: '#e2e8f0' },
                  },
                  x: { grid: { display: false } },
                },
              }}
            />
          </ChartCard>
        </section>

        <section className="mb-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Auto Findings
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Policy-Oriented Findings Cards
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
              These cards turn live dashboard metrics into short research-ready statements for report writing and presentation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {findings.map((item, index) => (
              <FindingCard key={index} title={item.title} body={item.body} />
            ))}
          </div>
        </section>
      </AdminShell>
    </Layout>
  );
}

function AdminShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div
      className={`rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl ${className}`}
    >
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function FindingCard({ title, body }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
    </div>
  );
}

function barOptions() {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
      },
      x: {
        grid: { display: false },
      },
    },
  };
}

function formatLabel(value) {
  if (!value) return '';
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}