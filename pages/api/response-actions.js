import cookie from 'cookie';
import { pool } from '../../lib/db';

const EDITABLE_FIELDS = [
  'role',
  'supermarket_type',
  'location',
  'backup_power_source',
  'years_in_service',

  'iv_power_interruptions',
  'iv_outage_duration',
  'iv_unstable_electricity',
  'iv_fuel_price_pressure',
  'iv_tariff_pressure',
  'iv_early_closure',
  'iv_reduced_working_hours',
  'iv_daily_uncertainty',
  'iv_backup_dependence',
  'iv_policy_flexibility',

  'business_cost_increase_level',
  'business_sales_decrease_level',
  'business_cost_increase',
  'business_sales_reduced_hours',
  'business_profit_margin_decline',
  'business_evening_customer_flow',
  'business_inventory_difficulty',
  'business_backup_maintenance_cost',

  'employee_workload_change',
  'employee_work_stress',
  'employee_efficiency_decrease',
  'employee_job_difficulty',
  'employee_customer_handling',
  'employee_uncomfortable_environment',
  'employee_routine_disruption',
  'employee_low_motivation',

  'policy_necessary',
  'policy_business_negative',
  'policy_balance_needed',
  'policy_preferred_solution',
];

const INTEGER_FIELDS = new Set([
  'iv_power_interruptions',
  'iv_outage_duration',
  'iv_unstable_electricity',
  'iv_fuel_price_pressure',
  'iv_tariff_pressure',
  'iv_early_closure',
  'iv_reduced_working_hours',
  'iv_daily_uncertainty',
  'iv_backup_dependence',
  'iv_policy_flexibility',

  'business_cost_increase',
  'business_sales_reduced_hours',
  'business_profit_margin_decline',
  'business_evening_customer_flow',
  'business_inventory_difficulty',
  'business_backup_maintenance_cost',

  'employee_work_stress',
  'employee_efficiency_decrease',
  'employee_job_difficulty',
  'employee_customer_handling',
  'employee_uncomfortable_environment',
  'employee_routine_disruption',
  'employee_low_motivation',

  'policy_necessary',
  'policy_business_negative',
  'policy_balance_needed',
]);

function sanitizeUpdates(updates = {}) {
  const cleaned = {};

  for (const [key, value] of Object.entries(updates)) {
    if (!EDITABLE_FIELDS.includes(key)) continue;

    if (INTEGER_FIELDS.has(key)) {
      const num = Number(value);
      if ([1, 2, 3, 4, 5].includes(num)) {
        cleaned[key] = num;
      }
      continue;
    }

    cleaned[key] = value === null || value === undefined ? '' : String(value);
  }

  return cleaned;
}

export default async function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.admin_token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'PATCH') {
      const { id, ids, is_reviewed, updates } = req.body;

      if (typeof is_reviewed === 'boolean') {
        if (Array.isArray(ids) && ids.length > 0) {
          const { rows } = await pool.query(
            'UPDATE responses SET is_reviewed = $1 WHERE id = ANY($2::int[]) RETURNING *;',
            [is_reviewed, ids]
          );
          return res.status(200).json({ success: true, data: rows });
        }

        if (!id) {
          return res.status(400).json({ error: 'Missing id or ids' });
        }

        const { rows } = await pool.query(
          'UPDATE responses SET is_reviewed = $1 WHERE id = $2 RETURNING *;',
          [is_reviewed, id]
        );

        return res.status(200).json({ success: true, data: rows[0] });
      }

      if (id && updates && typeof updates === 'object') {
        const cleaned = sanitizeUpdates(updates);
        const fields = Object.keys(cleaned);

        if (!fields.length) {
          return res.status(400).json({ error: 'No valid fields to update' });
        }

        const setClause = fields
          .map((field, index) => `"${field}" = $${index + 1}`)
          .join(', ');

        const values = fields.map((field) => cleaned[field]);
        values.push(id);

        const query = `
          UPDATE responses
          SET ${setClause}
          WHERE id = $${values.length}
          RETURNING *;
        `;

        const { rows } = await pool.query(query, values);
        return res.status(200).json({ success: true, data: rows[0] });
      }

      return res.status(400).json({ error: 'Invalid PATCH payload' });
    }

    if (req.method === 'DELETE') {
      const { id, ids } = req.body;

      if (Array.isArray(ids) && ids.length > 0) {
        const { rows } = await pool.query(
          'DELETE FROM responses WHERE id = ANY($1::int[]) RETURNING id;',
          [ids]
        );
        return res.status(200).json({ success: true, data: rows });
      }

      if (!id) {
        return res.status(400).json({ error: 'Missing id or ids' });
      }

      const { rows } = await pool.query(
        'DELETE FROM responses WHERE id = $1 RETURNING id;',
        [id]
      );

      return res.status(200).json({ success: true, data: rows[0] });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Action failed' });
  }
}
