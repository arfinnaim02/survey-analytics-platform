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

    const business = Number(data.businessImpactScore || 0);
    const employee = Number(data.employeeImpactScore || 0);
    const policyNecessary = Number(data.policyStats?.policy_necessary?.mean || 0);
    const policyPressure = Number(data.policyStats?.policy_pressure?.mean || 0);
    const ownerCount = Number(data.respondentCounts?.owner || 0);
    const employeeCount = Number(data.respondentCounts?.employee || 0);
    const dhakaCount = Number(data.locationCounts?.Dhaka || 0);
    const outsideCount = Number(data.locationCounts?.['Outside Dhaka'] || 0);

    const list = [];

    if (business >= 3.5) {
      list.push({
        title: 'High business-side pressure',
        body: `Owner-side business impact is elevated with a composite score of ${business.toFixed(2)}, suggesting notable cost, sales, and profit disruption.`,
      });
    } else {
      list.push({
        title: 'Moderate business impact',
        body: `Owner-side business impact score is ${business.toFixed(2)}, indicating measurable but comparatively moderate financial strain.`,
      });
    }

    if (employee >= 3.5) {
      list.push({
        title: 'Employees report strong disruption',
        body: `Employee impact score is ${employee.toFixed(2)}, indicating stress, efficiency loss, and customer-handling difficulty are substantial concerns.`,
      });
    } else {
      list.push({
        title: 'Employee impact remains visible',
        body: `Employee impact score is ${employee.toFixed(2)}, showing that workforce challenges exist even when not at the highest severity level.`,
      });
    }

    if (policyPressure > policyNecessary) {
      list.push({
        title: 'Policy burden exceeds policy support',
        body: `Mean policy pressure (${policyPressure.toFixed(2)}) is higher than perceived policy necessity (${policyNecessary.toFixed(2)}), suggesting concern over economic trade-offs.`,
      });
    } else {
      list.push({
        title: 'Policy necessity remains comparatively stronger',
        body: `Perceived policy necessity (${policyNecessary.toFixed(2)}) is equal to or above policy pressure (${policyPressure.toFixed(2)}), indicating partial public justification for restrictions.`,
      });
    }

    if (outsideCount > dhakaCount) {
      list.push({
        title: 'Outside-Dhaka participation leads',
        body: `Responses outside Dhaka (${outsideCount}) exceed Dhaka (${dhakaCount}), which may strengthen comparative interpretation beyond the capital context.`,
      });
    } else {
      list.push({
        title: 'Dhaka-based responses remain substantial',
        body: `Dhaka responses (${dhakaCount}) are equal to or higher than outside-Dhaka responses (${outsideCount}), supporting city-centered interpretation as well.`,
      });
    }

    if (employeeCount > ownerCount) {
      list.push({
        title: 'Workforce voice is more prominent',
        body: `Employee responses (${employeeCount}) outnumber owner/manager responses (${ownerCount}), giving stronger weight to staff-side perceptions.`,
      });
    } else {
      list.push({
        title: 'Management voice is comparatively strong',
        body: `Owner/manager responses (${ownerCount}) are equal to or exceed employee responses (${employeeCount}), strengthening business-side interpretation.`,
      });
    }

    return list.slice(0, 5);
  }, [data]);

  const executiveSummary = useMemo(() => {
    if (!data) return '';

    const business = Number(data.businessImpactScore || 0);
    const employee = Number(data.employeeImpactScore || 0);
    const pressure = Number(data.policyStats?.policy_pressure?.mean || 0);
    const necessary = Number(data.policyStats?.policy_necessary?.mean || 0);

    if (business > employee && pressure >= necessary) {
      return 'The dataset indicates that the energy crisis is generating stronger financial pressure for supermarket owners, while current policies are also being perceived as economically burdensome.';
    }

    if (employee > business && pressure >= necessary) {
      return 'The dataset indicates that employee-side disruption is especially visible, and respondents also perceive a meaningful economic burden from current policy measures.';
    }

    if (necessary > pressure) {
      return 'The dataset suggests that respondents still recognize the necessity of energy-saving measures, even though operational and workforce impacts remain evident.';
    }

    return 'The dataset suggests measurable operational, financial, and workforce impacts, with mixed but policy-relevant perceptions regarding the necessity and burden of current measures.';
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
    generalStats,
    businessImpactScore,
    employeeImpactScore,
    policyStats,
  } = data;

  const typeLabels = Object.keys(respondentCounts || {});
  const typeData = Object.values(respondentCounts || {});
  const locationLabels = Object.keys(locationCounts || {});
  const locationData = Object.values(locationCounts || {});

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
                Monitor live survey outcomes, compare response groups, and extract policy-ready findings from the collected dataset.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/api/export"
                className="inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                Export CSV
              </a>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Print Summary
              </button>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/survey`)}
                className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                Copy Survey Link
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <KpiCard label="Total Responses" value={totalResponses} />
            <KpiCard label="Business Impact Score" value={Number(businessImpactScore || 0).toFixed(2)} />
            <KpiCard label="Employee Impact Score" value={Number(employeeImpactScore || 0).toFixed(2)} />
            <KpiCard label="Policy Pressure Mean" value={Number(policyStats?.policy_pressure?.mean || 0).toFixed(2)} />
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
          <ChartCard title="Respondent Type Distribution" subtitle="Owner/manager versus employee share">
            <div className="mx-auto max-w-[320px]">
              <Doughnut
                data={{
                  labels: typeLabels,
                  datasets: [
                    {
                      data: typeData,
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

          <ChartCard title="Location Distribution" subtitle="Dhaka versus outside Dhaka">
            <div className="mx-auto max-w-[320px]">
              <Doughnut
                data={{
                  labels: locationLabels,
                  datasets: [
                    {
                      data: locationData,
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

          <ChartCard
            title="General Impact Mean Scores"
            subtitle="Average perception across major operational dimensions"
            className="xl:col-span-2"
          >
            <Bar
              data={{
                labels: ['Operations', 'Service Time', 'Working Hours', 'Customer Flow'],
                datasets: [
                  {
                    label: 'Mean Score',
                    data: [
                      generalStats?.op_negative_impact?.mean || 0,
                      generalStats?.op_service_time?.mean || 0,
                      generalStats?.op_working_hours?.mean || 0,
                      generalStats?.op_customer_flow?.mean || 0,
                    ],
                    backgroundColor: ['#0d3b66', '#1d4ed8', '#14b8a6', '#f59e0b'],
                    borderRadius: 12,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true, max: 5, grid: { color: '#e2e8f0' } },
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
              These cards turn live dashboard metrics into short research-ready statements you can use for report drafting, presentation notes, or policy discussion.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {findings.map((item, index) => (
              <FindingCard
                key={index}
                title={item.title}
                body={item.body}
              />
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
    <div className={`rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl ${className}`}>
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