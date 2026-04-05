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

    const businessImpact = Number(data.businessImpactScore || 0);
    const employeeImpact = Number(data.employeeImpactScore || 0);
    const policyNecessary = Number(data.policyStats?.policy_necessary?.mean || 0);
    const policyNegative = Number(data.policyStats?.policy_business_negative?.mean || 0);
    const policyBalance = Number(data.policyStats?.policy_balance_needed?.mean || 0);

    if (businessImpact > employeeImpact && policyNegative > policyNecessary) {
      return `Owner/manager-side effects appear stronger overall, while policies are also perceived as economically restrictive. Support for a balanced approach remains high at ${policyBalance.toFixed(2)}.`;
    }

    if (employeeImpact > businessImpact && policyNegative >= 3.5) {
      return `Employee-side disruption appears stronger overall, especially in work stress, routine disruption, and reduced motivation. Respondents still strongly support a balanced policy approach.`;
    }

    if (policyNecessary >= policyNegative) {
      return `Respondents still show meaningful support for the necessity of energy-saving policies, although both business and employee impacts remain visible.`;
    }

    return `The results indicate broad operational disruption, noticeable business and employee impacts, and clear support for balancing energy saving with economic continuity.`;
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
  const typeVsBalance = data?.typeVsBalance || {};
  const locationVsImpact = data?.locationVsImpact || {};
  const respondentCounts = data?.respondentCounts || {};
  const locationCounts = data?.locationCounts || {};
  const independentStats = data?.independentStats || {};
  const businessStats = data?.businessStats || {};
  const employeeStats = data?.employeeStats || {};
  const policyStats = data?.policyStats || {};
  const yearsInServiceCounts = data?.yearsInServiceCounts || {};
  const backupPowerCounts = data?.backupPowerCounts || {};
  const policyPreferredSolutionCounts = data?.policyPreferredSolutionCounts || {};
  const workloadChangeCounts = data?.workloadChangeCounts || {};
  const costIncreaseLevelCounts = data?.costIncreaseLevelCounts || {};
  const salesDecreaseLevelCounts = data?.salesDecreaseLevelCounts || {};

  const roleLabels = Object.keys(typeVsPolicy);
  const locationLabels = Object.keys(locationVsImpact);
  const balanceRoleLabels = Object.keys(typeVsBalance);
  const likertKeys = ['1', '2', '3', '4', '5'];

  const stackedPolicyDatasets = likertKeys.map((likertValue, index) => ({
    label: `Policy Negative ${likertValue}`,
    data: roleLabels.map((label) => (typeVsPolicy[label] && typeVsPolicy[label][likertValue]) || 0),
    backgroundColor: ['#dbeafe', '#93c5fd', '#60a5fa', '#2563eb', '#0d3b66'][index],
    borderRadius: 8,
  }));

  const stackedLocationDatasets = likertKeys.map((likertValue, index) => ({
    label: `Interruptions ${likertValue}`,
    data: locationLabels.map((label) => (locationVsImpact[label] && locationVsImpact[label][likertValue]) || 0),
    backgroundColor: ['#ccfbf1', '#99f6e4', '#5eead4', '#14b8a6', '#0f766e'][index],
    borderRadius: 8,
  }));

  const stackedBalanceDatasets = likertKeys.map((likertValue, index) => ({
    label: `Balance ${likertValue}`,
    data: balanceRoleLabels.map((label) => (typeVsBalance[label] && typeVsBalance[label][likertValue]) || 0),
    backgroundColor: ['#fef3c7', '#fde68a', '#fcd34d', '#f59e0b', '#b45309'][index],
    borderRadius: 8,
  }));

  const comparisonData = {
    labels: [
      'Business Impact',
      'Employee Impact',
      'Policy Necessary',
      'Policy Negative',
      'Balance Needed',
    ],
    datasets: [
      {
        label: 'Average Score',
        data: [
          Number(data.businessImpactScore || 0),
          Number(data.employeeImpactScore || 0),
          Number(policyStats?.policy_necessary?.mean || 0),
          Number(policyStats?.policy_business_negative?.mean || 0),
          Number(policyStats?.policy_balance_needed?.mean || 0),
        ],
        backgroundColor: ['#0d3b66', '#14b8a6', '#1d4ed8', '#f59e0b', '#7c3aed'],
        borderRadius: 12,
      },
    ],
  };

  const businessVsEmployeeQuestionData = {
    labels: [
      'Cost / Stress',
      'Sales Hours / Efficiency',
      'Profit / Job Difficulty',
      'Customer Handling',
      'Environment / Routine',
      'Motivation / Storage',
    ],
    datasets: [
      {
        label: 'Owner / Manager',
        data: [
          Number(businessStats?.business_cost_increase?.mean || 0),
          Number(businessStats?.business_sales_reduced_hours?.mean || 0),
          Number(businessStats?.business_profit_margin_decline?.mean || 0),
          Number(businessStats?.business_evening_customer_flow?.mean || 0),
          Number(businessStats?.business_backup_maintenance_cost?.mean || 0),
          Number(businessStats?.business_inventory_difficulty?.mean || 0),
        ],
        backgroundColor: '#0d3b66',
        borderRadius: 10,
      },
      {
        label: 'Floor Employee',
        data: [
          Number(employeeStats?.employee_work_stress?.mean || 0),
          Number(employeeStats?.employee_efficiency_decrease?.mean || 0),
          Number(employeeStats?.employee_job_difficulty?.mean || 0),
          Number(employeeStats?.employee_customer_handling?.mean || 0),
          Number(employeeStats?.employee_uncomfortable_environment?.mean || 0),
          Number(employeeStats?.employee_low_motivation?.mean || 0),
        ],
        backgroundColor: '#14b8a6',
        borderRadius: 10,
      },
    ],
  };

  const respondentShareData = {
    labels: Object.keys(respondentCounts).map(formatLabel),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(respondentCounts),
        backgroundColor: ['#0d3b66', '#14b8a6', '#cbd5e1'],
        borderRadius: 12,
      },
    ],
  };

  const locationShareData = {
    labels: Object.keys(locationCounts).map(formatLabel),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(locationCounts),
        backgroundColor: ['#1d4ed8', '#f59e0b'],
        borderRadius: 12,
      },
    ],
  };

  const yearsInServiceData = {
    labels: Object.keys(yearsInServiceCounts).map(formatLabel),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(yearsInServiceCounts),
        backgroundColor: ['#0d3b66', '#1d4ed8', '#14b8a6'],
        borderRadius: 12,
      },
    ],
  };

  const backupPowerData = {
    labels: Object.keys(backupPowerCounts).map(formatLabel),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(backupPowerCounts),
        backgroundColor: ['#0d3b66', '#1d4ed8', '#94a3b8'],
        borderRadius: 12,
      },
    ],
  };

  const independentMeanData = {
    labels: [
      'Interruptions',
      'Outage Duration',
      'Unstable Supply',
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
          Number(independentStats?.iv_power_interruptions?.mean || 0),
          Number(independentStats?.iv_outage_duration?.mean || 0),
          Number(independentStats?.iv_unstable_electricity?.mean || 0),
          Number(independentStats?.iv_fuel_price_pressure?.mean || 0),
          Number(independentStats?.iv_tariff_pressure?.mean || 0),
          Number(independentStats?.iv_early_closure?.mean || 0),
          Number(independentStats?.iv_reduced_working_hours?.mean || 0),
          Number(independentStats?.iv_daily_uncertainty?.mean || 0),
          Number(independentStats?.iv_backup_dependence?.mean || 0),
          Number(independentStats?.iv_policy_flexibility?.mean || 0),
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
        borderRadius: 12,
      },
    ],
  };

  const workloadData = {
    labels: Object.keys(workloadChangeCounts).map(formatLabel),
    datasets: [
      {
        label: 'Floor Employee Responses',
        data: Object.values(workloadChangeCounts),
        backgroundColor: ['#0d3b66', '#94a3b8', '#14b8a6'],
        borderRadius: 12,
      },
    ],
  };

  const costLevelData = {
    labels: Object.keys(costIncreaseLevelCounts).map(formatLabel),
    datasets: [
      {
        label: 'Owner / Manager Responses',
        data: Object.values(costIncreaseLevelCounts),
        backgroundColor: ['#cbd5e1', '#93c5fd', '#2563eb', '#0d3b66'],
        borderRadius: 12,
      },
    ],
  };

  const salesLevelData = {
    labels: Object.keys(salesDecreaseLevelCounts).map(formatLabel),
    datasets: [
      {
        label: 'Owner / Manager Responses',
        data: Object.values(salesDecreaseLevelCounts),
        backgroundColor: ['#d1fae5', '#86efac', '#f59e0b', '#dc2626'],
        borderRadius: 12,
      },
    ],
  };

  const policySolutionData = {
    labels: Object.keys(policyPreferredSolutionCounts).map(formatLabel),
    datasets: [
      {
        label: 'Responses',
        data: Object.values(policyPreferredSolutionCounts),
        backgroundColor: ['#0d3b66', '#14b8a6', '#f59e0b', '#7c3aed'],
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

          <div className="mt-8 grid gap-4 md:grid-cols-5">
            <MiniKpi label="Business Impact" value={Number(data.businessImpactScore || 0).toFixed(2)} />
            <MiniKpi label="Employee Impact" value={Number(data.employeeImpactScore || 0).toFixed(2)} />
            <MiniKpi
              label="Policy Necessary"
              value={Number(policyStats?.policy_necessary?.mean || 0).toFixed(2)}
            />
            <MiniKpi
              label="Policy Negative"
              value={Number(policyStats?.policy_business_negative?.mean || 0).toFixed(2)}
            />
            <MiniKpi
              label="Balance Needed"
              value={Number(policyStats?.policy_balance_needed?.mean || 0).toFixed(2)}
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <AnalyticsCard
            title="Role vs Policy Negative Effect"
            subtitle="Stacked distribution of policy negativity across respondent groups"
          >
            <Bar
              data={{ labels: roleLabels.map(formatLabel), datasets: stackedPolicyDatasets }}
              options={stackedChartOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Location vs Power Interruptions"
            subtitle="Stacked distribution of interruption intensity by location"
          >
            <Bar
              data={{ labels: locationLabels.map(formatLabel), datasets: stackedLocationDatasets }}
              options={stackedChartOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Role vs Balance Needed"
            subtitle="Stacked distribution of support for balanced policy"
          >
            <Bar
              data={{ labels: balanceRoleLabels.map(formatLabel), datasets: stackedBalanceDatasets }}
              options={stackedChartOptions()}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Comparative Score Overview"
            subtitle="Average score comparison across major study dimensions"
          >
            <Bar data={comparisonData} options={singleBarOptions(5)} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Owner/Manager vs Floor Employee"
            subtitle="Comparison of business-side and employee-side dimensions"
          >
            <Bar
              data={businessVsEmployeeQuestionData}
              options={{
                responsive: true,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { beginAtZero: true, max: 5, grid: { color: '#e2e8f0' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </AnalyticsCard>

          <AnalyticsCard
            title="Response Composition"
            subtitle="Distribution of submitted responses by role"
          >
            <Bar data={respondentShareData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Location Composition"
            subtitle="Distribution of responses by place of operation"
          >
            <Bar data={locationShareData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Years in Business/Service"
            subtitle="Experience distribution of respondents"
          >
            <Bar data={yearsInServiceData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Primary Backup Power Source"
            subtitle="Backup arrangement used by respondents"
          >
            <Bar data={backupPowerData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Independent Variable Mean Scores"
            subtitle="Average effect scores across the 10 energy crisis factors"
            className="xl:col-span-2"
          >
            <Bar data={independentMeanData} options={singleBarOptions(5)} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Employee Workload Change"
            subtitle="How workload changed under current energy conditions"
          >
            <Bar data={workloadData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Operational Cost Increase Level"
            subtitle="Owner/manager perception of cost escalation"
          >
            <Bar data={costLevelData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Sales Decrease Level"
            subtitle="Owner/manager perception of sales reduction"
          >
            <Bar data={salesLevelData} options={singleBarOptions()} />
          </AnalyticsCard>

          <AnalyticsCard
            title="Preferred Policy Solution"
            subtitle="Respondents’ preferred mitigation direction"
          >
            <Bar data={policySolutionData} options={singleBarOptions()} />
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

      <div className="relative z-10 mx-auto max-w-7xl">{children}</div>
    </div>
  );
}

function AnalyticsCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl ${className}`}>
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

function formatLabel(value) {
  if (!value) return '';
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
