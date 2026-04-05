const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function saveResponse(data) {
  const {
    role,
    supermarket_type,
    location,
    backup_power_source,
    years_in_service,

    iv_power_interruptions,
    iv_outage_duration,
    iv_unstable_electricity,
    iv_fuel_price_pressure,
    iv_tariff_pressure,
    iv_early_closure,
    iv_reduced_working_hours,
    iv_daily_uncertainty,
    iv_backup_dependence,
    iv_policy_flexibility,

    business_cost_increase_level,
    business_sales_decrease_level,
    business_cost_increase,
    business_sales_reduced_hours,
    business_profit_margin_decline,
    business_evening_customer_flow,
    business_inventory_difficulty,
    business_backup_maintenance_cost,

    employee_workload_change,
    employee_work_stress,
    employee_efficiency_decrease,
    employee_job_difficulty,
    employee_customer_handling,
    employee_uncomfortable_environment,
    employee_routine_disruption,
    employee_low_motivation,

    policy_necessary,
    policy_business_negative,
    policy_balance_needed,
    policy_preferred_solution,

    ip_hash,
  } = data;

  const query = `INSERT INTO responses (
    role, supermarket_type, location, backup_power_source, years_in_service,
    iv_power_interruptions, iv_outage_duration, iv_unstable_electricity, iv_fuel_price_pressure, iv_tariff_pressure,
    iv_early_closure, iv_reduced_working_hours, iv_daily_uncertainty, iv_backup_dependence, iv_policy_flexibility,
    business_cost_increase_level, business_sales_decrease_level, business_cost_increase, business_sales_reduced_hours,
    business_profit_margin_decline, business_evening_customer_flow, business_inventory_difficulty, business_backup_maintenance_cost,
    employee_workload_change, employee_work_stress, employee_efficiency_decrease, employee_job_difficulty,
    employee_customer_handling, employee_uncomfortable_environment, employee_routine_disruption, employee_low_motivation,
    policy_necessary, policy_business_negative, policy_balance_needed, policy_preferred_solution,
    ip_hash
  ) VALUES (
    $1, $2, $3, $4, $5,
    $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15,
    $16, $17, $18, $19,
    $20, $21, $22, $23,
    $24, $25, $26, $27,
    $28, $29, $30, $31,
    $32, $33, $34, $35,
    $36
  ) RETURNING *;`;

  const values = [
    role,
    supermarket_type,
    location,
    backup_power_source,
    years_in_service,

    iv_power_interruptions,
    iv_outage_duration,
    iv_unstable_electricity,
    iv_fuel_price_pressure,
    iv_tariff_pressure,

    iv_early_closure,
    iv_reduced_working_hours,
    iv_daily_uncertainty,
    iv_backup_dependence,
    iv_policy_flexibility,

    business_cost_increase_level,
    business_sales_decrease_level,
    business_cost_increase,
    business_sales_reduced_hours,
    business_profit_margin_decline,
    business_evening_customer_flow,
    business_inventory_difficulty,
    business_backup_maintenance_cost,

    employee_workload_change,
    employee_work_stress,
    employee_efficiency_decrease,
    employee_job_difficulty,
    employee_customer_handling,
    employee_uncomfortable_environment,
    employee_routine_disruption,
    employee_low_motivation,

    policy_necessary,
    policy_business_negative,
    policy_balance_needed,
    policy_preferred_solution,

    ip_hash,
  ];

  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAllResponses() {
  const { rows } = await pool.query('SELECT * FROM responses ORDER BY submitted_at DESC;');
  return rows;
}

module.exports = {
  pool,
  saveResponse,
  getAllResponses,
};