import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import { requireAdmin } from '../../lib/auth';
import AdminNav from '../../components/AdminNav';

export const getServerSideProps = async (ctx) => requireAdmin(ctx);

const ROLE_OPTIONS = [
  ['owner_manager', 'Owner / Manager'],
  ['floor_employee', 'Floor Employee'],
];

const SUPERMARKET_OPTIONS = [
  ['brand_chain', 'Brand Chain'],
  ['independent_local_supermarket', 'Independent Local Supermarket'],
];

const LOCATION_OPTIONS = [
  ['dhaka_chattogram', 'Dhaka / Chattogram'],
  ['other_district_suburban', 'Other District / Sub-urban'],
];

const BACKUP_OPTIONS = [
  ['diesel_generator', 'Diesel Generator'],
  ['ips_solar', 'IPS / Solar'],
  ['no_backup', 'No Backup'],
];

const YEARS_OPTIONS = [
  ['less_than_2_years', 'Less than 2 years'],
  ['2_to_5_years', '2–5 years'],
  ['more_than_5_years', 'More than 5 years'],
];

const LEVEL_OPTIONS = [
  ['no_increase', 'No increase'],
  ['low', 'Low'],
  ['moderate', 'Moderate'],
  ['high', 'High'],
];

const SALES_OPTIONS = [
  ['no_decrease', 'No decrease'],
  ['slight', 'Slight'],
  ['moderate', 'Moderate'],
  ['significant', 'Significant'],
];

const WORKLOAD_OPTIONS = [
  ['decreased', 'Decreased'],
  ['no_change', 'No change'],
  ['increased', 'Increased'],
];

const POLICY_OPTIONS = [
  ['continue_current_policy', 'Continue current policy'],
  ['relax_restrictions', 'Relax restrictions for supermarkets'],
  ['provide_subsidy_support', 'Provide subsidy / Support'],
  ['flexible_business_hours', 'Flexible business hours'],
];

const LIKERT_OPTIONS = [
  [1, 'Strongly Agree'],
  [2, 'Agree'],
  [3, 'Neutral'],
  [4, 'Disagree'],
  [5, 'Strongly Disagree'],
];

export default function ResponsesPage() {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingResponse, setEditingResponse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/responses');
    const json = await res.json();
    setResponses(json.data || []);
    setLoading(false);
  }

  const allVisibleIds = useMemo(() => responses.map((r) => r.id), [responses]);

  const isAllSelected =
    responses.length > 0 && allVisibleIds.every((id) => selectedIds.includes(id));

  function toggleSelectOne(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allVisibleIds);
    }
  }

  function openEditModal(response) {
    setEditingResponse(response);
    setEditForm({
      role: response.role || '',
      supermarket_type: response.supermarket_type || '',
      location: response.location || '',
      backup_power_source: response.backup_power_source || '',
      years_in_service: response.years_in_service || '',

      iv_power_interruptions: Number(response.iv_power_interruptions || 3),
      iv_outage_duration: Number(response.iv_outage_duration || 3),
      iv_unstable_electricity: Number(response.iv_unstable_electricity || 3),
      iv_fuel_price_pressure: Number(response.iv_fuel_price_pressure || 3),
      iv_tariff_pressure: Number(response.iv_tariff_pressure || 3),
      iv_early_closure: Number(response.iv_early_closure || 3),
      iv_reduced_working_hours: Number(response.iv_reduced_working_hours || 3),
      iv_daily_uncertainty: Number(response.iv_daily_uncertainty || 3),
      iv_backup_dependence: Number(response.iv_backup_dependence || 3),
      iv_policy_flexibility: Number(response.iv_policy_flexibility || 3),

      business_cost_increase_level: response.business_cost_increase_level || '',
      business_sales_decrease_level: response.business_sales_decrease_level || '',
      business_cost_increase: Number(response.business_cost_increase || 3),
      business_sales_reduced_hours: Number(response.business_sales_reduced_hours || 3),
      business_profit_margin_decline: Number(response.business_profit_margin_decline || 3),
      business_evening_customer_flow: Number(response.business_evening_customer_flow || 3),
      business_inventory_difficulty: Number(response.business_inventory_difficulty || 3),
      business_backup_maintenance_cost: Number(response.business_backup_maintenance_cost || 3),

      employee_workload_change: response.employee_workload_change || '',
      employee_work_stress: Number(response.employee_work_stress || 3),
      employee_efficiency_decrease: Number(response.employee_efficiency_decrease || 3),
      employee_job_difficulty: Number(response.employee_job_difficulty || 3),
      employee_customer_handling: Number(response.employee_customer_handling || 3),
      employee_uncomfortable_environment: Number(response.employee_uncomfortable_environment || 3),
      employee_routine_disruption: Number(response.employee_routine_disruption || 3),
      employee_low_motivation: Number(response.employee_low_motivation || 3),

      policy_necessary: Number(response.policy_necessary || 3),
      policy_business_negative: Number(response.policy_business_negative || 3),
      policy_balance_needed: Number(response.policy_balance_needed || 3),
      policy_preferred_solution: response.policy_preferred_solution || '',
    });
  }

  function closeEditModal() {
    if (savingEdit) return;
    setEditingResponse(null);
    setEditForm({});
  }

  function handleEditChange(field, value) {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  }

  async function saveEditedResponse() {
    if (!editingResponse?.id) return;

    try {
      setSavingEdit(true);

      const res = await fetch('/api/response-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingResponse.id,
          updates: editForm,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update response');
      }

      const json = await res.json();
      const updated = json.data;

      setResponses((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      closeEditModal();
    } catch (err) {
      alert(err.message || 'Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
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
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setWorkingId(null);
    }
  }

  async function handleBulkReview(isReviewed) {
    if (selectedIds.length === 0) {
      alert('Please select at least one response.');
      return;
    }

    try {
      setWorkingId('bulk-review');

      const res = await fetch('/api/response-actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          is_reviewed: isReviewed,
        }),
      });

      if (!res.ok) {
        throw new Error('Bulk review update failed');
      }

      setResponses((prev) =>
        prev.map((item) =>
          selectedIds.includes(item.id)
            ? { ...item, is_reviewed: isReviewed }
            : item
        )
      );
    } catch (err) {
      alert(err.message || 'Bulk action failed');
    } finally {
      setWorkingId(null);
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.length === 0) {
      alert('Please select at least one response.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected response(s)?`
    );
    if (!confirmed) return;

    try {
      setWorkingId('bulk-delete');

      const res = await fetch('/api/response-actions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) {
        throw new Error('Bulk delete failed');
      }

      setResponses((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);
    } catch (err) {
      alert(err.message || 'Bulk delete failed');
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
                  Review, edit, mark, and delete submitted responses from the admin panel.
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

          <section className="mb-6 rounded-[2rem] border border-white/70 bg-white/80 p-4 shadow-2xl shadow-slate-200/50 backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Selected: {selectedIds.length}
                </p>
                <p className="text-sm text-slate-500">
                  Use bulk actions to review or remove multiple responses at once.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={workingId === 'bulk-review' || workingId === 'bulk-delete'}
                  onClick={() => handleBulkReview(true)}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                >
                  Mark Reviewed
                </button>

                <button
                  type="button"
                  disabled={workingId === 'bulk-review' || workingId === 'bulk-delete'}
                  onClick={() => handleBulkReview(false)}
                  className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
                >
                  Mark Pending
                </button>

                <button
                  type="button"
                  disabled={workingId === 'bulk-review' || workingId === 'bulk-delete'}
                  onClick={handleBulkDelete}
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Delete Selected
                </button>
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
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                      </th>
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
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(resp.id)}
                            onChange={() => toggleSelectOne(resp.id)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                        </td>
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
                              onClick={() => openEditModal(resp)}
                              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                            >
                              Edit Response
                            </button>

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
                                    ['Frequent electricity interruptions affect daily operations', formatLikert(resp.iv_power_interruptions)],
                                    ['Power outages last for long durations and disrupt service', formatLikert(resp.iv_outage_duration)],
                                    ['Lack of stable electricity affects business continuity', formatLikert(resp.iv_unstable_electricity)],
                                    ['Rising fuel/oil prices increase operational pressure', formatLikert(resp.iv_fuel_price_pressure)],
                                    ['Electricity tariff increases make utility costs difficult to manage', formatLikert(resp.iv_tariff_pressure)],
                                    ['Early shop closure policies restrict profitable business hours', formatLikert(resp.iv_early_closure)],
                                    ['Reduced working hours (9–4) limit customer flow', formatLikert(resp.iv_reduced_working_hours)],
                                    ['Energy supply issues create uncertainty in daily planning', formatLikert(resp.iv_daily_uncertainty)],
                                    ['The energy crisis increases dependence on backup power systems', formatLikert(resp.iv_backup_dependence)],
                                    ['Energy-related policies restrict business flexibility', formatLikert(resp.iv_policy_flexibility)],
                                  ]}
                                />

                                {resp.role === 'owner_manager' && (
                                  <ResponseSection
                                    title="Business Impact"
                                    rows={[
                                      ['Operational cost increase level', formatLabel(resp.business_cost_increase_level)],
                                      ['Sales decrease level', formatLabel(resp.business_sales_decrease_level)],
                                      ['Operational costs have increased due to the energy crisis', formatLikert(resp.business_cost_increase)],
                                      ['Daily sales have decreased due to reduced business hours', formatLikert(resp.business_sales_reduced_hours)],
                                      ['Profit margins have declined', formatLikert(resp.business_profit_margin_decline)],
                                      ['Customer flow has decreased during evening hours', formatLikert(resp.business_evening_customer_flow)],
                                      ['Inventory management (refrigeration/storage) has become difficult', formatLikert(resp.business_inventory_difficulty)],
                                      ['Maintenance costs for backup systems have increased', formatLikert(resp.business_backup_maintenance_cost)],
                                    ]}
                                  />
                                )}

                                {resp.role === 'floor_employee' && (
                                  <ResponseSection
                                    title="Employee Impact"
                                    rows={[
                                      ['Workload change', formatLabel(resp.employee_workload_change)],
                                      ['The energy crisis has increased my work stress', formatLikert(resp.employee_work_stress)],
                                      ['My work efficiency has decreased', formatLikert(resp.employee_efficiency_decrease)],
                                      ['Power-related issues make my job more difficult', formatLikert(resp.employee_job_difficulty)],
                                      ['Customer handling becomes more difficult during disruptions', formatLikert(resp.employee_customer_handling)],
                                      ['The working environment becomes uncomfortable during outages', formatLikert(resp.employee_uncomfortable_environment)],
                                      ['My daily work routine has been disrupted', formatLikert(resp.employee_routine_disruption)],
                                      ['I feel less motivated to work under current conditions', formatLikert(resp.employee_low_motivation)],
                                    ]}
                                  />
                                )}

                                <ResponseSection
                                  title="Policy Perception & Mitigation"
                                  rows={[
                                    ['Energy-saving policies are necessary for the current situation', formatLikert(resp.policy_necessary)],
                                    ['These policies negatively affect business performance', formatLikert(resp.policy_business_negative)],
                                    ['A balance between energy saving and economic activity is needed', formatLikert(resp.policy_balance_needed)],
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

        {editingResponse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/70 bg-white p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Edit Response
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Response #{editingResponse.id}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-6">
                <EditSection
                  title="Profile & Demographics"
                  fields={[
                    {
                      label: 'Role',
                      name: 'role',
                      type: 'select',
                      options: ROLE_OPTIONS,
                    },
                    {
                      label: 'Supermarket Type',
                      name: 'supermarket_type',
                      type: 'select',
                      options: SUPERMARKET_OPTIONS,
                    },
                    {
                      label: 'Location',
                      name: 'location',
                      type: 'select',
                      options: LOCATION_OPTIONS,
                    },
                    {
                      label: 'Primary Backup Power Source',
                      name: 'backup_power_source',
                      type: 'select',
                      options: BACKUP_OPTIONS,
                    },
                    {
                      label: 'Years in Business/Service',
                      name: 'years_in_service',
                      type: 'select',
                      options: YEARS_OPTIONS,
                    },
                  ]}
                  values={editForm}
                  onChange={handleEditChange}
                />

                <EditSection
                  title="Energy Crisis Factors"
                  fields={[
                    { label: 'Frequent electricity interruptions affect daily operations', name: 'iv_power_interruptions', type: 'likert' },
                    { label: 'Power outages last for long durations and disrupt service', name: 'iv_outage_duration', type: 'likert' },
                    { label: 'Lack of stable electricity affects business continuity', name: 'iv_unstable_electricity', type: 'likert' },
                    { label: 'Rising fuel/oil prices increase operational pressure', name: 'iv_fuel_price_pressure', type: 'likert' },
                    { label: 'Electricity tariff increases make utility costs difficult to manage', name: 'iv_tariff_pressure', type: 'likert' },
                    { label: 'Early shop closure policies restrict profitable business hours', name: 'iv_early_closure', type: 'likert' },
                    { label: 'Reduced working hours (9–4) limit customer flow', name: 'iv_reduced_working_hours', type: 'likert' },
                    { label: 'Energy supply issues create uncertainty in daily planning', name: 'iv_daily_uncertainty', type: 'likert' },
                    { label: 'The energy crisis increases dependence on backup power systems', name: 'iv_backup_dependence', type: 'likert' },
                    { label: 'Energy-related policies restrict business flexibility', name: 'iv_policy_flexibility', type: 'likert' },
                  ]}
                  values={editForm}
                  onChange={handleEditChange}
                />

                {editForm.role === 'owner_manager' && (
                  <EditSection
                    title="Business Impact"
                    fields={[
                      { label: 'Operational cost increase level', name: 'business_cost_increase_level', type: 'select', options: LEVEL_OPTIONS },
                      { label: 'Sales decrease level', name: 'business_sales_decrease_level', type: 'select', options: SALES_OPTIONS },
                      { label: 'Operational costs have increased due to the energy crisis', name: 'business_cost_increase', type: 'likert' },
                      { label: 'Daily sales have decreased due to reduced business hours', name: 'business_sales_reduced_hours', type: 'likert' },
                      { label: 'Profit margins have declined', name: 'business_profit_margin_decline', type: 'likert' },
                      { label: 'Customer flow has decreased during evening hours', name: 'business_evening_customer_flow', type: 'likert' },
                      { label: 'Inventory management (refrigeration/storage) has become difficult', name: 'business_inventory_difficulty', type: 'likert' },
                      { label: 'Maintenance costs for backup systems have increased', name: 'business_backup_maintenance_cost', type: 'likert' },
                    ]}
                    values={editForm}
                    onChange={handleEditChange}
                  />
                )}

                {editForm.role === 'floor_employee' && (
                  <EditSection
                    title="Employee Impact"
                    fields={[
                      { label: 'Workload change', name: 'employee_workload_change', type: 'select', options: WORKLOAD_OPTIONS },
                      { label: 'The energy crisis has increased my work stress', name: 'employee_work_stress', type: 'likert' },
                      { label: 'My work efficiency has decreased', name: 'employee_efficiency_decrease', type: 'likert' },
                      { label: 'Power-related issues make my job more difficult', name: 'employee_job_difficulty', type: 'likert' },
                      { label: 'Customer handling becomes more difficult during disruptions', name: 'employee_customer_handling', type: 'likert' },
                      { label: 'The working environment becomes uncomfortable during outages', name: 'employee_uncomfortable_environment', type: 'likert' },
                      { label: 'My daily work routine has been disrupted', name: 'employee_routine_disruption', type: 'likert' },
                      { label: 'I feel less motivated to work under current conditions', name: 'employee_low_motivation', type: 'likert' },
                    ]}
                    values={editForm}
                    onChange={handleEditChange}
                  />
                )}

                <EditSection
                  title="Policy Perception & Mitigation"
                  fields={[
                    { label: 'Energy-saving policies are necessary for the current situation', name: 'policy_necessary', type: 'likert' },
                    { label: 'These policies negatively affect business performance', name: 'policy_business_negative', type: 'likert' },
                    { label: 'A balance between energy saving and economic activity is needed', name: 'policy_balance_needed', type: 'likert' },
                    { label: 'Preferred policy solution', name: 'policy_preferred_solution', type: 'select', options: POLICY_OPTIONS },
                  ]}
                  values={editForm}
                  onChange={handleEditChange}
                />
              </div>

              <div className="mt-8 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={savingEdit}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEditedResponse}
                  disabled={savingEdit}
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-dark disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
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

function EditSection({ title, fields, values, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50">
      <div className="border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">
          {title}
        </h3>
      </div>

      <div className="grid gap-4 p-4">
        {fields.map((field) => (
          <div key={field.name} className="grid gap-2">
            <label className="text-sm font-medium text-slate-700">{field.label}</label>

            {field.type === 'select' ? (
              <select
                value={values[field.name] ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary"
              >
                <option value="">Select</option>
                {field.options.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={values[field.name] ?? 3}
                onChange={(e) => onChange(field.name, Number(e.target.value))}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-primary"
              >
                {LIKERT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
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

function formatLikert(value) {
  const likertMap = {
    1: 'Strongly Agree',
    2: 'Agree',
    3: 'Neutral',
    4: 'Disagree',
    5: 'Strongly Disagree',
  };
  return likertMap[value] || value || '—';
}
