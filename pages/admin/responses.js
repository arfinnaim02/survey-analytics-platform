import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';

export const getServerSideProps = async (ctx) => requireAdmin(ctx);

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/responses');
    const json = await res.json();
    setResponses(json.data || []);
    setLoading(false);
  }

  async function toggleReviewed(id, currentValue) {
    try {
      setWorkingId(id);

      const res = await fetch('/api/response-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          is_reviewed: !currentValue,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update review status');
      }

      setResponses((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_reviewed: !currentValue } : item
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to update');
    } finally {
      setWorkingId(null);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm('Are you sure you want to delete this response?');
    if (!confirmed) return;

    try {
      setWorkingId(id);

      const res = await fetch('/api/response-actions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error('Failed to delete response');
      }

      setResponses((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <Layout title="Responses">
      <div className="relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(13,59,102,0.08),_transparent_30%),linear-gradient(to_bottom,_#ffffff,_#f8fafc)]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <AdminNav />

          <section className="mb-6 rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-2xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Response Management
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                  Submitted Responses
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Review, mark, and delete submitted responses in a structured format.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/export?format=csv"
                  className="inline-flex items-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark"
                >
                  Export Responses CSV
                </a>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-6">
            {loading ? (
              <p className="text-slate-600">Loading responses...</p>
            ) : responses.length === 0 ? (
              <p className="text-slate-600">No responses found.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full bg-white">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Supermarket Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Actions
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((resp) => (
                      <tr key={resp.id} className="border-t border-slate-200 align-top">
                        <td className="px-4 py-4 text-sm text-slate-700">{resp.id}</td>
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {formatLabel(resp.role)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatLabel(resp.supermarket_type)}
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {formatLabel(resp.location)}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              resp.is_reviewed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {resp.is_reviewed ? 'Reviewed' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-700">
                          {new Date(resp.submitted_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="flex flex-col gap-2">
                            <button
                              type="button"
                              disabled={workingId === resp.id}
                              onClick={() => toggleReviewed(resp.id, resp.is_reviewed)}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                              {resp.is_reviewed ? 'Mark Pending' : 'Mark Reviewed'}
                            </button>

                            <button
                              type="button"
                              disabled={workingId === resp.id}
                              onClick={() => handleDelete(resp.id)}
                              className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <details className="group">
                            <summary className="cursor-pointer font-semibold text-primary marker:hidden">
                              View Response Table
                            </summary>

                            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                              <div className="grid gap-6 p-4">
                                <ResponseSection
                                  title="Profile & Demographics"
                                  rows={[
                                    ['Role', formatLabel(resp.role)],
                                    ['Supermarket Type', formatLabel(resp.supermarket_type)],
                                    ['Location', formatLabel(resp.location)],
                                    ['Primary Backup Power Source', formatLabel(resp.backup_power_source)],
                                    ['Years in Business/Service', formatLabel(resp.years_in_service)],
                                  ]}
                                />

                                <ResponseSection
                                  title="Energy Crisis Factors"
                                  rows={[
                                    ['Frequent electricity interruptions affect daily operations', resp.iv_power_interruptions],
                                    ['Power outages last for long durations and disrupt service', resp.iv_outage_duration],
                                    ['Lack of stable electricity affects business continuity', resp.iv_unstable_electricity],
                                    ['Rising fuel/oil prices increase operational pressure', resp.iv_fuel_price_pressure],
                                    ['Electricity tariff increases make utility costs difficult to manage', resp.iv_tariff_pressure],
                                    ['Early shop closure policies restrict profitable business hours', resp.iv_early_closure],
                                    ['Reduced working hours (9–4) limit customer flow', resp.iv_reduced_working_hours],
                                    ['Energy supply issues create uncertainty in daily planning', resp.iv_daily_uncertainty],
                                    ['The energy crisis increases dependence on backup power systems', resp.iv_backup_dependence],
                                    ['Energy-related policies restrict business flexibility', resp.iv_policy_flexibility],
                                  ]}
                                />

                                {resp.role === 'owner_manager' && (
                                  <ResponseSection
                                    title="Business Impact"
                                    rows={[
                                      ['Operational cost increase level', formatLabel(resp.business_cost_increase_level)],
                                      ['Sales decrease level', formatLabel(resp.business_sales_decrease_level)],
                                      ['Operational costs have increased due to the energy crisis', resp.business_cost_increase],
                                      ['Daily sales have decreased due to reduced business hours', resp.business_sales_reduced_hours],
                                      ['Profit margins have declined', resp.business_profit_margin_decline],
                                      ['Customer flow has decreased during evening hours', resp.business_evening_customer_flow],
                                      ['Inventory management (refrigeration/storage) has become difficult', resp.business_inventory_difficulty],
                                      ['Maintenance costs for backup systems have increased', resp.business_backup_maintenance_cost],
                                    ]}
                                  />
                                )}

                                {resp.role === 'floor_employee' && (
                                  <ResponseSection
                                    title="Employee Impact"
                                    rows={[
                                      ['Workload change', formatLabel(resp.employee_workload_change)],
                                      ['The energy crisis has increased my work stress', resp.employee_work_stress],
                                      ['My work efficiency has decreased', resp.employee_efficiency_decrease],
                                      ['Power-related issues make my job more difficult', resp.employee_job_difficulty],
                                      ['Customer handling becomes more difficult during disruptions', resp.employee_customer_handling],
                                      ['The working environment becomes uncomfortable during outages', resp.employee_uncomfortable_environment],
                                      ['My daily work routine has been disrupted', resp.employee_routine_disruption],
                                      ['I feel less motivated to work under current conditions', resp.employee_low_motivation],
                                    ]}
                                  />
                                )}

                                <ResponseSection
                                  title="Policy Perception & Mitigation"
                                  rows={[
                                    ['Energy-saving policies are necessary for the current situation', resp.policy_necessary],
                                    ['These policies negatively affect business performance', resp.policy_business_negative],
                                    ['A balance between energy saving and economic activity is needed', resp.policy_balance_needed],
                                    ['Preferred policy solution', formatLabel(resp.policy_preferred_solution)],
                                  ]}
                                />
                              </div>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}

function ResponseSection({ title, rows }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
          {title}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody>
            {rows.map(([label, value], index) => (
              <tr key={index} className="border-b border-slate-200 last:border-b-0">
                <td className="w-[65%] px-4 py-3 text-sm text-slate-700">
                  {label}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {value === null || value === undefined || value === ''
                    ? '—'
                    : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatLabel(value) {
  if (!value) return '';
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}