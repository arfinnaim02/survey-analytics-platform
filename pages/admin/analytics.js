import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export const getServerSideProps = async (ctx) => requireAdmin(ctx);

export default function AdvancedAnalytics() {
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

  const summary = useMemo(() => {
    if (!data) return '';

    const ownerBusiness = Number(data.businessImpactScore || 0);
    const employeeImpact = Number(data.employeeImpactScore || 0);
    const policyNecessary = Number(data.policyStats?.policy_necessary?.mean || 0);
    const policyPressure = Number(data.policyStats?.policy_pressure?.mean || 0);

    if (ownerBusiness > employeeImpact && policyPressure > policyNecessary) {
      return 'The dataset suggests stronger financial pressure among owners, while policy burden is also perceived more strongly than policy necessity.';
    }

    if (employeeImpact > ownerBusiness && policyPressure > 3.5) {
      return 'Employees appear to report stronger personal disruption, and respondents also indicate notable economic pressure from current policies.';
    }

    if (policyNecessary >= policyPressure) {
      return 'Respondents show mixed but relatively stronger support for policy necessity, even though operational and workforce impacts remain visible.';
    }

    return 'Both business and employee groups appear affected, with policy responses showing a balance between perceived necessity and economic pressure.';
  }, [data]);

  if (loading) {
    return (
      <Layout title="Analytics">
        <AdminAnalyticsShell>
          <AdminNav />
          <p className="text-slate-600">Loading analytics...</p>
        </AdminAnalyticsShell>
      </Layout>
    );
  }

  const typeVsPolicy = data?.typeVsPolicy || {};
  const locationVsImpact = data?.locationVsImpact || {};
  const respondentCounts = data?.respondentCounts || {};
  const locationCounts = data?.locationCounts || {};
  const generalStats = data?.generalStats || {};
  const businessStats = data?.businessStats || {};
  const employeeStats = data?.employeeStats || {};
  const policyStats = data?.policyStats || {};

  const typeLabels = Object.keys(typeVsPolicy);
  const locationLabels = Object.keys(locationVsImpact);
  const likertKeys = ['1', '2', '3', '4', '5'];

  const stackedTypeDatasets = likertKeys.map((likertValue, index) => ({
    label: `Pressure ${likertValue}`,
    data: typeLabels.map((label) => (typeVsPolicy[label] && typeVsPolicy[label][likertValue]) || 0),
    backgroundColor: ['#dbeafe', '#93c5fd', '#60a5fa', '#2563eb', '#0d3b66'][index],
    borderRadius: 8,
  }));

  const stackedLocationDatasets = likertKeys.map((likertValue, index) => ({
    label: `Impact ${likertValue}`,
    data: locationLabels.map((label) => (locationVsImpact[label] && locationVsImpact[label][likertValue]) || 0),
    backgroundColor: ['#ccfbf1', '#99f6e4', '#5eead4', '#14b8a6', '#0f766e'][index],
    borderRadius: 8,
  }));

  const comparisonData = {
    labels: ['Business/Owner Impact', 'Employee Impact', 'Policy Necessary', 'Policy Pressure'],
    datasets: [
      {
        label: 'Average Score',
        data: [
          Number(data.businessImpactScore || 0),
          Number(data.employeeImpactScore || 0),
          Number(policyStats?.policy_necessary?.mean || 0),
          Number(policyStats?.policy_pressure?.mean || 0),
        ],
        backgroundColor: ['#0d3b66', '#14b8a6', '#1d4ed8', '#f59e0b'],
        borderRadius: 12,
      },
    ],
  };

  const businessVsEmployeeQuestionData = {
    labels: ['Cost / Stress', 'Sales / Efficiency', 'Profit / Customer Handling'],
    datasets: [
      {
        label: 'Owners',
        data: [
          Number(businessStats?.business_cost?.mean || 0),
          Number(businessStats?.business_sales?.mean || 0),
          Number(businessStats?.business_profit?.mean || 0),
        ],
        backgroundColor: '#0d3b66',
        borderRadius: 10,
      },
      {
        label: 'Employees',
        data: [
          Number(employeeStats?.emp_stress?.mean || 0),
          Number(employeeStats?.emp_efficiency?.mean || 0),
          Number(employeeStats?.emp_customer_handling?.mean || 0),
        ],
        backgroundColor: '#14b8a6',
        borderRadius: 10,
      },
    ],
  };

  const respondentShareData = {
    labels: ['Owners / Managers', 'Employees'],
    datasets: [
      {
        label: 'Responses',
        data: [
          Number(respondentCounts?.owner || 0),
          Number(respondentCounts?.employee || 0),
        ],
        backgroundColor: ['#0d3b66', '#14b8a6'],
        borderRadius: 12,
      },
    ],
  };

  const locationShareData = {
    labels: ['Dhaka', 'Outside Dhaka'],
    datasets: [
      {
        label: 'Responses',
        data: [
          Number(locationCounts?.Dhaka || 0),
          Number(locationCounts?.['Outside Dhaka'] || 0),
        ],
        backgroundColor: ['#1d4ed8', '#f59e0b'],
        borderRadius: 12,
      },
    ],
  };

  const generalMeanData = {
    labels: ['Operations', 'Service Time', 'Working Hours', 'Customer Flow'],
    datasets: [
      {
        label: 'Mean Score',
        data: [
          Number(generalStats?.op_negative_impact?.mean || 0),
          Number(generalStats?.op_service_time?.mean || 0),
          Number(generalStats?.op_working_hours?.mean || 0),
          Number(generalStats?.op_customer_flow?.mean || 0),
        ],
        backgroundColor: ['#0d3b66', '#1d4ed8', '#14b8a6', '#f59e0b'],
        borderRadius: 12,
      },
    ],
  };

  return (
    <Layout title="Analytics">
      <AdminAnalyticsShell>
        <AdminNav />

        <section className="mb-8 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Advanced Analytics
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Comparative Research Insights
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            Evaluate differences across respondent groups, locations, and policy perceptions using stacked distributions, comparative averages, and response composition.
          </p>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Interpretation Snapshot
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700 md:text-base">
              {summary}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <MiniKpi
              label="Owner Impact"
              value={Number(data.businessImpactScore || 0).toFixed(2)}
            />
            <MiniKpi
              label="Employee Impact"
              value={Number(data.employeeImpactScore || 0).toFixed(2)}
            />
            <MiniKpi
              label="Policy Necessary"
              value={Number(policyStats?.policy_necessary?.mean || 0).toFixed(2)}
            />
            <MiniKpi
              label="Policy Pressure"
              value={Number(policyStats?.policy_pressure?.mean || 0).toFixed(2)}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <AnalyticsCard
            title="Respondent Type vs Policy Pressure"
            subtitle="Stacked distribution of pressure perception across owner and employee groups"
          >
            <Bar
              data={{ labels: typeLabels, datasets: stackedTypeDatasets }}
              options={stackedChartOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Location vs Negative Impact"
            subtitle="Stacked distribution of impact perception by geographic group"
          >
            <Bar
              data={{ labels: locationLabels, datasets: stackedLocationDatasets }}
              options={stackedChartOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Comparative Score Overview"
            subtitle="Average score comparison across core study dimensions"
          >
            <Bar
              data={comparisonData}
              options={singleBarOptions(5)}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Owners vs Employees"
            subtitle="Parallel comparison of business-related and employee-related dimensions"
          >
            <Bar
              data={businessVsEmployeeQuestionData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 5,
                    grid: { color: '#e2e8f0' },
                  },
                  x: {
                    grid: { display: false },
                  },
                },
              }}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Response Composition"
            subtitle="Distribution of submitted responses by respondent category"
          >
            <Bar
              data={respondentShareData}
              options={singleBarOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Location Composition"
            subtitle="Distribution of responses by place of operation"
          >
            <Bar
              data={locationShareData}
              options={singleBarOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="General Impact Mean Scores"
            subtitle="Operational effects reported across the four general research questions"
            className="xl:col-span-2"
          >
            <Bar
              data={generalMeanData}
              options={singleBarOptions(5)}
            />
          </AnalyticsCard>
        </section>
      </AdminAnalyticsShell>
    </Layout>
  );
}

function AdminAnalyticsShell({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  );
}

function AnalyticsCard({ title, subtitle, children, className = '' }) {
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

function MiniKpi({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function stackedChartOptions() {
  return {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: { color: '#e2e8f0' },
      },
    },
  };
}

function singleBarOptions(max = undefined) {
  return {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ...(max ? { max } : {}),
        grid: { color: '#e2e8f0' },
      },
      x: {
        grid: { display: false },
      },
    },
  };
}